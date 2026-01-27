const dgram = require('dgram');
const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const os = require('os');

console.log('🏃 YO&GO MiniTrack → Spiker Bridge v1.2 (Multi-device)');
console.log('=====================================================');

let tagReads = [];
let tagStatus = [];
let readCount = 0;
let statusCount = 0;
let allPacketsReceived = 0;

// WebSocket clients (aplikacje spikera)
let wsClients = [];
let wsConnections = 0;

// KONFIGURACJA - dodaj tutaj IP swoich urządzeń MiniTrack
const ALLOWED_MINITRACK_IPS = [
    '172.20.23.75',  // przykład - pierwsze urządzenie
    '192.168.1.100', // przykład - drugie urządzenie  
    '10.0.0.50',     // przykład - trzecie urządzenie
    // Dodaj więcej IP według potrzeb
];

// Alternatywnie: akceptuj wszystkie IP (mniej bezpieczne)
const ACCEPT_ALL_IPS = true; // zmień na false jeśli chcesz ograniczyć do listy wyżej

// Statistics z informacją o urządzeniach
let stats = {
    startTime: new Date(),
    totalPackets: 0,
    tagReads: 0,
    tagStatus: 0,
    activeTags: new Set(),
    lastActivity: null,
    devices: new Map() // śledzenie urządzeń
};

// Get local IP address - prefer WiFi/LAN over APIPA
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    const validIPs = [];
    
    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            if (interface.family === 'IPv4' && !interface.internal) {
                // Pomiń APIPA (169.254.x.x)
                if (!interface.address.startsWith('169.254.')) {
                    validIPs.push({
                        name: name,
                        address: interface.address
                    });
                }
            }
        }
    }
    
    // Preferuj WiFi jeśli dostępne
    const wifiIP = validIPs.find(ip => 
        ip.name.toLowerCase().includes('wi-fi') || 
        ip.name.toLowerCase().includes('wireless') ||
        ip.name.toLowerCase().includes('wlan')
    );
    
    if (wifiIP) {
        console.log(`🌐 Using WiFi IP: ${wifiIP.address} (${wifiIP.name})`);
        return wifiIP.address;
    }
    
    // Jeśli nie ma WiFi, użyj pierwszego dostępnego
    if (validIPs.length > 0) {
        console.log(`🌐 Using IP: ${validIPs[0].address} (${validIPs[0].name})`);
        return validIPs[0].address;
    }
    
    console.log('⚠️  WARNING: No valid IP found! Using fallback 192.168.1.100');
    return '192.168.1.100'; // fallback
}

const LOCAL_IP = getLocalIP();

// Sprawdź czy IP jest dozwolony
function isAllowedIP(ip) {
    if (ACCEPT_ALL_IPS) {
        return true;
    }
    return ALLOWED_MINITRACK_IPS.includes(ip);
}

// Śledzenie urządzeń
function trackDevice(sourceInfo) {
    const deviceKey = `${sourceInfo.address}:${sourceInfo.port}`;
    
    if (!stats.devices.has(deviceKey)) {
        stats.devices.set(deviceKey, {
            ip: sourceInfo.address,
            port: sourceInfo.port,
            firstSeen: new Date(),
            lastSeen: new Date(),
            packetCount: 0,
            tagReads: 0,
            statusMessages: 0
        });
        console.log(`🆕 NEW MINITRACK DEVICE: ${deviceKey}`);
    }
    
    const device = stats.devices.get(deviceKey);
    device.lastSeen = new Date();
    device.packetCount++;
    
    return device;
}

