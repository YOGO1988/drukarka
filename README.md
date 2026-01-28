# LED Display System - YOGO Events

System wyświetlania wyników zawodników na tablicy LED 240×240px dla wydarzeń sportowych.

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

- **Node.js** (v14 lub nowszy)
- **Przeglądarka** z obsługą Canvas API (Chrome, Edge, Firefox)
- **Huidu HD-A4L** LED controller podłączony do sieci
- **Połączenie sieciowe** między komputerem a kontrolerem LED

## Instalacja i Uruchomienie

### 1. Uruchom Node.js Bridge Server

```bash
# W katalogu projektu
node led-bridge-server.js
```

Powinieneś zobaczyć:
```
============================================================
LED Bridge Server - Huidu HD-A4L Integration
============================================================
HTTP Server: http://localhost:3000
LED Controller: 169.254.193.67:9527

Endpoints:
  POST /send-to-led - Send image to LED display
  GET  /status - Check server status
============================================================
```

### 2. Otwórz Interface Webowy

Otwórz plik `led_display_v2.html` w przeglądarce:
```bash
# Linux/Mac
xdg-open led_display_v2.html

# Windows
start led_display_v2.html
```

### 3. Konfiguracja

W interfejsie webowym:

1. **Kliknij "⚙️ Admin"** (prawy górny róg)
2. **Wpisz dane API ChronoTrack:**
   - Client ID
   - User ID (email)
   - Password
   - Event ID

3. **Wybierz tryb połączenia LED:**
   - **Ethernet/TCP** - przez Node.js bridge server (REKOMENDOWANE)
   - **HDMI** - bezpośrednie wyświetlanie (wymaga F11 fullscreen)

4. **Kliknij "Zapisz Konfigurację"**

### 4. Testowanie

1. Wpisz numer startowy zawodnika w pole "BIB"
2. Kliknij "Wyświetl" lub naciśnij Enter
3. System powinien:
   - Pobrać dane z ChronoTrack API
   - Wygenerować obraz 240×240px
   - Wysłać do Node.js servera
   - Server przekaże obraz do tablicy LED przez TCP

**Status połączenia:**
- 🟢 **LED: Wysłano przez TCP** - sukces
- 🔴 **LED: Błąd - ...** - problem z połączeniem

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

## Funkcje

✅ Wyświetlanie wyników z ChronoTrack API
✅ Automatyczne zawijanie długich tekstów
✅ Dynamiczne skalowanie czcionek
✅ Odświeżanie co 30 sekund (wyniki live)
✅ Obsługa kategorii: Sex, Age, Custom
✅ Mapping RFID → BIB (przez Web USB API)
✅ Tryb HDMI i Ethernet/TCP
✅ Canvas 240×240px (pixelated rendering dla ostrego LED)

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
