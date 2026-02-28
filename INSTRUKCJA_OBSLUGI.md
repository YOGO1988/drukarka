# 📋 INSTRUKCJA OBSŁUGI - System YO&GO Events

## 🎯 Spis Treści
1. [Przegląd Systemu](#przegląd-systemu)
2. [Drukarka Wyników](#1-drukarka-wyników-drukarka_wynikowv2html)
3. [System LED Display](#2-system-led-display-led_display_v2html)
4. [System Spikera](#3-system-spikera-spiker_yogohtml)
5. [LED Bridge Server](#4-led-bridge-server-led-bridge-serverjs)
6. [Interwały Odświeżania Danych](#interwały-odświeżania-danych)
7. [Rozwiązywanie Problemów](#rozwiązywanie-problemów)

---

## Przegląd Systemu

System YO&GO Events składa się z 4 głównych komponentów do obsługi wydarzeń sportowych:

| Komponent | Plik | Przeznaczenie |
|-----------|------|---------------|
| **Drukarka Wyników** | `drukarka_wynikowv2.html` | Drukowanie wyników na drukarce termicznej 80mm |
| **LED Display** | `led_display_v2.html` | Wyświetlanie wyników na ekranie LED |
| **System Spikera** | `spiker_yogo.html` | Panel dla spikera z informacjami o zawodnikach |
| **Bridge Server** | `led-bridge-server.js` | Serwer do komunikacji z kontrolerem LED |

### 🔌 API i Integracje
- **Chronotrack API**: `https://api.chronotrack.com`
- **LED Bridge**: `http://localhost:3000` (WebSocket bridge)
- **Kontroler LED**: Huidu HD-A4L (169.254.193.67:9527)

---

## 1. DRUKARKA WYNIKÓW (drukarka_wynikowv2.html)

### 📝 Opis
System do drukowania wyników zawodników na drukarce termicznej 80mm. Obsługuje różne kategorie i dystanse.

### 🎨 Wersja
**v2.2 - KATEGORIE+**

### ⚙️ Wymagania
- Przeglądarka: Chrome/Edge (obsługa WebUSB)
- Drukarka: Drukarka termiczna ESC/POS (80mm)
- Połączenie: USB lub Bluetooth

### 🚀 Uruchomienie

#### Krok 1: Konfiguracja Drukarki
1. Otwórz plik `drukarka_wynikowv2.html` w przeglądarce
2. Kliknij **"Ustawienia"** w dolnej nawigacji
3. W sekcji **"Konfiguracja Drukarki"**:
   - Wybierz typ drukarki: **USB** lub **Bluetooth**
   - Kliknij **"Połącz z drukarką"**
   - Wybierz drukarkę z listy urządzeń

#### Krok 2: Konfiguracja API
1. W zakładce **"Ustawienia"** > **"Konfiguracja API"**:
   - **Club ID**: Wprowadź ID klubu (np. `1234`)
   - **Event ID**: Wprowadź ID wydarzenia (np. `5678`)
   - Pozostaw API URL: `https://api.chronotrack.com`
2. Kliknij **"Zapisz Konfigurację API"**
3. Kliknij **"Załaduj Dystanse i Kategorie"**

#### Krok 3: Drukowanie Wyników
1. Przejdź do zakładki **"Wyszukaj"**
2. Wprowadź numer startowy zawodnika
3. Kliknij **"Szukaj"** lub naciśnij ENTER
4. Sprawdź podgląd wydruku
5. Kliknij **"Drukuj"**

### 📊 Funkcje

#### ✅ Kategorie Wyników
- **Kategoria Otwarta** - Klasyfikacja generalna
- **Kategoria Płeć** - Osobno M/K
- **Kategoria Wiekowa** - Grupy wiekowe (np. M20-29)
- **Kategorie Własne** - Custom categories

#### 🔄 Auto-Drukowanie
- Automatyczne drukowanie po wyszukaniu
- Można wyłączyć w ustawieniach

#### 📱 Skróty Klawiszowe
- **ENTER** - Szukaj po wpisaniu numeru
- **ESC** - Anuluj podgląd
- **F1** - Wyszukaj
- **F2** - Ustawienia

### 🎨 Personalizacja Wydruku

W zakładce **"Ustawienia"** > **"Wiadomości Niestandardowe"**:

```
Nagłówek: GRATULACJE!
Podtytuł: Dziękujemy za udział
Stopka: www.yogo.pl
```

### ⏱️ Odświeżanie Danych
- **Kategoria Otwarta**: 90 sekund
- **Kategoria Płeć**: 90 sekund
- **Kategoria Wiekowa**: 90 sekund

### 🔧 Rozwiązywanie Problemów

#### Problem: Drukarka nie łączy się
**Rozwiązanie:**
- Sprawdź czy drukarka jest włączona
- Sprawdź połączenie USB/Bluetooth
- Odśwież przeglądarkę i spróbuj ponownie
- Użyj Chrome lub Edge (Firefox nie obsługuje WebUSB)

#### Problem: Brak wyników zawodnika
**Rozwiązanie:**
- Sprawdź poprawność Club ID i Event ID
- Sprawdź czy zawodnik ukończył zawody
- Poczekaj na odświeżenie danych (90s)

#### Problem: Polskie znaki nie drukują się
**Rozwiązanie:**
- System automatycznie konwertuje polskie znaki
- Jeśli problem nadal występuje, sprawdź kodowanie drukarki (PC850/CP852)

---

## 2. SYSTEM LED DISPLAY (led_display_v2.html)

### 📝 Opis
System wyświetlania wyników na ekranie LED Huidu HD-A4L. Generuje obrazy i wysyła je do kontrolera LED.

### 🎨 Wersja
**v2.0**

### ⚙️ Wymagania
- Kontroler LED: Huidu HD-A4L
- LED Bridge Server uruchomiony na localhost:3000
- Rozdzielczość LED: Konfigurowalna (domyślnie 128x64)

### 🚀 Uruchomienie

#### Krok 1: Uruchom LED Bridge Server
```bash
cd /home/user/drukarka
node led-bridge-server.js
```

#### Krok 2: Konfiguracja LED Display
1. Otwórz plik `led_display_v2.html` w przeglądarce
2. Kliknij ikonę **"⚙️"** (Ustawienia)
3. W zakładce **"API Configuration"**:
   - **Club ID**: Wprowadź ID klubu
   - **Event ID**: Wprowadź ID wydarzenia
   - Kliknij **"Load Distances & Categories"**

#### Krok 3: Konfiguracja LED
1. W zakładce **"LED Configuration"**:
   - **LED IP**: `169.254.193.67`
   - **LED Port**: `9527`
   - **Bridge URL**: `http://localhost:3000`
   - **Rozdzielczość**: `128 x 64` (lub inna)
   - Kliknij **"Test LED Connection"**

#### Krok 4: Wyświetlanie Zawodnika
1. Użyj klawiatury numerycznej do wprowadzenia numeru startowego
2. Naciśnij **ENTER** lub kliknij **"Send to LED"**
3. Obraz zostanie automatycznie wysłany na LED

### 📊 Funkcje

#### 🎯 Tryby Wyświetlania
- **Single Runner** - Jeden zawodnik
- **Multi Runner** - Wielu zawodników (lista)
- **Custom Message** - Własna wiadomość

#### ⌨️ Obsługa Klawiatury
- **0-9** - Wprowadzanie numeru
- **ENTER** - Wyślij na LED
- **BACKSPACE** - Usuń ostatnią cyfrę
- **ESC** - Wyczyść input
- **F11** - Pełny ekran

#### 🔍 Wyszukiwanie
- Szybkie wyszukiwanie po numerze startowym
- Podgląd przed wysłaniem
- Historia ostatnich wyświetleń

#### 🎨 Personalizacja Obrazu LED
W ustawieniach można dostosować:
- Czcionkę i rozmiar tekstu
- Kolory tła i tekstu
- Layout i marginesy
- Logo klubu/wydarzenia

### ⏱️ Auto-Refresh
- **Odświeżanie wyników**: 30 sekund
- Aktualizuje wszystkie kategorie automatycznie

### 🔧 Rozwiązywanie Problemów

#### Problem: Bridge Server nie odpowiada
**Rozwiązanie:**
```bash
# Sprawdź czy serwer działa
curl http://localhost:3000/status

# Uruchom ponownie
node led-bridge-server.js
```

#### Problem: Obraz nie pojawia się na LED
**Rozwiązanie:**
- Sprawdź połączenie sieciowe z kontrolerem LED (ping 169.254.193.67)
- Sprawdź czy HDPlayer jest w trybie Asynchronous
- Sprawdź logi Bridge Server w konsoli
- Zweryfikuj rozdzielczość LED

#### Problem: Zawodnik nie zostaje znaleziony
**Rozwiązanie:**
- Sprawdź poprawność numeru startowego
- Poczekaj na auto-refresh (30s)
- Sprawdź API configuration (Club ID, Event ID)

---

## 3. SYSTEM SPIKERA (spiker_yogo.html)

### 📝 Opis
Panel informacyjny dla spikera wydarzenia. Wyświetla szczegółowe informacje o zawodnikach na mecie.

### 🎨 Funkcjonalności
- Informacje o zawodniku w czasie rzeczywistym
- Historia ostatnich zawodników
- Integracja z LED Display
- Auto-refresh w trybie hybrydowym

### ⚙️ Wymagania
- Przeglądarka: Chrome/Edge/Firefox
- Opcjonalnie: LED Bridge Server dla integracji LED

### 🚀 Uruchomienie

#### Krok 1: Konfiguracja API
1. Otwórz plik `spiker_yogo.html` w przeglądarce
2. Kliknij **"⚙️ USTAWIENIA"**
3. W sekcji **"Konfiguracja API"**:
   - **Club ID**: Wprowadź ID klubu
   - **Event ID**: Wprowadź ID wydarzenia
   - Kliknij **"💾 Załaduj Dystanse i Kategorie"**

#### Krok 2: Opcjonalnie - Konfiguracja LED
1. W sekcji **"Konfiguracja LED Bridge"**:
   - **IP Bridge**: `localhost`
   - **Port WebSocket**: `3000`
   - **LED IP**: `169.254.193.67`
   - **LED Port**: `9527`
   - Włącz **"Włącz LED Bridge"**
   - Kliknij **"🔌 Połącz z Bridge"**

#### Krok 3: Użytkowanie
1. Wróć do zakładki **"🔍 WYSZUKAJ"**
2. Wprowadź numer startowy
3. Kliknij **"🔍 Szukaj"** lub naciśnij ENTER
4. Informacje o zawodniku pojawią się na ekranie

### 📊 Funkcje

#### 📋 Panel Zawodnika
Wyświetla:
- **Numer startowy**
- **Imię i nazwisko**
- **Płeć i wiek**
- **Miasto i kraj**
- **Klub sportowy**
- **Czas netto i brutto**
- **Miejsca w kategoriach**:
  - Kategoria Otwarta
  - Kategoria Płeć
  - Kategoria Wiekowa

#### 🕐 Historia Zawodników
- Lista ostatnich 10 wyszukanych zawodników
- Szybki dostęp do poprzednich wyników
- Kliknięcie wyświetla ponownie zawodnika

#### 🔄 Auto-Refresh (Tryb Hybrydowy)
System automatycznie odświeża dane w inteligentny sposób:

**Tryb Quick Refresh** (pierwsze 4 cykle):
- Co **30 sekund**
- Aktualizuje tylko czasy i miejsca
- Minimalne obciążenie API

**Tryb Full Refresh** (co 5. cykl):
- Co **2,5 minuty**
- Pełne przeładowanie wszystkich danych
- Reset licznika do trybu Quick

**Automatyka:**
- Quick → Quick → Quick → Quick → **Full** → [RESET]
- Łącznie: 4×30s + 1×(pełne) = co 2,5 min pełne odświeżenie

#### 📤 Integracja z LED
- Automatyczne wysyłanie wyników na LED
- Przycisk **"📤 Wyślij na LED"** do ręcznego wysłania
- Status połączenia w czasie rzeczywistym

### ⌨️ Skróty Klawiszowe
- **ENTER** - Szukaj zawodnika
- **F1** - Wyszukaj
- **F2** - Ustawienia
- **F5** - Odśwież wyniki (force refresh)

### ⏱️ Interwały Odświeżania
- **Quick Refresh**: 30 sekund (lekkie)
- **Full Refresh**: 2,5 minuty (pełne)
- **Interwał użytkownika**: Konfigurowalny w ustawieniach (domyślnie 30s)

### 🔧 Rozwiązywanie Problemów

#### Problem: Auto-refresh nie działa
**Rozwiązanie:**
- Sprawdź czy auto-refresh jest włączony w ustawieniach
- Sprawdź konsolę przeglądarki (F12) pod kątem błędów API
- Zweryfikuj Club ID i Event ID

#### Problem: LED nie wyświetla danych
**Rozwiązanie:**
- Sprawdź czy LED Bridge jest włączony
- Sprawdź status połączenia w interfejsie
- Kliknij **"🔌 Połącz z Bridge"** ponownie
- Sprawdź logi w konsoli Bridge Server

#### Problem: Brak danych o zawodniku
**Rozwiązanie:**
- Sprawdź czy zawodnik faktycznie ukończył bieg
- Odśwież stronę (F5)
- Sprawdź poprawność API configuration
- Poczekaj na kolejny auto-refresh

---

## 4. LED BRIDGE SERVER (led-bridge-server.js)

### 📝 Opis
Serwer Node.js do komunikacji między przeglądarką a kontrolerem LED Huidu HD-A4L. Konwertuje HTTP requesty na protokół TCP Huidu.

### 🎨 Wersja
**v1.0.0**

### ⚙️ Wymagania
- **Node.js**: v12.0 lub nowszy
- **npm**: Najnowsza wersja
- **Kontroler LED**: Huidu HD-A4L
- **System**: Linux/Windows/macOS

### 🚀 Instalacja i Uruchomienie

#### Krok 1: Instalacja Node.js
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# Sprawdź wersję
node --version
npm --version
```

#### Krok 2: Uruchomienie Serwera
```bash
# Przejdź do katalogu
cd /home/user/drukarka

# Uruchom serwer
node led-bridge-server.js

# LUB dla auto-restart (z nodemon)
npm install -g nodemon
npm run dev
```

#### Oczekiwany Output:
```
============================================================
LED Bridge Server - Huidu HD-A4L Integration
============================================================
HTTP Server: http://localhost:3000
LED IP/Port: Configured in HTML (dynamic)

Endpoints:
  POST /send-to-led - Send image to LED display
       Body: {image, ledIP, ledPort}
  GET  /status - Check server status
============================================================
Waiting for requests from browser...
```

### 📊 API Endpoints

#### 1. POST /send-to-led
Wysyła obraz na kontroler LED.

**Request:**
```json
{
  "image": "data:image/png;base64,iVBORw0KGg...",
  "ledIP": "169.254.193.67",
  "ledPort": 9527
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "File sent successfully"
}
```

**Response (Error):**
```json
{
  "error": "Connection timeout - LED controller not responding"
}
```

#### 2. GET /status
Sprawdza status serwera.

**Response:**
```json
{
  "status": "running",
  "message": "Bridge server ready. LED IP/Port configured in HTML."
}
```

### ⚙️ Konfiguracja

Edytuj plik `led-bridge-server.js`:

```javascript
const CONFIG = {
    HTTP_PORT: 3000,              // Port HTTP serwera
    LED_IP: '169.254.193.67',     // IP kontrolera LED (default)
    LED_PORT: 9527,               // Port TCP kontrolera (default)
    TEMP_DIR: './temp_images'     // Katalog na tymczasowe obrazy
};
```

### 🔌 Protokół Huidu

Serwer implementuje protokół Huidu HD-A4L:
- **FileStartAsk** (0x3001) - Rozpoczęcie transferu
- **FileStartAnswer** (0x3002) - Potwierdzenie startu
- **FileContentAsk** (0x3003) - Wysyłanie danych
- **FileContentAnswer** (0x3004) - Potwierdzenie danych
- **FileEndAnswer** (0x3006) - Zakończenie transferu

### 📁 Struktura Pakietu

```
[2 bytes] - Długość pakietu
[2 bytes] - Typ komendy
[33 bytes] - MD5 hash (dla FileStart)
[8 bytes] - Rozmiar pliku
[2 bytes] - Typ pliku (0=obrazek)
[n bytes] - Nazwa pliku (null-terminated)
[n bytes] - Dane obrazu (dla FileContent)
```

### 🔧 Rozwiązywanie Problemów

#### Problem: Port 3000 jest zajęty
**Rozwiązanie:**
```bash
# Znajdź proces używający portu
lsof -i :3000

# Zabij proces
kill -9 <PID>

# LUB zmień port w CONFIG
```

#### Problem: LED nie odpowiada
**Komunikaty diagnostyczne:**
```
⚠️  Connection closed WITHOUT receiving any response from LED!
   Possible causes:
   1. LED controller not in Asynchronous mode (check HDPlayer)
   2. LED controller firewall blocking incoming connections
   3. Protocol requires additional initialization (GUID/Session ID)
   4. LED controller requires active program/playlist
```

**Rozwiązanie:**
- Sprawdź HDPlayer - przełącz na tryb Asynchronous
- Sprawdź firewall kontrolera LED
- Sprawdź połączenie sieciowe: `ping 169.254.193.67`
- Sprawdź czy kontroler ma aktywny program/playlistę

#### Problem: Timeout połączenia
**Rozwiązanie:**
- Sprawdź kabel sieciowy
- Sprawdź czy IP LED jest poprawny
- Zwiększ timeout w kodzie (domyślnie 30s)
- Sprawdź czy kontroler jest włączony

#### Problem: Obrazy nie są wyświetlane
**Rozwiązanie:**
- Sprawdź rozdzielczość obrazu vs rozdzielczość LED
- Sprawdź katalog `temp_images/` czy obrazy są generowane
- Sprawdź format obrazu (PNG)
- Sprawdź logi serwera pod kątem błędów MD5/transfer

### 📝 Logi Debugowania

Serwer wyświetla szczegółowe logi:
```
Received image from browser: 12543 bytes
Saved temp file: ./temp_images/led_1234567890.png
Sending file: display.png
Size: 12543 bytes, MD5: a1b2c3d4e5f6...
Target LED: 169.254.193.67:9527
Connected to LED controller
Sending FileStartAsk packet (128 bytes)
Packet hex: 80003001a1b2c3d4...
✅ Received 12 bytes from LED controller
Received FileStartAnswer - sending content...
Sent chunk: 12543/12543 bytes
File content sent completely
Received FileEndAnswer - transfer complete!
```

### 🚀 Uruchamianie jako Usługa (systemd)

#### Krok 1: Utwórz plik usługi
```bash
sudo nano /etc/systemd/system/led-bridge.service
```

#### Krok 2: Zawartość pliku
```ini
[Unit]
Description=LED Bridge Server - Huidu HD-A4L
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/home/user/drukarka
ExecStart=/usr/bin/node led-bridge-server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### Krok 3: Włącz usługę
```bash
# Przeładuj systemd
sudo systemctl daemon-reload

# Uruchom usługę
sudo systemctl start led-bridge

# Włącz autostart
sudo systemctl enable led-bridge

# Sprawdź status
sudo systemctl status led-bridge
```

---

## ⏱️ Interwały Odświeżania Danych

### Podsumowanie Wszystkich Systemów

| System | Typ Danych | Interwał | Uwagi |
|--------|-----------|----------|-------|
| **Drukarka Wyników** | Wszystkie kategorie | 90 sekund | Stały interwał |
| **LED Display** | Wszystkie wyniki | 30 sekund | Auto-refresh |
| **Spiker - Quick** | Czasy i miejsca | 30 sekund | 4 pierwsze cykle |
| **Spiker - Full** | Wszystkie dane | 2,5 minuty | Co 5. cykl |
| **LED Bridge** | Real-time | Natychmiastowe | WebSocket |

### Tryb Hybrydowy Spikera (Szczegóły)

```
Cykl 1:  [0:30]  Quick Refresh → Tylko czasy/miejsca
Cykl 2:  [1:00]  Quick Refresh → Tylko czasy/miejsca
Cykl 3:  [1:30]  Quick Refresh → Tylko czasy/miejsca
Cykl 4:  [2:00]  Quick Refresh → Tylko czasy/miejsca
Cykl 5:  [2:30]  FULL Refresh  → Wszystkie dane + RESET
[Powtórz od początku]
```

**Korzyści trybu hybrydowego:**
- ✅ Minimalne obciążenie API (80% requestów to quick)
- ✅ Zawsze aktualne czasy i miejsca (co 30s)
- ✅ Regularny pełny refresh (co 2,5min)
- ✅ Optymalna wydajność i świeżość danych

---

## 🔧 Rozwiązywanie Problemów

### Problemy Ogólne

#### Problem: API nie odpowiada (wszystkie systemy)
**Objawy:**
- Brak wyników
- Timeout errors
- "Failed to fetch"

**Rozwiązanie:**
```bash
# 1. Sprawdź połączenie internetowe
ping api.chronotrack.com

# 2. Sprawdź konsolę przeglądarki (F12)
#    Szukaj błędów CORS lub Network

# 3. Sprawdź Club ID i Event ID
#    Muszą być poprawne i aktywne

# 4. Sprawdź czy event jest aktywny
#    API zwraca dane tylko dla aktywnych eventów
```

#### Problem: Polskie znaki wyświetlają się źle
**Rozwiązanie:**
- Systemy automatycznie konwertują polskie znaki
- Drukarka: kodowanie PC850/CP852
- LED/Spiker: UTF-8
- Jeśli problem nadal występuje, sprawdź ustawienia kodowania przeglądarki

#### Problem: Dane nie odświeżają się
**Rozwiązanie:**
- Sprawdź czy auto-refresh jest włączony
- Odśwież stronę (Ctrl+F5)
- Sprawdź konsole pod kątem błędów JavaScript
- Sprawdź czy timer nie został zatrzymany

### Najczęstsze Błędy

#### 1. CORS Error
```
Access to fetch at 'https://api.chronotrack.com/...' has been blocked by CORS policy
```
**Rozwiązanie:**
- To normalne - API może wymagać dodatkowych headerów
- Sprawdź czy API jest dostępne (status 200)
- Skontaktuj się z Chronotrack ws. dostępu API

#### 2. WebUSB Not Supported
```
WebUSB is not supported in this browser
```
**Rozwiązanie:**
- Użyj Chrome lub Edge (Firefox nie obsługuje WebUSB)
- Aktualizuj przeglądarkę do najnowszej wersji

#### 3. LED Connection Timeout
```
Connection timeout - LED controller not responding
```
**Rozwiązanie:**
- Sprawdź czy kontroler LED jest włączony
- Sprawdź połączenie sieciowe
- Sprawdź czy HDPlayer jest w trybie Asynchronous
- Sprawdź IP i port kontrolera

### Logi i Debugowanie

#### Włączanie Logów w Przeglądarce
1. Naciśnij **F12** aby otworzyć DevTools
2. Przejdź do zakładki **Console**
3. Obserwuj logi w czasie rzeczywistym

#### Typowe Logi

**Sukces:**
```
✅ API Response received
✅ Zawodnik found: Jan Kowalski
✅ Sent to LED successfully
Auto-refresh: Updating results...
```

**Błędy:**
```
❌ API Error: 404 Not Found
❌ Failed to connect to printer
❌ LED controller not responding
⚠️  No results found for bib #123
```

### Kontakt i Wsparcie

W przypadku problemów:
1. Sprawdź logi w konsoli przeglądarki (F12)
2. Sprawdź logi Bridge Server (jeśli używany)
3. Zweryfikuj konfigurację API (Club ID, Event ID)
4. Sprawdź połączenie sieciowe

---

## 📚 Dodatki

### Komendy Terminala

```bash
# Uruchom LED Bridge Server
node led-bridge-server.js

# Sprawdź status Bridge
curl http://localhost:3000/status

# Sprawdź połączenie z LED
ping 169.254.193.67

# Zatrzymaj Bridge Server
# Naciśnij Ctrl+C w terminalu gdzie działa serwer
```

### Porty i Adresy

| Usługa | Adres | Port |
|--------|-------|------|
| LED Bridge HTTP | localhost | 3000 |
| Kontroler LED | 169.254.193.67 | 9527 |
| Chronotrack API | api.chronotrack.com | 443 (HTTPS) |

### Pliki Konfiguracyjne

Wszystkie systemy przechowują konfigurację w:
- **localStorage** przeglądarki
- Klucze:
  - `club-id`
  - `event-id`
  - `api-url`
  - `led-ip`
  - `led-port`
  - `bridge-url`
  - `refresh-interval`
  - `printer-config`

### Czyste Ustawienia (Reset)

Aby zresetować konfigurację:
1. Otwórz DevTools (F12)
2. Przejdź do **Application** > **Local Storage**
3. Usuń wszystkie klucze lub:
```javascript
// W konsoli przeglądarki
localStorage.clear();
location.reload();
```

---

## 📄 Informacje o Systemie

- **Autor**: YO&GO Events
- **Data utworzenia**: 2024
- **Ostatnia aktualizacja**: 2026-02
- **Licencja**: MIT (LED Bridge Server)

### Wersje Komponentów
- Drukarka Wyników: v2.2 - KATEGORIE+
- LED Display: v2.0
- System Spikera: v1.0
- LED Bridge Server: v1.0.0

---

## ✨ Najlepsze Praktyki

1. **Regularnie sprawdzaj połączenia** - LED, drukarki, API
2. **Testuj przed eventem** - Wszystkie systemy i konfiguracje
3. **Miej backup** - Zapisz konfiguracje Club ID, Event ID
4. **Monitoruj logi** - Zwłaszcza podczas eventu
5. **Aktualizuj dane** - Auto-refresh załatwia to automatycznie
6. **Plan awaryjny** - Miej plan B na wypadek awarii sprzętu

---

**Powodzenia podczas eventu! 🏃‍♂️🏃‍♀️🎉**