// Parse MiniTrack data packet
function parseTagData(dataStr, sourceInfo) {
    // Sprawdź czy IP jest dozwolony
    if (!isAllowedIP(sourceInfo.address)) {
        console.log(`🚫 BLOCKED packet from unauthorized IP: ${sourceInfo.address}`);
        return null;
    }
    
    const timestamp = new Date().toISOString();
    allPacketsReceived++;
    stats.totalPackets++;
    
    // Śledź urządzenie
    const device = trackDevice(sourceInfo);
    
    console.log('\n' + '='.repeat(60));
    console.log(`📦 PACKET #${allPacketsReceived} from ${sourceInfo.address}:${sourceInfo.port}`);
    console.log('='.repeat(60));
    console.log(`Raw: "${dataStr}"`);
    
    // Status message: STS:TAG IN FIELD:441:1753132502.033742
    if (dataStr.startsWith('STS:TAG IN FIELD:')) {
        const match = dataStr.match(/STS:TAG IN FIELD:(\d+):(\d+\.\d+)/);
        if (match) {
            const tagNumber = parseInt(match[1]);
            const minitrackTime = parseFloat(match[2]);
            
            statusCount++;
            stats.tagStatus++;
            stats.activeTags.add(tagNumber);
            stats.lastActivity = timestamp;
            device.statusMessages++;
            
            const statusEntry = {
                id: statusCount,
                timestamp: timestamp,
                type: 'STATUS',
                tagNumber: tagNumber,
                minitrackTimestamp: minitrackTime,
                humanTime: convertMiniTrackTime(minitrackTime),
                source: sourceInfo,
                deviceId: `${sourceInfo.address}:${sourceInfo.port}`
            };
            
            tagStatus.push(statusEntry);
            
            console.log(`📍 TAG #${tagNumber} STATUS: IN FIELD (device: ${statusEntry.deviceId})`);
            console.log(`   Time: ${statusEntry.humanTime}`);
            
            // *** NATYCHMIASTOWE WYSYŁANIE DO SPIKERA! ***
            // Nie czekaj na pakiet "P", wyślij od razu!
            const now = new Date();
            const timeNow = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
            
            const speakerData = {
                type: 'ccs_reading',
                tag: tagNumber.toString(),
                time: timeNow,
                timestamp: new Date().toISOString(),
                source: 'MiniTrack',
                device: statusEntry.deviceId,
                note: 'Immediate from TAG IN FIELD status'
            };
            
            console.log(`🚀 NATYCHMIASTOWE wysłanie TAG #${tagNumber} do spikera!`);
            broadcastToSpeakers(speakerData);
            
            return statusEntry;
        }
    }
    
    // Data packet: P,441,450201b9,8,12ABA2,5,1753132505.55,-37,112,253
    else if (dataStr.startsWith('P,')) {
        const parts = dataStr.split(',');
        if (parts.length >= 10) {
            readCount++;
            stats.tagReads++;
            device.tagReads++;
            
            const tagNumber = parseInt(parts[1]);
            const hexId = parts[2];
            const channel = parseInt(parts[3]);
            const readerId = parts[4];
            const sequence = parseInt(parts[5]);
            const minitrackTime = parseFloat(parts[6]);
            const signalStrength = parseInt(parts[7]);
            const antenna = parseInt(parts[8]);
            const extra = parseInt(parts[9]);
            
            stats.activeTags.add(tagNumber);
            stats.lastActivity = timestamp;
            
            // Signal quality analysis
            let signalQuality = 'Unknown';
            if (signalStrength >= -40) signalQuality = 'Excellent';
            else if (signalStrength >= -55) signalQuality = 'Good';
            else if (signalStrength >= -70) signalQuality = 'Fair';
            else signalQuality = 'Poor';
            
            const readEntry = {
                id: readCount,
                timestamp: timestamp,
                type: 'READ',
                tagNumber: tagNumber,
                hexId: hexId,
                channel: channel,
                readerId: readerId,
                sequence: sequence,
                minitrackTimestamp: minitrackTime,
                signalStrength: signalStrength,
                signalQuality: signalQuality,
                antenna: antenna,
                extra: extra,
                humanTime: convertMiniTrackTime(minitrackTime),
                source: sourceInfo,
                deviceId: `${sourceInfo.address}:${sourceInfo.port}`
            };
            
            tagReads.push(readEntry);
            
            // DODAJ DOKŁADNY LOG CZASU
            const now = new Date();
            const nowStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}.${String(now.getMilliseconds()).padStart(3,'0')}`;
            
            console.log(`🏷️  TAG #${tagNumber} read from device ${readEntry.deviceId}:`);
            console.log(`   🕐 MiniTrack czas: ${readEntry.humanTime}`);
            console.log(`   🕐 Bridge odebrał: ${nowStr} (TERAZ)`);
            console.log(`   Signal: ${signalStrength}dBm (${signalQuality})`);
            console.log(`   Antenna: ${antenna}, Sequence: ${sequence}`);
            
            // *** NATYCHMIASTOWE WYSYŁANIE ***
            const beforeSend = Date.now();
            const speakerData = convertToSpeakerFormat(tagNumber, readEntry.humanTime, readEntry.deviceId);
            broadcastToSpeakers(speakerData);
            const afterSend = Date.now();
            
            console.log(`   ⚡ Wysłanie do spikera zajęło: ${afterSend - beforeSend}ms`);
            
            return readEntry;
        } else {
            console.log(`❌ P packet too short: ${parts.length} parts, need at least 10`);
        }
    }
    
    // Unknown format
    else if (!dataStr.startsWith('STS:ANT:OK') && !dataStr.startsWith('STS:TEMP:')) {
        console.log(`❓ UNKNOWN FORMAT from ${sourceInfo.address}: "${dataStr.substring(0, 20)}..."`);
    }
    
    return null;
}

