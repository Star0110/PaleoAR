import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, SafeAreaView,
  TextInput, KeyboardAvoidingView, Platform, ScrollView,
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
  const [loadingCurrent, setLoadingCurrent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mapRef, setMapRef] = useState(null);

  // Inputs manuales
  const [latInput, setLatInput] = useState(existing ? String(existing.lat) : "");
  const [lngInput, setLngInput] = useState(existing ? String(existing.lng) : "");
  const [coordError, setCoordError] = useState("");

  useEffect(() => {
    if (existing) return;
    getInitialRegion();
  }, []);

  // Sincroniza inputs cuando cambia el marker (tap en mapa o ubicación actual)
  useEffect(() => {
    if (marker) {
      setLatInput(marker.latitude.toFixed(6));
      setLngInput(marker.longitude.toFixed(6));
      setCoordError("");
    }
  }, [marker]);

  const getInitialRegion = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setRegion({ latitude: 20.967, longitude: -89.623, latitudeDelta: 0.1, longitudeDelta: 0.1 });
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch {
      setRegion({ latitude: 20.967, longitude: -89.623, latitudeDelta: 0.1, longitudeDelta: 0.1 });
    } finally {
      setLoadingLocation(false);
    }
  };

  const useCurrentLocation = async () => {
    setLoadingCurrent(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "Se necesita acceso a la ubicación.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setMarker(coords);
      const newRegion = { ...coords, latitudeDelta: 0.005, longitudeDelta: 0.005 };
      setRegion(newRegion);
      mapRef?.animateToRegion(newRegion, 600);
    } catch {
      Alert.alert("Error", "No se pudo obtener la ubicación actual.");
    } finally {
      setLoadingCurrent(false);
    }
  };

  const handleMapPress = (e) => {
    setMarker(e.nativeEvent.coordinate);
  };

  // Aplica coordenadas escritas a mano
  const applyManualCoords = () => {
    const lat = parseFloat(latInput.replace(",", "."));
    const lng = parseFloat(lngInput.replace(",", "."));

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setCoordError("Latitud inválida. Debe estar entre -90 y 90.");
      return;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      setCoordError("Longitud inválida. Debe estar entre -180 y 180.");
      return;
    }

    setCoordError("");
    const coords = { latitude: lat, longitude: lng };
    setMarker(coords);
    const newRegion = { ...coords, latitudeDelta: 0.005, longitudeDelta: 0.005 };
    mapRef?.animateToRegion(newRegion, 600);
  };

  const handleSave = async () => {
    if (!marker) {
      Alert.alert("Sin ubicación", "Toca el mapa o ingresa coordenadas.");
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>{dinosaur.nombre}</Text>
          <Text style={styles.hint}>
            Toca el mapa, usa tu ubicación, o escribe las coordenadas.
          </Text>

          {/* BOTONES */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={useCurrentLocation}
              disabled={loadingCurrent}
            >
              {loadingCurrent ? (
                <ActivityIndicator size="small" color="#1a4d2e" />
              ) : (
                <>
                  <View style={styles.dotIcon} />
                  <Text style={styles.actionBtnText}>Mi ubicación</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, !marker && styles.actionBtnDisabled]}
              onPress={() => {
                if (!marker) return;
                mapRef?.animateToRegion(
                  { ...marker, latitudeDelta: 0.005, longitudeDelta: 0.005 },
                  600
                );
              }}
              disabled={!marker}
            >
              <View style={styles.crosshairIcon}>
                <View style={styles.crosshairH} />
                <View style={styles.crosshairV} />
                <View style={styles.crosshairCircle} />
              </View>
              <Text style={styles.actionBtnText}>Centrar</Text>
            </TouchableOpacity>
          </View>

          {/* MAPA */}
          {loadingLocation ? (
            <View style={styles.mapLoader}>
              <ActivityIndicator size="large" color="#1a4d2e" />
            </View>
          ) : (
            <MapView
              ref={(r) => setMapRef(r)}
              style={styles.map}
              initialRegion={
                region ?? {
                  latitude: 20.967,
                  longitude: -89.623,
                  latitudeDelta: 0.1,
                  longitudeDelta: 0.1,
                }
              }
              onPress={handleMapPress}
              showsUserLocation
              showsMyLocationButton={false}
            >
              {marker && (
                <Marker coordinate={marker} title={dinosaur.nombre}>
                  <View style={styles.markerOuter}>
                    <View style={styles.markerInner} />
                  </View>
                </Marker>
              )}
            </MapView>
          )}

          {/* COORDENADAS MANUALES */}
          <View style={styles.coordsCard}>
            <Text style={styles.coordsTitle}>Coordenadas</Text>

            <View style={styles.coordsRow}>
              <View style={styles.coordField}>
                <Text style={styles.coordLabel}>Latitud</Text>
                <TextInput
                  style={styles.coordInput}
                  value={latInput}
                  onChangeText={(v) => { setLatInput(v); setCoordError(""); }}
                  keyboardType="numeric"
                  placeholder="Ej. 20.967432"
                  placeholderTextColor="#bbb"
                  returnKeyType="done"
                />
              </View>

              <View style={styles.coordField}>
                <Text style={styles.coordLabel}>Longitud</Text>
                <TextInput
                  style={styles.coordInput}
                  value={lngInput}
                  onChangeText={(v) => { setLngInput(v); setCoordError(""); }}
                  keyboardType="numeric"
                  placeholder="Ej. -89.623140"
                  placeholderTextColor="#bbb"
                  returnKeyType="done"
                />
              </View>
            </View>

            {coordError ? (
              <Text style={styles.coordError}>{coordError}</Text>
            ) : null}

            <TouchableOpacity style={styles.applyBtn} onPress={applyManualCoords}>
              <Text style={styles.applyBtnText}>Aplicar coordenadas</Text>
            </TouchableOpacity>
          </View>

          {/* GUARDAR */}
          <TouchableOpacity
            style={[styles.saveBtn, (saving || !marker) && { opacity: 0.5 }]}
            onPress={handleSave}
            disabled={saving || !marker}
          >
            <Text style={styles.saveBtnText}>
              {saving ? "Guardando..." : "Guardar ubicación"}
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: "#F8F7F4",
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: "#1a4d2e",
    marginBottom: 4,
  },
  hint: {
    fontSize: 13,
    color: "#7A7468",
    marginBottom: 14,
  },

  // BOTONES
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2EC",
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  actionBtnDisabled: {
    opacity: 0.4,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1a4d2e",
  },

  // ÍCONO PUNTO (mi ubicación)
  dotIcon: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#1a4d2e",
    borderWidth: 2,
    borderColor: "#1a4d2e",
    shadowColor: "#1a4d2e",
    shadowOpacity: 0.4,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
  },

  // ÍCONO CROSSHAIR (centrar)
  crosshairIcon: {
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  crosshairH: {
    position: "absolute",
    width: 16,
    height: 1.5,
    backgroundColor: "#1a4d2e",
    borderRadius: 1,
  },
  crosshairV: {
    position: "absolute",
    width: 1.5,
    height: 16,
    backgroundColor: "#1a4d2e",
    borderRadius: 1,
  },
  crosshairCircle: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: "#1a4d2e",
    backgroundColor: "transparent",
  },

  // MAPA
  mapLoader: {
    height: 260,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eee",
    borderRadius: 16,
    marginBottom: 14,
  },
  map: {
    height: 260,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 14,
  },

  // MARKER CUSTOM
  markerOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(26,77,46,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  markerInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#1a4d2e",
  },

  // COORDENADAS MANUALES
  coordsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E0D8",
    marginBottom: 16,
  },
  coordsTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1a2e1e",
    marginBottom: 12,
  },
  coordsRow: {
    flexDirection: "row",
    gap: 10,
  },
  coordField: {
    flex: 1,
  },
  coordLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#7A7468",
    marginBottom: 5,
  },
  coordInput: {
    backgroundColor: "#F8F7F4",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1a2e1e",
  },
  coordError: {
    marginTop: 8,
    fontSize: 12,
    color: "#c0392b",
    fontWeight: "600",
  },
  applyBtn: {
    marginTop: 12,
    backgroundColor: "#1a4d2e",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  applyBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  // GUARDAR
  saveBtn: {
    backgroundColor: "#1a4d2e",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});