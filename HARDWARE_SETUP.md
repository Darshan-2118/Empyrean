# Atmos Hardware Setup Guide

This document outlines the necessary steps to transition your application from PC simulation mode to live ESP32 hardware execution.

## Phase 1: Reverting Simulated Firmware Code

Because the MicroPython modules (`network`, `umqtt.simple`, `machine`) caused IDE errors on your PC, they are currently commented out in the firmware scripts. Before uploading the files to the ESP32, you need to uncomment them.

### 1. Update `firmware/boot.py`
Open `boot.py` and remove the `#` from the following sections:
- `import network`
- The entire `wlan` connection logic inside `connect_wifi()`

### 2. Update `firmware/main.py`
Open `main.py` and remove the `#` from the following sections:
- `from umqtt.simple import MQTTClient`
- `import machine`
- The contents of `connect_mqtt()`
- The line `client.publish(...)` inside the `main()` loop.

## Phase 2: Sensor Wiring & Real Libraries

Right now, `main.py` uses dummy classes to return hardcoded values. You must replace them with actual MicroPython libraries.

1. **Install Driver Libraries on ESP32:**
   - Download the MicroPython BME680 library.
   - Download the MicroPython GPS library (for NEO-6M).
   - Upload them to the ESP32 root directory via `ampy`.

2. **Replace Dummy Logic in `main.py`:**
   - Replace `DummyBME680` with the actual I2C initialization (`machine.I2C`).
   - Replace `DummyMQ135` by reading from the ADC pin (`machine.ADC(machine.Pin(34))`).
   - Replace `DummyPMS5003` with UART serial reading on the respective pins.
   - Replace `DummyGPS` with UART GPS data parsing.

## Phase 3: Flashing the Hardware

1. Connect your ESP32 to your PC via USB.
2. Identify the COM port (e.g., `COM3` on Windows).
3. Use `ampy` (Adafruit MicroPython Tool) or `mpremote` to upload the files:
```bash
ampy --port COM3 put firmware/config.py
ampy --port COM3 put firmware/boot.py
ampy --port COM3 put firmware/main.py
```

## Phase 4: Setting up the Database

Right now, the Backend worker and the React Native frontend bypass the database and operate using simulated/in-memory data. 

1. **Setup Firebase Cloud Firestore:** Go to the Firebase Console and create a project.
2. **Generate the Key:** Go to Project Settings -> Service Accounts -> "Generate new private key".
3. **Add Key to Backend:** Save the downloaded file as `serviceAccountKey.json` and place it directly inside the `backend/` folder.
4. **Uncomment the Database Logic:**
   - Open `backend/main.py`. The script is already designed to automatically reconnect once it detects the `serviceAccountKey.json` file, so it will instantly start writing to Firebase.
   - Open `frontend/src/services/firebase.ts`. Replace `YOUR_API_KEY`, `YOUR_PROJECT_ID`, etc., with the config snippet provided by Firebase.
   - Revert the `useEffect` hooks in the React Native screens (`DashboardScreen.tsx` and `HistoryScreen.tsx`) to pull actual data using the Firebase services instead of the random mock-data intervals.
