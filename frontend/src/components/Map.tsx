import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

interface MapProps {
  markers: Array<{ id: string; lat: number; lon: number; aqi: number; color: string; label: string }>;
}

export const Map: React.FC<MapProps> = ({ markers }) => {
  const webviewRef = React.useRef<WebView>(null);
  const iframeRef = React.useRef<any>(null);

  const mapHtml = React.useMemo(() => `
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

          let currentLayers = [];
          window.updateMarkers = function(markersData) {
            currentLayers.forEach(layer => map.removeLayer(layer));
            currentLayers = [];
            markersData.forEach(m => {
              const circle = L.circleMarker([m.lat, m.lon], {
                color: m.color,
                fillColor: m.color,
                fillOpacity: 0.8,
                radius: 10
              }).addTo(map);
              circle.bindPopup("<b>" + m.label + "</b><br>AQI: " + m.aqi);
              currentLayers.push(circle);
            });
          };

          // Listen for iframe postMessage
          window.addEventListener('message', function(event) {
            try {
              const data = JSON.parse(event.data);
              if (data && data.type === 'UPDATE_MARKERS') {
                window.updateMarkers(data.markers);
              }
            } catch(e) {}
          });
        </script>
      </body>
    </html>
  `, []);

  React.useEffect(() => {
    if (Platform.OS === 'web') {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(JSON.stringify({ type: 'UPDATE_MARKERS', markers }), '*');
      }
    } else {
      if (webviewRef.current) {
        webviewRef.current.injectJavaScript(`
          if (window.updateMarkers) {
            window.updateMarkers(${JSON.stringify(markers)});
          }
          true;
        `);
      }
    }
  }, [markers]);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <iframe 
          ref={iframeRef}
          srcDoc={mapHtml} 
          style={{ width: '100%', height: '100%', border: 'none' }} 
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView 
        ref={webviewRef}
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
