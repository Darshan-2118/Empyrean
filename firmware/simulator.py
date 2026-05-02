import time
import json
import random
import paho.mqtt.client as mqtt

# Configuration
MQTT_BROKER = "broker.hivemq.com"
MQTT_PORT = 1883
MQTT_CLIENT_ID = "ESP32-Atmos-Simulator"
MQTT_TOPIC_PUB = "air/node/ESP32-Atmos-01/reading"

def on_connect(client, userdata, flags, rc):
    print("Simulator connected to MQTT Broker with result code " + str(rc))

client = mqtt.Client(MQTT_CLIENT_ID)
client.on_connect = on_connect

print(f"Connecting to {MQTT_BROKER}:{MQTT_PORT}...")
client.connect(MQTT_BROKER, MQTT_PORT, 60)
client.loop_start()

try:
    while True:
        # Generate random dummy data
        temp_c = round(random.uniform(25.0, 35.0), 1)
        humidity_pct = round(random.uniform(50.0, 80.0), 1)
        pm25 = int(random.uniform(10, 150))
        
        payload = {
            "node_id": "ESP32-Atmos-01",
            "lat": 12.9716 + random.uniform(-0.01, 0.01),
            "lon": 77.5946 + random.uniform(-0.01, 0.01),
            "bme680": {
                "temp_c": temp_c,
                "humidity_pct": humidity_pct,
                "pressure_hpa": 1013.2,
                "voc_ohm": int(random.uniform(30000, 50000))
            },
            "mq135": {
                "raw_adc": int(random.uniform(400, 600)),
                "ppm_est": int(random.uniform(300, 500))
            },
            "pms5003": {
                "pm1": int(pm25 * 0.5),
                "pm25": pm25,
                "pm10": int(pm25 * 1.5)
            },
            "battery_v": round(random.uniform(3.5, 4.2), 2)
        }
        
        client.publish(MQTT_TOPIC_PUB, json.dumps(payload), qos=1)
        print("Published dummy data:", json.dumps(payload, indent=2))
        
        time.sleep(5) # Publish every 5 seconds for simulation
except KeyboardInterrupt:
    print("Simulator stopped.")
    client.loop_stop()
    client.disconnect()