// Convert to format expected by speaker app
function convertToSpeakerFormat(tagNumber, humanTime, deviceId) {
    // UŻYJ CZASU TERAZ zamiast timestampu z MiniTrack
    const now = new Date();
    const timeNow = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    
    // Format dla aplikacji spikera (symuluje CCS) z informacją o urządzeniu:
    return {
        type: 'ccs_reading',
        tag: tagNumber.toString(),
        time: timeNow, // CZAS TERAZ - NIE Z MINITRACK!
        timestamp: new Date().toISOString(),
        source: 'MiniTrack',
        device: deviceId, // informacja z którego urządzenia
        originalTime: humanTime // zachowaj oryginalny dla debugowania
    };
}

// Extract time from full timestamp
function extractTimeOnly(humanTime) {
    try {
        // humanTime format: "2025-07-21 21:30:32.820Z"
        // Extract: "21:30:32"
        const timePart = humanTime.split(' ')[1]; // "21:30:32.820Z"
        const timeOnly = timePart.split('.')[0];   // "21:30:32"
        return timeOnly;
    } catch (error) {
        console.error('Error extracting time:', error);
        return new Date().toLocaleTimeString('pl-PL', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
    }
}

// Convert MiniTrack timestamp to human readable LOCAL time
function convertMiniTrackTime(minitrackTimestamp) {
    try {
        const date = new Date(minitrackTimestamp * 1000);
        
        // Użyj czasu lokalnego zamiast UTC
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const ms = String(date.getMilliseconds()).padStart(3, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${ms}`;
    } catch (error) {
        return `Raw: ${minitrackTimestamp}`;
    }
}

// Broadcast to all speaker applications
// Broadcast to all speaker applications - ASYNC NON-BLOCKING
function broadcastToSpeakers(message) {
    if (wsClients.length === 0) {
        console.log(`⚠️  No speaker apps connected - data not sent`);
        return;
    }
    
    const sendTime = new Date().toISOString();
    const messageStr = JSON.stringify(message);
    
    console.log(`📤 [${sendTime}] SENDING to ${wsClients.length} speaker apps - TAG #${message.tag}`);
    
    // WYSYŁAJ ASYNCHRONICZNIE - nie blokuj przy wielu klientach
    let sentToClients = 0;
    wsClients.forEach((client, index) => {
        if (client.readyState === WebSocket.OPEN) {
            // setImmediate - wysyła natychmiast ale nie blokuje
            setImmediate(() => {
                try {
                    client.send(messageStr, (error) => {
                        if (error) {
                            console.log(`❌ Error sending to app ${index}: ${error.message}`);
                        }
                    });
                } catch (error) {
                    console.log(`❌ Error sending to app ${index}: ${error.message}`);
                }
            });
            sentToClients++;
        }
    });
    
    if (sentToClients > 0) {
        console.log(`✅ Queued for ${sentToClients} apps: TAG #${message.tag}`);
    }
}

// Create UDP server for MiniTrack data
const udpServer = dgram.createSocket('udp4');

udpServer.on('message', (data, rinfo) => {
    const udpReceiveTime = Date.now();
    const udpReceiveISO = new Date().toISOString();
    console.log(`\n📡 [${udpReceiveISO}] UDP PACKET RECEIVED from ${rinfo.address}:${rinfo.port}`);
    
    const dataStr = data.toString().trim();
    const parseStart = Date.now();
    parseTagData(dataStr, rinfo);
    const parseEnd = Date.now();
    
    console.log(`   ⚡ Processing took: ${parseEnd - parseStart}ms`);
});

udpServer.on('listening', () => {
    const address = udpServer.address();
    console.log(`📡 UDP Server listening on port ${address.port}`);
    if (ACCEPT_ALL_IPS) {
        console.log(`   Accepting packets from ANY IP address`);
    } else {
        console.log(`   Allowed MiniTrack IPs: ${ALLOWED_MINITRACK_IPS.join(', ')}`);
    }
});

udpServer.on('error', (error) => {
    console.error('❌ UDP Server error:', error.message);
    if (error.code === 'EADDRINUSE') {
        console.log('Port 10006 is already in use! Stop other MiniTrack programs first.');
        process.exit(1);
    }
});

// Bind UDP server to port 10006
udpServer.bind(10006, '0.0.0.0');

// Create HTTP server for web interface
const httpServer = http.createServer((req, res) => {
    if (req.url === '/') {
        const devicesList = Array.from(stats.devices.entries())
            .map(([key, device]) => `
                <div style="background: #f8f9fa; padding: 10px; margin: 5px 0; border-radius: 4px;">
                    <strong>${device.ip}:${device.port}</strong><br>
                    Packets: ${device.packetCount}, Reads: ${device.tagReads}, Status: ${device.statusMessages}<br>
                    Last seen: ${device.lastSeen.toLocaleTimeString()}
                </div>
            `).join('');

        const html = `<!DOCTYPE html>
<html>
<head>
    <title>🏃 MiniTrack → Spiker Bridge (Multi-device)</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1000px; margin: 0 auto; }
        .header { background: #FF8C00; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
        .connection-info { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .ip-box { background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #007bff; }
        .devices-box { background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #10b981; }
        .status { color: #27ae60; font-weight: bold; }
        .error { color: #e74c3c; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏃 MiniTrack → Spiker Bridge v1.2</h1>
            <p>Multi-device support - Automatyczny system przekazywania danych tagów</p>
        </div>
        
        <div class="connection-info">
            <h3>📱 INSTRUKCJE dla aplikacji spikera:</h3>
            <div class="ip-box">
                <strong>🌐 IP tego komputera: ${LOCAL_IP}</strong><br>
                <strong>🔌 Port WebSocket: 8081</strong><br><br>
                
                <strong>W aplikacji spikera wpisz:</strong><br>
                • IP komputera z CCS: <code>${LOCAL_IP}</code><br>
                • Port CCS: <code>8081</code><br>
                • Kliknij "Połącz z CCS"<br><br>
                
                <strong>Status:</strong><br>
                • UDP (MiniTrack): <span class="status">✅ Nasłuchuje na porcie 10006</span><br>
                • WebSocket (Spiker): <span class="status">✅ Dostępny na ${LOCAL_IP}:8081</span><br>
                • Połączone aplikacje: <span id="clientCount">${wsConnections}</span><br>
                • Tryb IP: <span class="status">${ACCEPT_ALL_IPS ? '✅ Akceptuje wszystkie IP' : '🔒 Tylko dozwolone IP'}</span>
            </div>
            
            <div class="devices-box">
                <h4>📱 Wykryte urządzenia MiniTrack:</h4>
                ${devicesList || '<em>Jeszcze nie wykryto żadnych urządzeń</em>'}
            </div>
        </div>
    </div>

    <script>
        const ws = new WebSocket('ws://' + window.location.hostname + ':8081');
        
        ws.onopen = function() {
            console.log('WebSocket connected');
        };
        
        ws.onmessage = function(event) {
            const data = JSON.parse(event.data);
            console.log('Received:', data);
        };
        
        ws.onerror = function(error) {
            console.error('WebSocket error:', error);
        };
        
        ws.onclose = function() {
            console.log('WebSocket disconnected');
        };
        
        // Auto-refresh page every 30 seconds to show updated device list
        setTimeout(() => window.location.reload(), 30000);
    </script>
</body>
</html>`;
        
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

// Create WebSocket server for speaker applications
const wsServer = new WebSocket.Server({ 
    server: httpServer,
    path: '/'
});

wsServer.on('connection', (ws, req) => {
    wsConnections++;
    const clientIP = req.socket.remoteAddress;
    wsClients.push(ws);
    
    console.log(`🎤 Speaker app connected from ${clientIP}`);
    console.log(`   Active speaker apps: ${wsConnections}`);
    
    // Send welcome message
    ws.send(JSON.stringify({
        type: 'system',
        message: 'Connected to MiniTrack → Spiker Bridge v1.2 (Multi-device)',
        timestamp: new Date().toISOString(),
        version: '1.2',
        serverIP: LOCAL_IP,
        multiDevice: true
    }));
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log(`📨 Speaker app message:`, data);
        } catch (e) {
            console.log(`📨 Speaker app message: ${message}`);
        }
    });
    
    ws.on('close', () => {
        wsConnections--;
        const index = wsClients.indexOf(ws);
        if (index > -1) {
            wsClients.splice(index, 1);
        }
        console.log(`🎤 Speaker app disconnected`);
        console.log(`   Remaining speaker apps: ${wsConnections}`);
    });
    
    ws.on('error', (error) => {
        console.log(`❌ Speaker app WebSocket error: ${error.message}`);
    });
});

// Start HTTP server with WebSocket
httpServer.listen(8081, '0.0.0.0', () => {
    console.log(`🌐 WebSocket Server for speaker apps running on ALL interfaces:`);
    console.log(`   - Local: http://localhost:8081`);
    console.log(`   - Network: http://${LOCAL_IP}:8081`);
    console.log(`   - WebSocket: ws://${LOCAL_IP}:8081`);
});

// Error handling
httpServer.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.log('❌ Port 8081 is already in use!');
        console.log('   Stop other bridges or change the port.');
        console.log('   Try: netstat -ano | findstr :8081');
        console.log('   Then: taskkill /PID [PID_NUMBER] /F');
        process.exit(1);
    } else {
        console.log('❌ HTTP Server error:', error.message);
    }
});

