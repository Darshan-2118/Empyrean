# Configuration
WIFI_SSID = "YOUR_WIFI_SSID"
WIFI_PASS = "YOUR_WIFI_PASSWORD"

MQTT_BROKER = "broker.hivemq.com" # Replace with your broker
MQTT_PORT = 1883
MQTT_CLIENT_ID = "ESP32-Atmos-01"
MQTT_TOPIC_PUB = "air/node/ESP32-Atmos-01/reading"

# Sensor Pins (Adjust based on your wiring)
PIN_MQ135_ADC = 34
PIN_BME_SDA = 21
PIN_BME_SCL = 22
PIN_PMS_TX = 16
PIN_PMS_RX = 17
PIN_GPS_TX = 4
PIN_GPS_RX = 5
