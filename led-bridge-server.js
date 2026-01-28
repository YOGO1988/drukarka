#!/usr/bin/env node

/**
 * LED Bridge Server - Huidu HD-A4L Integration
 *
 * Bridges HTTP requests from browser to Huidu LED controller TCP protocol
 * Based on Huidu SDK: https://github.com/huidutech/sdk
 */

const http = require('http');
const net = require('net');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const CONFIG = {
    HTTP_PORT: 3000,
    LED_IP: '169.254.193.67',
    LED_PORT: 9527,
    TEMP_DIR: './temp_images'
};

// Huidu Protocol Constants (from FileServices.cs)
const HCmdType = {
    kFileStartAsk: 0x3001,
    kFileStartAnswer: 0x3002,
    kFileContentAsk: 0x3003,
    kFileContentAnswer: 0x3004,
    kFileEndAnswer: 0x3006
};

const HFileType = {
    kImageFile: 0,
    kVideoFile: 1,
    kFont: 2,
    kFireware: 3,
    kFPGAConfig: 4,
    kSettingConfig: 5
};

// Ensure temp directory exists
if (!fs.existsSync(CONFIG.TEMP_DIR)) {
    fs.mkdirSync(CONFIG.TEMP_DIR);
}

/**
 * Convert base64 data URL to buffer
 */
function dataURLToBuffer(dataURL) {
    const base64Data = dataURL.replace(/^data:image\/\w+;base64,/, '');
    return Buffer.from(base64Data, 'base64');
}

/**
 * Calculate MD5 hash of buffer
 */
function getMD5(buffer) {
    return crypto.createHash('md5').update(buffer).digest('hex');
}

/**
 * Write short (2 bytes) to buffer
 */
function writeShort(buffer, offset, value) {
    buffer.writeUInt16LE(value, offset);
    return offset + 2;
}

/**
 * Write long (8 bytes) to buffer
 */
function writeLong(buffer, offset, value) {
    buffer.writeBigUInt64LE(BigInt(value), offset);
    return offset + 8;
}

/**
 * Write string to buffer (null-terminated)
 */
function writeString(buffer, offset, str, maxLength = null) {
    const bytes = Buffer.from(str, 'utf8');
    const length = maxLength ? Math.min(bytes.length, maxLength - 1) : bytes.length;
    bytes.copy(buffer, offset, 0, length);
    buffer[offset + length] = 0; // null terminator
    return offset + length + 1;
}

/**
 * Send file to LED controller via TCP
 */