// Status reporting every 30 seconds
setInterval(() => {
    const activeTagsArray = Array.from(stats.activeTags);
    const deviceCount = stats.devices.size;
    
    console.log(`\n📊 BRIDGE STATUS:`);
    console.log(`   Server IP: ${LOCAL_IP}:8081`);
    console.log(`   Total packets: ${allPacketsReceived}`);
    console.log(`   Tag reads: ${readCount}`);
    console.log(`   Status messages: ${statusCount}`);
    console.log(`   Speaker apps: ${wsConnections}`);
    console.log(`   MiniTrack devices: ${deviceCount}`);
    console.log(`   Active tags: ${activeTagsArray.length} - [${activeTagsArray.sort((a,b) => a-b).join(', ')}]`);
    
    // Pokaż statystyki urządzeń
    if (deviceCount > 0) {
        console.log(`   Device details:`);
        for (const [key, device] of stats.devices) {
            console.log(`     ${key}: ${device.packetCount} packets, ${device.tagReads} reads`);
        }
    }
}, 30000);

// Save on exit
process.on('SIGINT', () => {
    console.log('\n🛑 Stopping MiniTrack → Spiker Bridge...');
    
    udpServer.close();
    wsServer.close();
    httpServer.close();
    
    const uniqueTags = [...new Set([...tagReads.map(r => r.tagNumber), ...tagStatus.map(s => s.tagNumber)])];
    
    console.log('📊 Final statistics:');
    console.log(`   Server was: ${LOCAL_IP}:8081`);
    console.log(`   Total packets: ${allPacketsReceived}`);
    console.log(`   Tag reads: ${readCount}`);
    console.log(`   Status messages: ${statusCount}`);
    console.log(`   MiniTrack devices: ${stats.devices.size}`);
    console.log(`   Unique tags: ${uniqueTags.length}`);
    if (uniqueTags.length > 0) {
        console.log(`   Tags: ${uniqueTags.sort((a,b) => a-b).join(', ')}`);
    }
    
    // Pokaż statystyki urządzeń
    if (stats.devices.size > 0) {
        console.log('   Devices used:');
        for (const [key, device] of stats.devices) {
            console.log(`     ${key}: ${device.packetCount} packets`);
        }
    }
    
    process.exit(0);
});

