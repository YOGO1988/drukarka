# ⚡ QUICK START - System YO&GO Events

## 🚀 Szybki Start (5 minut)

### 1️⃣ LED Bridge Server
```bash
cd /home/user/drukarka
node led-bridge-server.js
```
✅ Serwer powinien wyświetlić: `HTTP Server: http://localhost:3000`

---

### 2️⃣ Drukarka Wyników

1. **Otwórz**: `drukarka_wynikowv2.html`
2. **Połącz drukarkę**: Ustawienia → Połącz z drukarką → Wybierz USB
3. **Konfiguruj API**:
   - Club ID: `____` (Twoje ID)
   - Event ID: `____` (Twoje ID)
   - Załaduj Dystanse i Kategorie
4. **Gotowe!** Wpisz numer startowy i drukuj

---

### 3️⃣ LED Display

1. **Otwórz**: `led_display_v2.html`
2. **Konfiguruj API**: ⚙️ → API Configuration
   - Club ID: `____`
   - Event ID: `____`
   - Load Distances & Categories
3. **Konfiguruj LED**: LED Configuration
   - LED IP: `169.254.193.67`
   - LED Port: `9527`
   - Test LED Connection
4. **Gotowe!** Wpisz numer → ENTER

---

### 4️⃣ System Spikera

1. **Otwórz**: `spiker_yogo.html`
2. **Konfiguruj API**: ⚙️ USTAWIENIA
   - Club ID: `____`
   - Event ID: `____`
   - 💾 Załaduj Dystanse i Kategorie
3. **Opcjonalnie - LED**: Konfiguracja LED Bridge → Połącz z Bridge
4. **Gotowe!** Wpisz numer → 🔍 Szukaj

---

## 📋 Checklist Przed Eventem

### Dzień Przed
- [ ] Sprawdź połączenie z API (Club ID, Event ID)
- [ ] Przetestuj drukarkę (wydruk testowy)
- [ ] Sprawdź połączenie z kontrolerem LED (ping + test)
- [ ] Uruchom Bridge Server i sprawdź status
- [ ] Zapisz wszystkie konfiguracje

### 1 Godzinę Przed
- [ ] Uruchom wszystkie systemy
- [ ] Sprawdź auto-refresh (czy działa)
- [ ] Test końcowy wszystkich komponentów
- [ ] Przygotuj plan awaryjny

### Podczas Eventu
- [ ] Monitoruj logi w konsoli (F12)
- [ ] Sprawdzaj status połączenia z LED
- [ ] Upewnij się że auto-refresh działa
- [ ] Miej otwartą instrukcję INSTRUKCJA_OBSLUGI.md

---

## 🔥 Najważniejsze Skróty

### Drukarka
- **ENTER** = Szukaj
- **F1** = Wyszukaj
- **F2** = Ustawienia

### LED Display
- **0-9** = Numer startowy
- **ENTER** = Wyślij na LED
- **BACKSPACE** = Usuń cyfrę
- **ESC** = Wyczyść
- **F11** = Pełny ekran

### Spiker
- **ENTER** = Szukaj
- **F1** = Wyszukaj
- **F2** = Ustawienia
- **F5** = Force refresh

---

## ⚡ Błyskawiczne Rozwiązania

### Problem: API nie zwraca danych
```bash
# Sprawdź Club ID i Event ID
# Sprawdź konsolę (F12) → szukaj błędów
# Odśwież stronę (Ctrl+F5)
```

### Problem: Drukarka nie drukuje
```bash
# Sprawdź połączenie USB
# Użyj Chrome/Edge (nie Firefox)
# Połącz ponownie w ustawieniach
```

### Problem: LED nie wyświetla
```bash
# Sprawdź Bridge Server (node led-bridge-server.js)
# Test: curl http://localhost:3000/status
# Sprawdź ping: ping 169.254.193.67
# HDPlayer → tryb Asynchronous
```

---

## 📊 Interwały Odświeżania (na szybko)

| System | Interwał |
|--------|----------|
| Drukarka | 90s |
| LED Display | 30s |
| Spiker Quick | 30s |
| Spiker Full | 2.5min |

---

## 🆘 Awaryjne Komendy

```bash
# Restart Bridge Server
killall node
node led-bridge-server.js

# Sprawdź status Bridge
curl http://localhost:3000/status

# Test połączenia LED
ping 169.254.193.67

# Reset konfiguracji w przeglądarce
# F12 → Console → wpisz:
localStorage.clear(); location.reload();
```

---

## 📞 Ważne Adresy

- **API**: `https://api.chronotrack.com`
- **Bridge**: `http://localhost:3000`
- **LED**: `169.254.193.67:9527`

---

**Szczegółowa instrukcja**: Otwórz `INSTRUKCJA_OBSLUGI.md`

**Good luck! 🏃‍♂️💨**
