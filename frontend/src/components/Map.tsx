import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface MapProps {
  markers: Array<{ id: string; lat: number; lon: number; aqi: number; color: string; label: string }>;
}

export const Map: React.FC<MapProps> = ({ markers }) => {
  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
          body { padding: 0; margin: 0; }
          html, body, #map { height: 100%; width: 100vw; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          const map = L.map('map').setView([12.9716, 77.5946], 10);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
          }).addTo(map);

          const markersData = ${JSON.stringify(markers)};
          markersData.forEach(m => {
            const circle = L.circleMarker([m.lat, m.lon], {
              color: m.color,
              fillColor: m.color,
              fillOpacity: 0.8,
              radius: 10
            }).addTo(map);
            circle.bindPopup("<b>" + m.label + "</b><br>AQI: " + m.aqi);
          });
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView 
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        style={styles.map}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  }
});
