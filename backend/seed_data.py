"""
Empyrean — Seed Script
Populates Firebase Firestore with sample nodes, sensor readings, and alerts
so the dashboard has data to display without a real ESP32.

Usage:
    cd backend
    python seed_data.py
"""

import datetime
import uuid
import random
import firebase_admin
from firebase_admin import credentials, firestore

import os
import json
from dotenv import load_dotenv

load_dotenv()

# Firebase Init
firebase_sa = os.getenv('FIREBASE_SERVICE_ACCOUNT')
if firebase_sa:
    cred_dict = json.loads(firebase_sa)
    cred = credentials.Certificate(cred_dict)
else:
    cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

print("✅ Firebase connected. Seeding data...\n")

# =============================================================================
# 1. SEED NODES (3 sensor devices around RRCE campus, Bangalore)
# =============================================================================
nodes = [
    {
        "node_id": "ESP32-01",
        "name": "Main Gate",
        "location_name": "RRCE Campus Main Entrance",
        "lat": 12.9035,
        "lon": 77.5065,
        "firmware_version": "1.0.0",
        "registered_at": "2026-04-15T08:00:00Z",
        "last_seen": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "active": True,
        "status": "online",
        "battery_v": 3.85
    },
    {
        "node_id": "ESP32-02",
        "name": "Library Block",
        "location_name": "RRCE Library Building Rooftop",
        "lat": 12.9042,
        "lon": 77.5078,
        "firmware_version": "1.0.0",
        "registered_at": "2026-04-15T08:30:00Z",
        "last_seen": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "active": True,
        "status": "online",
        "battery_v": 3.72
    },
    {
        "node_id": "ESP32-03",
        "name": "Parking Area",
        "location_name": "RRCE South Parking Lot",
        "lat": 12.9028,
        "lon": 77.5055,
        "firmware_version": "1.0.0",
        "registered_at": "2026-04-16T09:00:00Z",
        "last_seen": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "active": True,
        "status": "online",
        "battery_v": 3.65
    }
]

print("📡 Seeding nodes...")
for node in nodes:
    db.collection("nodes").document(str(node["node_id"])).set(node)
    print(f"   ✅ {node['node_id']} — {node['name']} ({node['location_name']})")

# =============================================================================
# 2. SEED SENSOR READINGS (last 24 hours, every 30 minutes per node)
# =============================================================================
print("\n📊 Seeding sensor readings (last 24h)...")

now = datetime.datetime.now(datetime.timezone.utc)
reading_count = 0

