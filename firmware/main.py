import time
import json
# from umqtt.simple import MQTTClient
import config
# import machine

# --- Dummy Sensor Classes for Scaffolding ---
# Replace with actual libraries (e.g. bme680, micropython-gps)
class DummyBME680:
    def read(self):
        return {"temp_c": 32.1, "humidity_pct": 68.0, "pressure_hpa": 1013.2, "voc_ohm": 45000}

class DummyMQ135:
    def read(self):
        return {"raw_adc": 512, "ppm_est": 420}

class DummyPMS5003:
    def read(self):
        return {"pm1": 22, "pm25": 45, "pm10": 67}

class DummyGPS:
    def read(self):
        return {"lat": 12.9716, "lon": 77.5946}

bme = DummyBME680()
mq135 = DummyMQ135()
pms = DummyPMS5003()
gps = DummyGPS()

def connect_mqtt():
    print("Hardware Mode: umqtt module commented out for PC testing.")
    # client = MQTTClient(config.MQTT_CLIENT_ID, config.MQTT_BROKER, port=config.MQTT_PORT)
    # client.connect()
    # print("Connected to MQTT Broker")
    # return client
    return None

def main():
    client = connect_mqtt()
    
    while True:
        try:
            bme_data = bme.read()
            mq_data = mq135.read()
            pms_data = pms.read()
            gps_data = gps.read()

            payload = {
                "node_id": config.MQTT_CLIENT_ID,
                "lat": gps_data["lat"],
                "lon": gps_data["lon"],
                "bme680": bme_data,
                "mq135": mq_data,
                "pms5003": pms_data,
                "battery_v": 3.85
            }
            
            # if client:
            #     client.publish(config.MQTT_TOPIC_PUB, json.dumps(payload), qos=1)
            print("Simulated Firmware Payload:", payload)
            
        except Exception as e:
            print("Error:", e)
            # Add reconnection logic here
        
        time.sleep(30) # PRD requires 30s interval

if __name__ == '__main__':
    main()
