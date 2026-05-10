import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  SafeAreaView,
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { getDinosaurs } from "../../services/dinosaurService";
import Header from "../../components/Header";

export default function MapScreen() {
  const [dinosaurs, setDinosaurs] = useState([]);
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
      const data = await getDinosaurs();
      setDinosaurs(data.filter((d) => d.ubicacion));
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a4d2e" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Header />
      <MapView
        style={styles.map}
        showsUserLocation
        initialRegion={
          region ?? {
            latitude: 20.967,
            longitude: -89.623,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          }
        }
      >
        {dinosaurs.map((dino) => (
          <Marker
            key={dino.id}
            coordinate={{
              latitude: dino.ubicacion.lat,
              longitude: dino.ubicacion.lng,
            }}
            pinColor="#1a4d2e"
          >
            <Callout tooltip>
              <View style={styles.callout}>
                <Image source={{ uri: dino.mediaURL }} style={styles.calloutImg} />
                <Text style={styles.calloutName}>{dino.nombre}</Text>
                <Text style={styles.calloutSub}>{dino.era} · {dino.dieta}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8F7F4" },
  map: { flex: 1 },
  callout: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 10,
    width: 160,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E0D8",
    elevation: 4,
  },
  calloutImg: {
    width: 100,
    height: 70,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: "#EAF2EC",
  },
  calloutName: { fontSize: 14, fontWeight: "700", color: "#1a2e1e" },
  calloutSub: { fontSize: 11, color: "#7A7468", marginTop: 2 },
});
