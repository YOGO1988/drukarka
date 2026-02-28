# 🏃‍♂️ System YO&GO Events - Zarządzanie Wynikami

Kompleksowy system do zarządzania i wyświetlania wyników wydarzeń sportowych w czasie rzeczywistym.

## 📦 Komponenty Systemu

### 1. 🖨️ Drukarka Wyników (`drukarka_wynikowv2.html`)
Drukowanie wyników zawodników na drukarkach termicznych 80mm.
- ✅ Obsługa WebUSB i Bluetooth
- ✅ Wiele kategorii (otwarta, płeć, wiek, custom)
- ✅ Auto-drukowanie
- ✅ Personalizowane wydruki

### 2. 📺 LED Display (`led_display_v2.html`)
Wyświetlanie wyników na ekranach LED Huidu HD-A4L.
- ✅ Real-time display
- ✅ Obsługa klawiatury
- ✅ Auto-refresh co 30s
- ✅ Konfigurowalna rozdzielczość

### 3. 🎤 System Spikera (`spiker_yogo.html`)
Panel informacyjny dla spikera z danymi zawodników.
- ✅ Szczegółowe informacje o zawodnikach
- ✅ Historia ostatnich wyszukań
- ✅ Inteligentny auto-refresh (tryb hybrydowy)
- ✅ Integracja z LED

### 4. 🌉 LED Bridge Server (`led-bridge-server.js`)
Serwer Node.js do komunikacji z kontrolerem LED.
- ✅ HTTP → TCP bridge
- ✅ Protokół Huidu HD-A4L
- ✅ CORS support
- ✅ Debugowanie i logi

## 📚 Dokumentacja

- **[INSTRUKCJA_OBSLUGI.md](INSTRUKCJA_OBSLUGI.md)** - Pełna instrukcja obsługi wszystkich systemów
- **[QUICK_START.md](QUICK_START.md)** - Szybki start (5 minut)

## ⏱️ Interwały Odświeżania Danych

| System | Interwał | Opis |
|--------|----------|------|
| Drukarka Wyników | 90s | Wszystkie kategorie |
| LED Display | 30s | Auto-refresh wyników |
| Spiker (Quick) | 30s | Czasy i miejsca (4x) |
| Spiker (Full) | 2.5min | Pełne dane (co 5. cykl) |

## Architektura

```
┌─────────────┐     HTTP      ┌──────────────────┐     TCP 9527     ┌─────────────────┐
│  Przeglą-   │ ──────────────> │  Node.js Bridge  │ ───────────────> │  Huidu HD-A4L   │
│  darka      │  (localhost)   │     Server       │  (169.254.193.67)│  LED Controller │
│  (HTML/JS)  │                │  led-bridge-     │                  │                 │
└─────────────┘                │  server.js       │                  └─────────────────┘
                               └──────────────────┘                            │
                                                                                │
                                                                                ▼
                                                                         ┌─────────────┐
                                                                         │ Tablica LED │
                                                                         │  240×240px  │
                                                                         │  (96×96cm)  │
                                                                         └─────────────┘
```

## Wymagania

- **Node.js** v12+ (dla Bridge Server)
- **Przeglądarka**: Chrome lub Edge (dla WebUSB)
- **Drukarka**: Drukarka termiczna ESC/POS 80mm (opcjonalnie)
- **LED**: Kontroler Huidu HD-A4L (opcjonalnie)
- **Połączenie sieciowe** między komputerem a kontrolerem LED

## 🚀 Instalacja i Uruchomienie

### 1. Uruchom LED Bridge Server (jeśli używasz LED)

```bash
# W katalogu projektu
cd /home/user/drukarka
node led-bridge-server.js
```

Powinieneś zobaczyć:
```
============================================================
LED Bridge Server - Huidu HD-A4L Integration
============================================================
HTTP Server: http://localhost:3000
LED IP/Port: Configured in HTML (dynamic)

Endpoints:
  POST /send-to-led - Send image to LED display
  GET  /status - Check server status
============================================================
```

### 2. Wybierz Odpowiedni System

Otwórz wybrany plik HTML w przeglądarce:

