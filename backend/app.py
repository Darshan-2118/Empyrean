# pyrefly: ignore-errors
import os
import json
import datetime
import threading
import uuid
import paho.mqtt.client as mqtt
import firebase_admin
from firebase_admin import credentials, firestore
from flask import Flask, jsonify, request
from flask_cors import CORS
from fuzzy_inference import tsukamoto_inference
from dotenv import load_dotenv

load_dotenv()

# =============================================================================
# Firebase Init
# =============================================================================
try:
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("✅ Firebase initialized")
except Exception as e:
    print("❌ Failed to initialize Firebase:", e)
    db = None

# =============================================================================
# Flask App
# =============================================================================
app = Flask(__name__)
CORS(app)  # Allow frontend (Vite dev server) to call API

# =============================================================================
# MQTT Config (runs in background thread)
# =============================================================================
MQTT_BROKER = os.getenv("MQTT_BROKER_HOST", "broker.hivemq.com")
MQTT_PORT = int(os.getenv("MQTT_BROKER_PORT", 1883))
MQTT_TOPIC = "air/node/+/reading"

def on_connect(client, userdata, flags, rc):
    print("✅ Connected to MQTT with result code " + str(rc))
    client.subscribe(MQTT_TOPIC)

def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode('utf-8'))
        print("📡 Received MQTT payload:", payload.get("node_id", "unknown"))

        temp = payload.get("bme680", {}).get("temp_c", 0)
        humidity = payload.get("bme680", {}).get("humidity_pct", 0)
        pm25 = payload.get("pms5003", {}).get("pm25", 0)

        aqi, aqi_category = tsukamoto_inference(temp, humidity, pm25)

        doc_data = payload.copy()
        doc_data["aqi"] = aqi
        doc_data["aqi_category"] = aqi_category
        doc_data["fuzzy_score"] = aqi
        doc_data["timestamp"] = datetime.datetime.utcnow().isoformat() + "Z"

        if db:
            db.collection("sensor_readings").add(doc_data)
            print("✅ Written to Firebase:", doc_data["node_id"])
    except Exception as e:
        print("❌ Error processing MQTT message:", e)

def start_mqtt():
    """Start MQTT listener in a background thread."""
    try:
        mqtt_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION1)
        mqtt_client.on_connect = on_connect
        mqtt_client.on_message = on_message
        print(f"🔌 Connecting to MQTT broker at {MQTT_BROKER}:{MQTT_PORT}...")
        mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
        mqtt_client.loop_forever()
    except Exception as e:
        print(f"⚠️  MQTT connection failed: {e} (API still works without MQTT)")

# =============================================================================
# HEALTH CHECK
# =============================================================================
@app.route("/api/v1/health", methods=["GET"])
def health():
    """Check if the backend and Firebase are online."""
    firebase_status = "online" if db else "offline"
    return jsonify({
        "status": "ok",
        "firebase": firebase_status,
        "mqtt_broker": MQTT_BROKER,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    })

# =============================================================================
# SENSOR READINGS
# =============================================================================
@app.route("/api/v1/readings/latest", methods=["GET"])
def get_latest_readings():
    """Returns the most recent reading from each sensor node."""
    if not db:
        return jsonify({"error": "Database not configured"}), 503

    try:
        node_id = request.args.get("node_id")

        if node_id:
            # Get latest reading for a specific node
            docs = (db.collection("sensor_readings")
                    .where("node_id", "==", node_id)
                    .order_by("timestamp", direction=firestore.Query.DESCENDING)
                    .limit(1)
                    .stream())
            readings = [doc.to_dict() for doc in docs]
        else:
            # Get latest reading for ALL nodes — group by node_id
            # First, get all unique node_ids from the nodes collection
            nodes_ref = db.collection("nodes").stream()
            readings = []
            for node_doc in nodes_ref:
                node = node_doc.to_dict()
                nid = node.get("node_id", node_doc.id)
                latest = (db.collection("sensor_readings")
                          .where("node_id", "==", nid)
                          .order_by("timestamp", direction=firestore.Query.DESCENDING)
                          .limit(1)
                          .stream())
                for doc in latest:
                    reading = doc.to_dict()
                    reading["id"] = doc.id
                    readings.append(reading)

        return jsonify(readings)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/v1/readings/history", methods=["GET"])
def get_readings_history():
    """Returns historical readings for a node within a time range."""
    if not db:
        return jsonify({"error": "Database not configured"}), 503

    try:
        from_time = request.args.get("from")
        to_time = request.args.get("to")
        node_id = request.args.get("node_id")

        if not from_time or not to_time:
            return jsonify({"error": "Missing 'from' and 'to' query parameters"}), 400

        query = db.collection("sensor_readings")

        if node_id:
            query = query.where("node_id", "==", node_id)

        query = (query
                 .where("timestamp", ">=", from_time)
                 .where("timestamp", "<=", to_time)
                 .order_by("timestamp")
                 .limit(500))

        docs = query.stream()
        readings = []
        for doc in docs:
            reading = doc.to_dict()
            reading["id"] = doc.id
            readings.append(reading)

        return jsonify(readings)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# =============================================================================
# NODES
# =============================================================================
@app.route("/api/v1/nodes", methods=["GET"])
def get_nodes():
    """Returns metadata for all registered sensor nodes."""
    if not db:
        return jsonify({"error": "Database not configured"}), 503

    try:
        docs = db.collection("nodes").stream()
        nodes = []
        for doc in docs:
            node = doc.to_dict()
            node["id"] = doc.id
            nodes.append(node)
        return jsonify(nodes)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/v1/nodes/<node_id>", methods=["PATCH"])