async function sendFileToLED(imageBuffer, ledIP, ledPort, filename = 'display.png') {
    return new Promise((resolve, reject) => {
        const md5 = getMD5(imageBuffer);
        const fileSize = imageBuffer.length;

        console.log(`Sending file: ${filename}`);
        console.log(`Size: ${fileSize} bytes, MD5: ${md5}`);
        console.log(`Target LED: ${ledIP}:${ledPort}`);

        const socket = net.createConnection({
            host: ledIP,
            port: ledPort
        }, () => {
            console.log(`Connected to LED controller at ${ledIP}:${ledPort}`);

            // Send FileStartAsk packet
            const startPacket = Buffer.alloc(1024);
            let offset = 2; // Reserve first 2 bytes for length

            // Command type
            offset = writeShort(startPacket, offset, HCmdType.kFileStartAsk);

            // MD5 hash (33 bytes with null terminator)
            offset = writeString(startPacket, offset, md5, 33);

            // File size (8 bytes)
            offset = writeLong(startPacket, offset, fileSize);

            // File type (2 bytes) - kImageFile
            offset = writeShort(startPacket, offset, HFileType.kImageFile);

            // Filename (null-terminated)
            offset = writeString(startPacket, offset, filename);

            // Write packet length at start
            writeShort(startPacket, 0, offset);

            console.log(`Sending FileStartAsk packet (${offset} bytes)`);
            // Debug: Show hex dump of first 64 bytes
            console.log('Packet hex:', startPacket.slice(0, Math.min(offset, 64)).toString('hex'));
            socket.write(startPacket.slice(0, offset));
        });

        let receivedData = Buffer.alloc(0);
        let dataReceived = false;

        socket.on('data', (data) => {
            dataReceived = true;
            receivedData = Buffer.concat([receivedData, data]);
            console.log(`✅ Received ${data.length} bytes from LED controller`);
            console.log('Response hex:', data.toString('hex'));

            // Check if we have at least packet length
            if (receivedData.length >= 2) {
                const packetLength = receivedData.readUInt16LE(0);

                if (receivedData.length >= packetLength) {
                    const commandType = receivedData.readUInt16LE(2);

                    if (commandType === HCmdType.kFileStartAnswer) {
                        console.log('Received FileStartAnswer - sending content...');

                        // Read existing file size from response (offset if resuming)
                        const existingSize = receivedData.length >= 12 ? Number(receivedData.readBigUInt64LE(4)) : 0;
                        console.log(`Existing size on controller: ${existingSize}`);

                        // Send file content
                        const MAX_PACKET_SIZE = 60000; // Conservative TCP packet size
                        let contentOffset = existingSize;

                        while (contentOffset < fileSize) {
                            const chunkSize = Math.min(MAX_PACKET_SIZE - 8, fileSize - contentOffset);
                            const contentPacket = Buffer.alloc(chunkSize + 8);

                            let idx = 0;
                            idx = writeShort(contentPacket, idx, chunkSize + 8); // Packet length
                            idx = writeShort(contentPacket, idx, HCmdType.kFileContentAsk); // Command
                            idx = writeShort(contentPacket, idx, chunkSize); // Content length

                            // Copy image data
                            imageBuffer.copy(contentPacket, idx, contentOffset, contentOffset + chunkSize);

                            socket.write(contentPacket);
                            contentOffset += chunkSize;

                            console.log(`Sent chunk: ${contentOffset}/${fileSize} bytes`);
                        }

                        console.log('File content sent completely');

                    } else if (commandType === HCmdType.kFileEndAnswer) {
                        console.log('Received FileEndAnswer - transfer complete!');
                        socket.end();
                        resolve({ success: true, message: 'File sent successfully' });
                    } else if (commandType === HCmdType.kFileContentAnswer) {
                        console.log('Received FileContentAnswer - chunk acknowledged');
                        // Continue sending (handled in FileStartAnswer flow)
                    } else {
                        console.log(`Received unknown command: 0x${commandType.toString(16)}`);
                    }

                    // Remove processed packet
                    receivedData = receivedData.slice(packetLength);
                }
            }
        });

        socket.on('error', (err) => {
            console.error('❌ Socket error:', err.message);
            reject(err);
        });

        socket.on('close', () => {
            if (!dataReceived) {
                console.warn('⚠️  Connection closed WITHOUT receiving any response from LED!');
                console.warn('   Possible causes:');
                console.warn('   1. LED controller not in Asynchronous mode (check HDPlayer)');
                console.warn('   2. LED controller firewall blocking incoming connections');
                console.warn('   3. Protocol requires additional initialization (GUID/Session ID)');
                console.warn('   4. LED controller requires active program/playlist');
            } else {
                console.log('Connection closed normally');
            }
        });

        // Timeout after 30 seconds
        socket.setTimeout(30000, () => {
            console.error('⏱️  Connection timeout - LED controller did not respond within 30 seconds');
            socket.destroy();
            reject(new Error('Connection timeout - LED controller not responding'));
        });
    });
}

/**
 * HTTP Server - receives images from browser
 */
const server = http.createServer(async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/send-to-led') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const data = JSON.parse(body);

                if (!data.image) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Missing image data' }));
                    return;
                }

                // Get LED IP and port from request (or use defaults)
                const ledIP = data.ledIP || CONFIG.LED_IP;
                const ledPort = data.ledPort || CONFIG.LED_PORT;

                // Convert data URL to buffer
                const imageBuffer = dataURLToBuffer(data.image);
                console.log(`Received image from browser: ${imageBuffer.length} bytes`);

                // Save to temp file for debugging
                const tempFile = path.join(CONFIG.TEMP_DIR, `led_${Date.now()}.png`);
                fs.writeFileSync(tempFile, imageBuffer);
                console.log(`Saved temp file: ${tempFile}`);

                // Send to LED controller with dynamic IP/port
                const result = await sendFileToLED(imageBuffer, ledIP, ledPort, 'display.png');

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));

            } catch (error) {
                console.error('Error processing request:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });

    } else if (req.method === 'GET' && req.url === '/status') {
        // Health check endpoint
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'running',
            message: 'Bridge server ready. LED IP/Port configured in HTML.'
        }));

    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(CONFIG.HTTP_PORT, () => {
    console.log('='.repeat(60));
    console.log('LED Bridge Server - Huidu HD-A4L Integration');
    console.log('='.repeat(60));
    console.log(`HTTP Server: http://localhost:${CONFIG.HTTP_PORT}`);
    console.log(`LED IP/Port: Configured in HTML (dynamic)`);
    console.log('');
    console.log('Endpoints:');
    console.log(`  POST /send-to-led - Send image to LED display`);
    console.log(`       Body: {image, ledIP, ledPort}`);
    console.log(`  GET  /status - Check server status`);
    console.log('='.repeat(60));
    console.log('Waiting for requests from browser...');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
