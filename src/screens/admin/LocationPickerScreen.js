import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { updateDinosaur } from "../../services/dinosaurService";
import Header from "../../components/Header";

export default function LocationPickerScreen({ route, navigation }) {
  const { dinosaur } = route.params;

  const existing = dinosaur.ubicacion;
  const [marker, setMarker] = useState(
    existing ? { latitude: existing.lat, longitude: existing.lng } : null
  );
  const [region, setRegion] = useState(
    existing
      ? { latitude: existing.lat, longitude: existing.lng, latitudeDelta: 0.01, longitudeDelta: 0.01 }
      : null
  );
  const [loadingLocation, setLoadingLocation] = useState(!existing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing) return;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "Se necesita acceso a la ubicación.");
        setLoadingLocation(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setLoadingLocation(false);
    })();
  }, []);

  const handleMapPress = (e) => {
    setMarker(e.nativeEvent.coordinate);
  };

  const handleSave = async () => {
    if (!marker) {
      Alert.alert("Sin ubicación", "Toca el mapa para marcar la ubicación.");
      return;
    }
    setSaving(true);
    try {
      await updateDinosaur(dinosaur.id, {
        ubicacion: { lat: marker.latitude, lng: marker.longitude },
      });
      Alert.alert("Listo", "Ubicación guardada.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert("Error", "No se pudo guardar la ubicación.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header showBack />
      <View style={styles.container}>
        <Text style={styles.title}>{dinosaur.nombre}</Text>
        <Text style={styles.hint}>
          {marker ? "Toca el mapa para mover el marcador." : "Toca el mapa para colocar la ubicación AR."}
        </Text>

        {loadingLocation ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#1a4d2e" />
          </View>
        ) : (
          <MapView
            style={styles.map}
            initialRegion={region ?? {
              latitude: 20.967,
              longitude: -89.623,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
            onPress={handleMapPress}
          >
            {marker && (
              <Marker
                coordinate={marker}
                title={dinosaur.nombre}
                pinColor="#1a4d2e"
              />
            )}
          </MapView>
        )}

        {marker && (
          <View style={styles.coords}>
            <Text style={styles.coordText}>
              {marker.latitude.toFixed(6)}, {marker.longitude.toFixed(6)}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.saveBtn, (saving || !marker) && { opacity: 0.5 }]}
          onPress={handleSave}
          disabled={saving || !marker}
        >
          <Text style={styles.saveBtnText}>
            {saving ? "Guardando…" : "Guardar ubicación"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, backgroundColor: "#F8F7F4", padding: 16 },
  title: { fontSize: 20, fontWeight: "900", color: "#1a4d2e", marginBottom: 4 },
  hint: { fontSize: 13, color: "#7A7468", marginBottom: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  map: { flex: 1, borderRadius: 16, overflow: "hidden", marginBottom: 12 },
  coords: {
    backgroundColor: "#EAF2EC",
    borderRadius: 10,
    padding: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  coordText: { fontSize: 12, color: "#1a4d2e", fontWeight: "600" },
  saveBtn: {
    backgroundColor: "#1a4d2e",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 8,
  },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