def update_node(node_id):
    """Update a node's metadata (name, location, active status)."""
    if not db:
        return jsonify({"error": "Database not configured"}), 503

    try:
        data = request.get_json()
        allowed_fields = ["name", "location_name", "active", "interval_s"]
        update_data = {k: v for k, v in data.items() if k in allowed_fields}

        if not update_data:
            return jsonify({"error": "No valid fields to update"}), 400

        db.collection("nodes").document(node_id).update(update_data)
        updated = db.collection("nodes").document(node_id).get().to_dict()
        return jsonify(updated)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# =============================================================================
# ALERTS
# =============================================================================
@app.route("/api/v1/alerts", methods=["GET"])
def get_alerts():
    """Returns unacknowledged alerts, optionally filtered by severity."""
    if not db:
        return jsonify({"error": "Database not configured"}), 503

    try:
        limit = int(request.args.get("limit", 20))
        severity = request.args.get("severity")

        query = db.collection("alerts").where("acknowledged_at", "==", None)

        if severity:
            query = query.where("severity", "==", severity)

        query = query.order_by("triggered_at", direction=firestore.Query.DESCENDING).limit(limit)

        docs = query.stream()
        alerts = []
        for doc in docs:
            alert = doc.to_dict()
            alert["alert_id"] = doc.id
            alerts.append(alert)

        return jsonify(alerts)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/v1/alerts/<alert_id>/acknowledge", methods=["PATCH"])
def acknowledge_alert(alert_id):
    """Acknowledge an alert."""
    if not db:
        return jsonify({"error": "Database not configured"}), 503

    try:
        alert_ref = db.collection("alerts").document(alert_id)
        alert_doc = alert_ref.get()

        if not alert_doc.exists:
            return jsonify({"error": "Alert not found"}), 404

        alert_data = alert_doc.to_dict()
        if alert_data.get("acknowledged_at"):
            return jsonify({"error": "Already acknowledged"}), 409

        alert_ref.update({
            "acknowledged_at": datetime.datetime.utcnow().isoformat() + "Z",
            "acknowledged_by": "admin"  # TODO: get from JWT auth
        })

        updated = alert_ref.get().to_dict()
        updated["alert_id"] = alert_id
        return jsonify(updated)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# =============================================================================
# FORECAST (placeholder — returns mock data until ML model is trained)
# =============================================================================
@app.route("/api/v1/forecast", methods=["GET"])
def get_forecast():
    """Returns next 60 minute AQI prediction."""
    node_id = request.args.get("node_id", "ESP32-01")
    now = datetime.datetime.utcnow()

    # TODO: Replace with real scikit-learn model prediction
    import random
    base_aqi = random.randint(40, 80)
    predictions = []
    for i in range(12):  # 12 x 5-min intervals = 60 minutes
        t = now + datetime.timedelta(minutes=5 * (i + 1))
        predictions.append({
            "timestamp": t.isoformat() + "Z",
            "predicted_aqi": base_aqi + random.randint(-10, 15)
        })

    return jsonify({
        "node_id": node_id,
        "generated_at": now.isoformat() + "Z",
        "predictions": predictions,
        "model": "placeholder"
    })

# =============================================================================
# EXPORT (CSV download)
# =============================================================================
@app.route("/api/v1/export", methods=["GET"])
def export_csv():
    """Download historical readings as CSV."""
    if not db:
        return jsonify({"error": "Database not configured"}), 503

    try:
        from_time = request.args.get("from")
        to_time = request.args.get("to")
        node_id = request.args.get("node_id")

        if not from_time or not to_time:
            return jsonify({"error": "Missing 'from' and 'to' query parameters"}), 400

        query = db.collection("sensor_readings")
        if node_id:
            query = query.where("node_id", "==", node_id)

        query = (query
                 .where("timestamp", ">=", from_time)
                 .where("timestamp", "<=", to_time)
                 .order_by("timestamp")
                 .limit(5000))

        docs = query.stream()

        # Build CSV
        import io
        output = io.StringIO()
        header = "timestamp,node_id,lat,lon,temperature,humidity,pressure,voc_ohm,mq135_ppm,pm1,pm25,pm10,fuzzy_score,aqi,aqi_category,battery_v\n"
        output.write(header)

        for doc in docs:
            d = doc.to_dict()
            bme = d.get("bme680", {})
            mq = d.get("mq135", {})
            pms = d.get("pms5003", {})
            row = f"{d.get('timestamp','')},{d.get('node_id','')},{d.get('lat','')},{d.get('lon','')},"
            row += f"{bme.get('temp_c','')},{bme.get('humidity_pct','')},{bme.get('pressure_hpa','')},{bme.get('voc_ohm','')},"
            row += f"{mq.get('ppm_est','')},{pms.get('pm1','')},{pms.get('pm25','')},{pms.get('pm10','')},"
            row += f"{d.get('fuzzy_score','')},{d.get('aqi','')},{d.get('aqi_category','')},{d.get('battery_v','')}\n"
            output.write(row)

        csv_content = output.getvalue()
        return app.response_class(
            csv_content,
            mimetype="text/csv",
            headers={"Content-Disposition": f"attachment; filename=airquality_export_{from_time}_{to_time}.csv"}
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# =============================================================================
# START SERVER
# =============================================================================
if __name__ == "__main__":
    # Start MQTT listener in background thread (non-blocking)
    mqtt_thread = threading.Thread(target=start_mqtt, daemon=True)
    mqtt_thread.start()

    # Start Flask API server
    port = int(os.getenv("API_PORT", 8000))
    print(f"🚀 Starting Empyrean API server on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
