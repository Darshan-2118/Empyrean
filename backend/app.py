import os
import json
import datetime
import paho.mqtt.client as mqtt
import firebase_admin
from firebase_admin import credentials, firestore
from fuzzy_inference import tsukamoto_inference
from dotenv import load_dotenv

load_dotenv()

# Firebase Init
# Assumes you have a serviceAccountKey.json from Firebase
try:
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firebase initialized")
except Exception as e:
    print("Failed to initialize Firebase:", e)
    db = None

# MQTT Config
MQTT_BROKER = os.getenv("MQTT_BROKER_HOST", "broker.hivemq.com")
MQTT_PORT = int(os.getenv("MQTT_BROKER_PORT", 1883))
MQTT_TOPIC = "air/node/+/reading"

def on_connect(client, userdata, flags, rc):
    print("Connected to MQTT with result code " + str(rc))
    client.subscribe(MQTT_TOPIC)

def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode('utf-8'))
        print("Received payload:", payload)
        
        # Extract inputs
        temp = payload.get("bme680", {}).get("temp_c", 0)
        humidity = payload.get("bme680", {}).get("humidity_pct", 0)
        pm25 = payload.get("pms5003", {}).get("pm25", 0)
        
        # Run inference
        aqi, aqi_category = tsukamoto_inference(temp, humidity, pm25)
        
        # Prepare document
        doc_data = payload.copy()
        doc_data["aqi"] = aqi
        doc_data["aqi_category"] = aqi_category
        doc_data["fuzzy_score"] = aqi # Using AQI as score for now
        doc_data["timestamp"] = datetime.datetime.utcnow().isoformat() + "Z"
        
        if db:
            # Write to Firestore
            db.collection("sensor_readings").add(doc_data)
            print("Written to Firebase:", doc_data["node_id"], doc_data["timestamp"])
        else:
            print("Database not configured. Simulated processing completed for:", doc_data["node_id"], doc_data["timestamp"])
    except Exception as e:
        print("Error processing message:", e)

client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION1)
client.on_connect = on_connect
client.on_message = on_message

print(f"Connecting to MQTT broker at {MQTT_BROKER}:{MQTT_PORT}...")
client.connect(MQTT_BROKER, MQTT_PORT, 60)

# Blocking call that processes network traffic, dispatches callbacks and handles reconnecting.
client.loop_forever()