#### 🖨️ Drukarka Wyników
```bash
# Otwórz drukarka_wynikowv2.html w Chrome/Edge
```
- Do drukowania wyników na drukarce termicznej
- Pełna instrukcja: [INSTRUKCJA_OBSLUGI.md](INSTRUKCJA_OBSLUGI.md#1-drukarka-wyników-drukarka_wynikowv2html)

#### 📺 LED Display
```bash
# Otwórz led_display_v2.html w przeglądarce
```
- Do wyświetlania na ekranie LED
- Wymaga uruchomionego Bridge Server
- Pełna instrukcja: [INSTRUKCJA_OBSLUGI.md](INSTRUKCJA_OBSLUGI.md#2-system-led-display-led_display_v2html)

#### 🎤 System Spikera
```bash
# Otwórz spiker_yogo.html w przeglądarce
```
- Panel informacyjny dla spikera
- Opcjonalnie integracja z LED
- Pełna instrukcja: [INSTRUKCJA_OBSLUGI.md](INSTRUKCJA_OBSLUGI.md#3-system-spikera-spiker_yogohtml)

### 3. Konfiguracja (Wspólna dla Wszystkich Systemów)

Każdy system wymaga podstawowej konfiguracji API:

1. **Otwórz Ustawienia** (⚙️ lub zakładka Ustawienia)
2. **Skonfiguruj API Chronotrack:**
   - **Club ID**: Twoje ID klubu (np. 1234)
   - **Event ID**: ID wydarzenia (np. 5678)
   - **API URL**: `https://api.chronotrack.com` (domyślnie)
3. **Kliknij "Załaduj Dystanse i Kategorie"**
4. **Dla LED Display**: Dodatkowo skonfiguruj LED:
   - LED IP: `169.254.193.67`
   - LED Port: `9527`
   - Bridge URL: `http://localhost:3000`
5. **Dla Drukarki**: Połącz drukarkę (USB/Bluetooth)

**Szczegółowe instrukcje**: Zobacz [INSTRUKCJA_OBSLUGI.md](INSTRUKCJA_OBSLUGI.md)

### 4. Testowanie

#### Drukarka Wyników
1. Wpisz numer startowy zawodnika
2. Kliknij "Szukaj" lub naciśnij ENTER
3. Sprawdź podgląd wydruku
4. Kliknij "Drukuj"

#### LED Display
1. Wprowadź numer startowy (klawiatura 0-9)
2. Naciśnij ENTER lub kliknij "Send to LED"
3. Obraz pojawi się na LED

#### System Spikera
1. Wprowadź numer startowy
2. Kliknij "Szukaj"
3. Sprawdź wyświetlone informacje
4. Opcjonalnie: Wyślij na LED

**Status połączenia:**
- 🟢 **Sukces** - Dane pobrane/wysłane
- 🔴 **Błąd** - Sprawdź logi w konsoli (F12)

## Protokół Huidu TCP

System używa proprietary protokołu Huidu LED na porcie 9527:

- **Format pakietu:** `[2B length][2B command][payload]`
- **Komendy:**
  - `0x3001` - FileStartAsk (inicjacja transferu)
  - `0x3002` - FileStartAnswer (odpowiedź)
  - `0x3003` - FileContentAsk (wysyłanie chunków)
  - `0x3006` - FileEndAnswer (potwierdzenie końca)

Implementacja bazuje na oficjalnym SDK: [github.com/huidutech/sdk](https://github.com/huidutech/sdk)

## Pliki

- **led_display_v2.html** - interfejs webowy (przeglądarka)
- **led-bridge-server.js** - serwer Node.js (TCP bridge)
- **package.json** - konfiguracja Node.js
- **temp_images/** - folder tymczasowy na obrazy (tworzony automatycznie)

## 📊 Funkcje Wszystkich Systemów

### 🖨️ Drukarka Wyników
✅ Drukowanie wyników w czasie rzeczywistym
✅ Obsługa polskich znaków (PC850/CP852)
✅ Kategorie: otwarta, płeć, wiek, custom
✅ Personalizowane nagłówki/stopki
✅ Auto-drukowanie
✅ Podgląd przed drukiem
✅ WebUSB i Bluetooth

### 📺 LED Display
✅ Wyświetlanie wyników z ChronoTrack API
✅ Automatyczne zawijanie długich tekstów
✅ Dynamiczne skalowanie czcionek
✅ Auto-refresh co 30 sekund
✅ Obsługa kategorii: Sex, Age, Custom
✅ Obsługa klawiatury (0-9, ENTER, ESC)
✅ Tryb Ethernet/TCP przez Bridge
✅ Konfigurowalna rozdzielczość

### 🎤 System Spikera
✅ Szczegółowe dane zawodnika (imię, miasto, klub, czasy)
✅ Historia wyszukań (ostatnie 10)
✅ Inteligentny auto-refresh (quick/full)
✅ Integracja z LED przez WebSocket
✅ Kolorowe kategorie dystansów
✅ Real-time status połączenia

## Debugowanie

### Problem: "LED: Błąd - Failed to fetch"

**Rozwiązanie:**
- Sprawdź czy Node.js server jest uruchomiony (`node led-bridge-server.js`)
- Sprawdź czy port 3000 nie jest zajęty
- Sprawdź console browsera (F12 → Console)

### Problem: "LED: Błąd - Connection timeout"

**Rozwiązanie:**
- Sprawdź czy tablica LED jest włączona
- Sprawdź IP tablicy (169.254.193.67) - może się zmienić
- Pinguj tablicę: `ping 169.254.193.67`
- Sprawdź czy port 9527 jest otwarty

### Problem: Obraz nie pojawia się na tablicy

**Rozwiązanie:**
- Otwórz HDPlayer i sprawdź czy tablica jest widoczna
- Sprawdź czy tablica ma załadowane programy
- Może być konieczne przełączenie programu na tablicy
- Sprawdź logi Node.js servera

## Roadmap

- [ ] Automatyczne wykrywanie IP tablicy LED
- [ ] Kolejka wyświetlania (multiple BIBs)
- [ ] Panel administratora z podglądem kolejki
- [ ] Integracja z XiaoHui Cloud (jeśli API dostępne)
- [ ] Docker container dla łatwego deploymentu

## Support

W razie problemów:
1. Sprawdź logi Node.js servera
2. Sprawdź Console przeglądarki (F12)
3. Sprawdź połączenie z tablicą LED (HDPlayer)

## License

MIT - YOGO Events
