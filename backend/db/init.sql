-- =============================================================================
-- EMPYREAN — TimescaleDB Schema (FUTURE: replaces Firebase/Firestore)
-- =============================================================================
-- STATUS: Not in use yet. This file auto-runs when you first start the
--         TimescaleDB Docker container via docker-compose.
--
-- WHAT THIS DOES:
--   1. Creates the TimescaleDB extension
--   2. Creates the 'nodes' table (registered ESP32 devices)
--   3. Creates the 'sensor_readings' hypertable (time-series data, chunked by week)
--   4. Creates the 'alerts' table (AQI threshold breaches)
--   5. Creates the 'hourly_agg' continuous aggregate (pre-computed hourly averages)
--
-- MIGRATION STEPS (when ready):
--   1. Start Docker: docker-compose up -d
--   2. This SQL runs automatically on first boot
--   3. Update backend/app.py: replace firebase-admin with psycopg2
--   4. Update backend/requirements.txt: add psycopg2-binary, redis
--   5. Update backend/.env: add DATABASE_URL, REDIS_URL
--   6. Export existing Firestore data to CSV, then import into TimescaleDB
-- =============================================================================

-- Enable TimescaleDB extension (must run before creating hypertables)
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- =============================================================================
-- TABLE 1: nodes
-- Stores metadata about each registered ESP32 sensor device.
-- Equivalent to the Firestore 'nodes' collection.
-- =============================================================================
CREATE TABLE IF NOT EXISTS nodes (
    node_id VARCHAR(32) PRIMARY KEY,           -- e.g. "ESP32-01"
    name VARCHAR(100),                         -- friendly name e.g. "Lab Entrance"
    location_name VARCHAR(200),                -- e.g. "RRCE Campus Block A"
    firmware_version VARCHAR(20),              -- e.g. "1.0.3"
    registered_at TIMESTAMPTZ DEFAULT NOW(),   -- when the node was first added
    last_seen TIMESTAMPTZ,                     -- updated on each heartbeat/reading
    active BOOLEAN DEFAULT TRUE                -- set FALSE to deactivate a node
);

-- =============================================================================
-- TABLE 2: sensor_readings (HYPERTABLE — the core time-series table)
-- Every sensor reading is a row here. TimescaleDB auto-partitions this
-- into 7-day chunks for fast time-range queries.
-- Equivalent to the Firestore 'sensor_readings' collection.
-- =============================================================================
CREATE TABLE IF NOT EXISTS sensor_readings (
    time TIMESTAMPTZ NOT NULL,                 -- when the reading was taken (ISO 8601)
    node_id VARCHAR(32) NOT NULL REFERENCES nodes(node_id),
    lat DOUBLE PRECISION NOT NULL,             -- GPS latitude
    lon DOUBLE PRECISION NOT NULL,             -- GPS longitude
    temperature FLOAT,                         -- BME680: degrees Celsius
    humidity FLOAT,                            -- BME680: percentage
    pressure FLOAT,                            -- BME680: hectopascals (hPa)
    voc_ohm INT,                               -- BME680: VOC resistance in Ohms
    mq135_ppm FLOAT,                           -- MQ135: CO2/smoke estimate in PPM
    pm1 FLOAT,                                 -- PMS5003: PM1.0 in μg/m³
    pm25 FLOAT,                                -- PMS5003: PM2.5 in μg/m³
    pm10 FLOAT,                                -- PMS5003: PM10 in μg/m³
    fuzzy_score FLOAT,                         -- Tsukamoto fuzzy output (0-100)
    aqi INT,                                   -- EPA AQI (0-500)
    aqi_category VARCHAR(20),                  -- "Good", "Moderate", "Unhealthy", etc.
    is_anomaly BOOLEAN DEFAULT FALSE,          -- TRUE if Z-score > 3 (outlier)
    battery_v FLOAT,                           -- battery voltage from ESP32
    PRIMARY KEY (time, node_id)
);

-- Convert sensor_readings into a hypertable with 7-day chunks.
-- This is what makes TimescaleDB fast — queries for "last 7 days" only scan ONE chunk
-- instead of the entire table.
SELECT create_hypertable('sensor_readings', by_range('time', INTERVAL '7 days'), if_not_exists => TRUE);

-- =============================================================================
-- TABLE 3: alerts
-- Created when AQI exceeds warning/critical thresholds.
-- Equivalent to the Firestore 'alerts' collection.
-- =============================================================================
CREATE TABLE IF NOT EXISTS alerts (
    alert_id UUID PRIMARY KEY,                 -- unique alert ID
    node_id VARCHAR(32) REFERENCES nodes(node_id),
    parameter VARCHAR(50),                     -- which metric triggered it: "pm25", "aqi"
    value FLOAT,                               -- the actual value that breached
    threshold FLOAT,                           -- the threshold that was exceeded
    severity VARCHAR(20),                      -- "warning" or "critical"
    triggered_at TIMESTAMPTZ DEFAULT NOW(),    -- when the alert was created
    acknowledged_at TIMESTAMPTZ,               -- NULL until someone acknowledges it
    acknowledged_by VARCHAR(100)               -- username of whoever acknowledged it
);

-- =============================================================================
-- VIEW: hourly_agg (CONTINUOUS AGGREGATE — pre-computed hourly rollups)
-- Instead of calculating "avg AQI per hour for last 30 days" on every request,
-- TimescaleDB pre-computes these every hour in the background.
-- The History page reads from this view for fast chart rendering.
-- =============================================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS hourly_agg
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 hour', time) AS bucket_time,
    node_id,
    AVG(temperature) AS avg_temp,
    AVG(humidity) AS avg_humidity,
    AVG(pm25) AS avg_pm25,
    AVG(pm10) AS avg_pm10,
    MAX(aqi) AS max_aqi,
    MIN(aqi) AS min_aqi,
    AVG(aqi) AS avg_aqi,
    COUNT(*) AS reading_count
FROM sensor_readings
GROUP BY bucket_time, node_id;
