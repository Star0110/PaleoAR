import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";

import { getDinosaurs } from "../../services/dinosaurService";
import Header from "../../components/Header";
import { COLORS } from "../../styles/colors";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

function SkeletonCard() {
  return (
    <View style={[styles.card, styles.skeletonCard]}>
      <View style={styles.skeletonThumb} />
      <View style={styles.skeletonInfo}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, { width: "50%", marginTop: 8 }]} />
        <View
          style={[
            styles.skeletonLine,
            { width: "90%", marginTop: 8, height: 10 },
          ]}
        />
      </View>
    </View>
  );
}

function DinoCard({ item }) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(
      LayoutAnimation.Presets.easeInEaseOut
    );
    setExpanded((v) => !v);
  };

  const isVideo = item.tipo === "video";

  return (
    <TouchableOpacity
      style={[styles.card, expanded && styles.cardExpanded]}
      onPress={toggle}
      activeOpacity={0.85}
    >
      {/* Fila principal */}
      <View style={styles.row}>
        {isVideo ? (
          <View style={styles.videoThumbContainer}>
            <Ionicons
              name="play-circle"
              size={38}
              color="#fff"
              style={styles.playIcon}
            />

            <Video
              source={{ uri: item.mediaURL }}
              style={styles.thumb}
              resizeMode={ResizeMode.COVER}
              shouldPlay
              isLooping
              isMuted
            />
          </View>
        ) : (
          <Image
            source={{ uri: item.mediaURL }}
            style={styles.thumb}
          />
        )}

        <View style={styles.info}>
          <View style={styles.cardHeader}>
            <Text style={styles.name}>
              {item.nombre}
            </Text>

            <View style={styles.eraPill}>
              <Text style={styles.eraText}>
                {item.era}
              </Text>
            </View>
          </View>

          <Text style={styles.sub}>
            {item.dieta}
          </Text>

          {!expanded && (
            <View style={styles.verMasRow}>
              <Ionicons
                name="add-circle-outline"
                size={14}
                color={COLORS.primary}
              />

              <Text style={styles.verMasText}>
                Ver información
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Detalle expandido */}
      {expanded && (
        <View style={styles.detail}>
          <View style={styles.detailDivider} />

          {isVideo ? (
            <Video
              source={{ uri: item.mediaURL }}
              style={styles.detailImage}
              resizeMode={ResizeMode.COVER}
              shouldPlay
              isLooping
              isMuted={false}
              useNativeControls
            />
          ) : (
            <Image
              source={{ uri: item.mediaURL }}
              style={styles.detailImage}
              resizeMode="cover"
            />
          )}

          <View style={styles.pills}>
            <View style={styles.pill}>
              <Ionicons
                name="leaf-outline"
                size={12}
                color={COLORS.primary}
              />

              <Text style={styles.pillText}>
                {item.dieta}
              </Text>
            </View>

            <View style={styles.pill}>
              <Ionicons
                name="time-outline"
                size={12}
                color={COLORS.primary}
              />

              <Text style={styles.pillText}>
                {item.era}
              </Text>
            </View>

            <View style={styles.pill}>
              <Ionicons
                name={
                  isVideo
                    ? "videocam-outline"
                    : "image-outline"
                }
                size={12}
                color={COLORS.primary}
              />

              <Text style={styles.pillText}>
                {isVideo ? "Video" : "Imagen"}
              </Text>
            </View>
          </View>

          <Text style={styles.detailLabel}>
            Dato curioso
          </Text>

          <Text style={styles.detailText}>
            {item.datoCurioso}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const MemoizedDinoCard = React.memo(DinoCard);

export default function DinosaurListScreen() {
  const [dinosaurs, setDinosaurs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDinosaurs()
      .then(setDinosaurs)
      .finally(() => setLoading(false));
  }, []);

  const renderItem = useCallback(
    ({ item }) => (
      <MemoizedDinoCard item={item} />
    ),
    []
  );

  return (
    <SafeAreaView style={styles.safe}>
      <Header />

      <FlatList
        data={
          loading
            ? Array(4).fill(null)
            : dinosaurs
        }
        keyExtractor={(item, i) =>
          item?.id ?? `skeleton-${i}`
        }
        renderItem={
          loading
            ? () => <SkeletonCard />
            : renderItem
        }
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>
            Dinosaurios
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },

  list: {
    padding: 16,
    paddingBottom: 32,
  },

  sectionTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.foreground,
    marginBottom: 16,
  },

  // Card
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },

  cardExpanded: {
    borderColor: COLORS.primaryBorder,
    elevation: 4,
    shadowOpacity: 0.1,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  thumb: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: COLORS.primarySurface,
  },

  videoThumbContainer: {
    position: "relative",
  },

  playIcon: {
    position: "absolute",
    zIndex: 2,
    top: "50%",
    left: "50%",
    marginTop: -19,
    marginLeft: -19,
  },

  info: {
    flex: 1,
    marginLeft: 12,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    flex: 1,
  },

  eraPill: {
    backgroundColor: COLORS.primarySurface,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },

  eraText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.primary,
  },

  sub: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 6,
  },

  verMasRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  verMasText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
  },

  // Detalle expandido
  detailDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },

  detail: {
    marginTop: 4,
  },

  detailImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    backgroundColor: "#000",
    marginBottom: 12,
  },

  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.primarySurface,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },

  pillText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
  },

  detailLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },

  detailText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },

  // Skeleton
  skeletonCard: {
    opacity: 0.5,
  },

  skeletonThumb: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: COLORS.border,
  },

  skeletonInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },

  skeletonLine: {
    height: 13,
    borderRadius: 6,
    backgroundColor: COLORS.border,
    width: "75%",
  },
});