for node in nodes:
    for i in range(48):  # 48 x 30min = 24 hours
        timestamp = now - datetime.timedelta(minutes=30 * (47 - i))

        # Simulate realistic sensor values with some variance
        temp = round(28 + random.uniform(-3, 8) + (2 * (i % 24 > 8 and i % 24 < 18)), 1)  # warmer during "day"
        humidity = round(55 + random.uniform(-15, 25), 1)
        pressure = round(1013 + random.uniform(-3, 3), 1)
        voc_ohm = random.randint(30000, 60000)
        mq135_ppm = round(300 + random.uniform(-100, 200), 1)
        pm1 = round(10 + random.uniform(0, 30), 1)
        pm25 = round(20 + random.uniform(0, 50), 1)
        pm10 = round(40 + random.uniform(0, 60), 1)
        battery_v = round(float(node["battery_v"]) - (i * 0.002), 2)

        # Calculate AQI from PM2.5 (simplified EPA formula)
        if pm25 <= 12:
            aqi = int((50 / 12) * pm25)
        elif pm25 <= 35.4:
            aqi = int(50 + (50 / 23.4) * (pm25 - 12))
        elif pm25 <= 55.4:
            aqi = int(100 + (50 / 20) * (pm25 - 35.4))
        elif pm25 <= 150.4:
            aqi = int(150 + (50 / 95) * (pm25 - 55.4))
        else:
            aqi = int(200 + (100 / 100) * (pm25 - 150.4))

        aqi = min(aqi, 500)

        if aqi <= 50:
            aqi_category = "Good"
        elif aqi <= 100:
            aqi_category = "Moderate"
        elif aqi <= 150:
            aqi_category = "Unhealthy for Sensitive Groups"
        elif aqi <= 200:
            aqi_category = "Unhealthy"
        elif aqi <= 300:
            aqi_category = "Very Unhealthy"
        else:
            aqi_category = "Hazardous"

        reading = {
            "node_id": node["node_id"],
            "ts": timestamp.isoformat() + "Z",
            "timestamp": timestamp.isoformat() + "Z",
            "lat": float(node["lat"]) + random.uniform(-0.0001, 0.0001),
            "lon": float(node["lon"]) + random.uniform(-0.0001, 0.0001),
            "bme680": {
                "temp_c": temp,
                "humidity_pct": humidity,
                "pressure_hpa": pressure,
                "voc_ohm": voc_ohm
            },
            "mq135": {
                "raw_adc": random.randint(400, 700),
                "ppm_est": mq135_ppm
            },
            "pms5003": {
                "pm1": pm1,
                "pm25": pm25,
                "pm10": pm10
            },
            "temperature": temp,
            "humidity": humidity,
            "pressure": pressure,
            "pm25": pm25,
            "pm10": pm10,
            "aqi": aqi,
            "aqi_category": aqi_category,
            "fuzzy_score": aqi,
            "battery_v": battery_v,
            "is_anomaly": False
        }

        db.collection("sensor_readings").add(reading)
        reading_count += 1

    print(f"   ✅ {node['node_id']} — 48 readings seeded")

# =============================================================================
# 3. SEED ALERTS (a few threshold breaches)
# =============================================================================
print("\n🚨 Seeding alerts...")

alerts = [
    {
        "node_id": "ESP32-01",
        "parameter": "pm25",
        "value": 72.5,
        "threshold": 55.4,
        "severity": "warning",
        "triggered_at": (now - datetime.timedelta(hours=3)).isoformat() + "Z",
        "acknowledged_at": None,
        "acknowledged_by": None
    },
    {
        "node_id": "ESP32-03",
        "parameter": "aqi",
        "value": 168,
        "threshold": 150,
        "severity": "critical",
        "triggered_at": (now - datetime.timedelta(hours=1)).isoformat() + "Z",
        "acknowledged_at": None,
        "acknowledged_by": None
    },
    {
        "node_id": "ESP32-02",
        "parameter": "pm25",
        "value": 58.2,
        "threshold": 55.4,
        "severity": "warning",
        "triggered_at": (now - datetime.timedelta(hours=6)).isoformat() + "Z",
        "acknowledged_at": (now - datetime.timedelta(hours=5)).isoformat() + "Z",
        "acknowledged_by": "admin"
    }
]

for alert in alerts:
    alert_id = str(uuid.uuid4())
    db.collection("alerts").document(alert_id).set(alert)
    status = "acknowledged" if alert["acknowledged_at"] else "ACTIVE"
    print(f"   {'✅' if alert['acknowledged_at'] else '🔴'} {alert['node_id']} — {alert['parameter']}={alert['value']} ({alert['severity']}) [{status}]")

# =============================================================================
# SUMMARY
# =============================================================================
print(f"""
{'='*50}
🎉 SEED COMPLETE
{'='*50}
   Nodes:    {len(nodes)}
   Readings: {reading_count}
   Alerts:   {len(alerts)} ({sum(1 for a in alerts if not a['acknowledged_at'])} active)
{'='*50}

You can now run:
   python app.py

And test the API:
   http://localhost:8000/api/v1/health
   http://localhost:8000/api/v1/nodes
   http://localhost:8000/api/v1/readings/latest
   http://localhost:8000/api/v1/alerts
""")