console.log('\n🎯 MINITRACK → SPIKER BRIDGE READY! (Multi-device)');
console.log('================================================');
console.log('📡 UDP: Listening for MiniTrack on port 10006');
console.log(`🎤 WebSocket: Speaker apps connect to ${LOCAL_IP}:8081`);
console.log(`🌐 Web interface: http://${LOCAL_IP}:8081`);
console.log(`📱 In speaker app: IP = ${LOCAL_IP}, Port = 8081`);
console.log('\n🔧 Configuration:');
if (ACCEPT_ALL_IPS) {
    console.log('   ✅ Accepting packets from ANY IP address');
    console.log('   🔒 To limit IPs: set ACCEPT_ALL_IPS = false and edit ALLOWED_MINITRACK_IPS');
} else {
    console.log(`   🔒 Only accepting packets from: ${ALLOWED_MINITRACK_IPS.join(', ')}`);
    console.log('   ✅ To accept all IPs: set ACCEPT_ALL_IPS = true');
}
console.log('\n💡 How it works:');
console.log('   1. Bridge receives MiniTrack data from multiple devices (UDP 10006)');
console.log('   2. Tracks and identifies each device by IP:port');
console.log('   3. Converts to speaker app format with device info');
console.log('   4. Sends to connected speaker apps (WS 8081)');
console.log('\n🛑 Press Ctrl+C to stop');
console.log('================================================');