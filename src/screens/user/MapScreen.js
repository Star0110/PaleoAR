import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import MapView, {
  Marker,
  Callout,
  Polyline,
} from "react-native-maps";

import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

import { getDinosaurs } from "../../services/dinosaurService";
import Header from "../../components/Header";
import { COLORS } from "../../styles/colors";

export default function MapScreen() {
  const [dinosaurs, setDinosaurs] = useState([]);
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);

  const [userLocation, setUserLocation] = useState(null);
  const [selectedDino, setSelectedDino] = useState(null);

  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (status === "granted") {
          const loc =
            await Location.getCurrentPositionAsync({});

          setUserLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });

          setRegion({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        }

        const data = await getDinosaurs();

        const filtered = data.filter(
          (d) =>
            d.ubicacion &&
            typeof d.ubicacion.lat === "number" &&
            typeof d.ubicacion.lng === "number"
        );

        setDinosaurs(filtered);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const moveToDinosaur = (dino) => {
    setSelectedDino(dino);

    if (!mapRef.current) return;

    mapRef.current.animateToRegion(
      {
        latitude: dino.ubicacion.lat,
        longitude: dino.ubicacion.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      1000
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />

        <Text style={styles.loadingText}>
          Cargando mapa...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Header />

      {/* LEYENDAS */}
      <View style={styles.legendContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.legendScroll}
        >
          {dinosaurs.map((dino) => (
            <TouchableOpacity
              key={dino.id}
              style={[
                styles.legendCard,
                selectedDino?.id === dino.id &&
                  styles.legendCardActive,
              ]}
              activeOpacity={0.8}
              onPress={() => moveToDinosaur(dino)}
            >
              <Image
                source={{ uri: dino.mediaURL }}
                style={styles.legendImage}
              />

              <View style={styles.legendInfo}>
                <Text
                  style={styles.legendTitle}
                  numberOfLines={1}
                >
                  {dino.nombre}
                </Text>

                <Text style={styles.legendSub}>
                  {dino.era}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* MAPA */}
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation
        showsMyLocationButton
        initialRegion={
          region ?? {
            latitude: 20.967,
            longitude: -89.623,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          }
        }
      >
        {/* CAMINITO */}
        {selectedDino && userLocation && (
          <Polyline
            coordinates={[
              userLocation,
              {
                latitude: selectedDino.ubicacion.lat,
                longitude: selectedDino.ubicacion.lng,
              },
            ]}
            strokeWidth={5}
            strokeColor={COLORS.primary}
          />
        )}

        {/* DINOSAURIOS */}
        {dinosaurs.map((dino) => {
          const isVideo = dino.tipo === "video";

          return (
            <Marker
              key={dino.id}
              coordinate={{
                latitude: dino.ubicacion.lat,
                longitude: dino.ubicacion.lng,
              }}
              onPress={() => setSelectedDino(dino)}
            >
              {/* PIN */}
              <View style={styles.markerContainer}>
                <View style={styles.marker}>
                  <Ionicons
                    name="paw"
                    size={18}
                    color="#fff"
                  />
                </View>

                <View style={styles.markerTip} />
              </View>

              {/* POPUP */}
              <Callout tooltip>
                <View style={styles.callout}>
                  <Image
                    source={{ uri: dino.mediaURL }}
                    style={styles.calloutImg}
                  />

                  <View style={styles.calloutContent}>
                    <Text style={styles.calloutName}>
                      {dino.nombre}
                    </Text>

                    <Text style={styles.calloutSub}>
                      {dino.era} • {dino.dieta}
                    </Text>

                    <View style={styles.badges}>
                      <View style={styles.badge}>
                        <Ionicons
                          name="location"
                          size={11}
                          color={COLORS.primary}
                        />

                        <Text style={styles.badgeText}>
                          Zona AR
                        </Text>
                      </View>

                      <View style={styles.badge}>
                        <Ionicons
                          name={
                            isVideo
                              ? "videocam"
                              : "image"
                          }
                          size={11}
                          color={COLORS.primary}
                        />

                        <Text style={styles.badgeText}>
                          {isVideo
                            ? "Video"
                            : "Imagen"}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={styles.curioso}
                      numberOfLines={3}
                    >
                      {dino.datoCurioso}
                    </Text>
                  </View>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  map: {
    flex: 1,
  },

  // LEYENDAS
  legendContainer: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 10,
  },

  legendScroll: {
    paddingHorizontal: 12,
    gap: 10,
  },

  legendCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 8,
    width: 170,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  legendCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySurface,
  },

  legendImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primarySurface,
  },

  legendInfo: {
    marginLeft: 10,
    flex: 1,
  },

  legendTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.foreground,
  },

  legendSub: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
  },

  // MARKER
  markerContainer: {
    alignItems: "center",
  },

  marker: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    elevation: 5,
  },

  markerTip: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: COLORS.primary,
    marginTop: -2,
  },

  // CALLOUT
  callout: {
    width: 240,
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 8,
  },

  calloutImg: {
    width: "100%",
    height: 120,
    backgroundColor: COLORS.primarySurface,
  },

  calloutContent: {
    padding: 12,
  },

  calloutName: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.foreground,
  },

  calloutSub: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 3,
    marginBottom: 10,
  },

  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.primarySurface,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.primary,
  },

  curioso: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textSecondary,
  },
});