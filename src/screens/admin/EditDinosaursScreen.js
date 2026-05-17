import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, Alert, Modal,
  ScrollView, Image, SafeAreaView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Video } from "expo-av";
import {
  getDinosaurs, updateDinosaur, uploadDinosaurMedia,
} from "../../services/dinosaurService";
import Header from "../../components/Header";
import { getFirestore, doc, deleteDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function EditDinosaursScreen({ navigation }) {
  const [dinosaurs, setDinosaurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaMenuVisible, setMediaMenuVisible] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getDinosaurs();
      setDinosaurs(data);
    } catch {
      Alert.alert("Error", "No se pudo cargar la lista.");
    } finally {
      setLoading(false);
    }
  };

  const isEditable = (item) => item?.targetName?.startsWith("editable_");
  const hasLocation = (item) => !!(item?.ubicacion?.lat && item?.ubicacion?.lng);

  const openEdit = (dino) => {
    setSelected(dino);
    setForm({
      nombre: dino.nombre || "",
      dieta: dino.dieta || "",
      era: dino.era || "",
      datoCurioso: dino.datoCurioso || "",
      mediaURL: dino.mediaURL || "",
      tipo: dino.tipo || "imagen",
    });
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Se necesita acceso a la cámara.");
      return false;
    }
    return true;
  };

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Se necesita acceso a la galería.");
      return false;
    }
    return true;
  };

  const uploadAsset = async (asset) => {
    setUploadingMedia(true);
    try {
      const url = await uploadDinosaurMedia(selected.id, asset.uri);
      const tipo = asset.type === "video" ? "video" : "imagen";
      setForm((f) => ({ ...f, mediaURL: url, tipo }));
      Alert.alert("Listo", tipo === "video" ? "Video actualizado." : "Imagen actualizada.");
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "No se pudo subir el archivo.");
    } finally {
      setUploadingMedia(false);
    }
  };

  const pickFromGallery = async () => {
    setMediaMenuVisible(false);
    const ok = await requestGalleryPermission();
    if (!ok) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.8,
      videoMaxDuration: 60,
    });
    if (result.canceled) return;
    await uploadAsset(result.assets[0]);
  };

  const takePhoto = async () => {
    setMediaMenuVisible(false);
    const ok = await requestCameraPermission();
    if (!ok) return;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled) return;
    await uploadAsset(result.assets[0]);
  };

  const recordVideo = async () => {
    setMediaMenuVisible(false);
    const ok = await requestCameraPermission();
    if (!ok) return;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      videoMaxDuration: 60,
      quality: ImagePicker.UIImagePickerControllerQualityType.Medium,
    });
    if (result.canceled) return;
    await uploadAsset(result.assets[0]);
  };

  const deleteVisitRecord = async (targetName) => {
    const db = getFirestore();
    const auth = getAuth();
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
      await deleteDoc(doc(db, "visitas", uid, "registros", targetName));
    } catch (e) {
      console.log("No había registro de visita:", e);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData = {
        mediaURL: form.mediaURL,
        tipo: form.tipo,
        dieta: form.dieta,
        era: form.era,
        datoCurioso: form.datoCurioso,
      };

      if (isEditable(selected)) {
        const nombreCambio = form.nombre !== selected.nombre;
        updateData.nombre = form.nombre;
        if (nombreCambio) {
          await deleteVisitRecord(selected.targetName);
        }
      }

      await updateDinosaur(selected.id, updateData);

      setDinosaurs((prev) =>
        prev.map((d) => d.id === selected.id ? { ...d, ...updateData } : d)
      );

      Alert.alert("Listo", "Información actualizada.");
      setSelected(null);
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  const PencilIcon = () => (
    <View style={styles.pencilWrapper}>
      <View style={styles.pencilBody} />
      <View style={styles.pencilNib} />
    </View>
  );

  const MapIcon = () => (
    <View style={styles.mapIconWrapper}>
      <View style={styles.mapIconPin} />
      <View style={styles.mapIconDot} />
    </View>
  );

  // Ícono pin para indicador de ubicación en la card
  const LocationDot = ({ active }) => (
    <View style={[styles.locationDotWrapper, !active && styles.locationDotWrapperOff]}>
      <View style={[styles.locationDotPin, !active && styles.locationDotPinOff]} />
      <View style={[styles.locationDotTail, !active && styles.locationDotTailOff]} />
    </View>
  );

  const renderItem = ({ item }) => {
    const editable = isEditable(item);
    const located = hasLocation(item);

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardMain}
          onPress={() => openEdit(item)}
          activeOpacity={0.9}
        >
          {item.tipo === "video" ? (
            <Video
              source={{ uri: item.mediaURL }}
              style={styles.thumb}
              resizeMode="cover"
              shouldPlay
              isLooping
              isMuted
            />
          ) : (
            <Image source={{ uri: item.mediaURL }} style={styles.thumb} />
          )}

          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{item.nombre}</Text>
            <Text style={styles.cardSub}>{item.era} · {item.dieta}</Text>

            <View style={styles.tagRow}>
              {/* TAG TIPO */}
              <View style={[styles.tag, editable ? styles.tagEditable : styles.tag3D]}>
                <Text style={[styles.tagText, editable ? styles.tagTextEditable : styles.tagText3D]}>
                  {editable ? "Editable" : "3D"}
                </Text>
              </View>

              {/* TAG UBICACIÓN */}
              <View style={[styles.tag, located ? styles.tagLocated : styles.tagNoLocation]}>
                <LocationDot active={located} />
                <Text style={[styles.tagText, located ? styles.tagTextLocated : styles.tagTextNoLocation]}>
                  {located ? "Con ubicación" : "Sin ubicación"}
                </Text>
              </View>
            </View>
          </View>

          <PencilIcon />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mapBtn}
          onPress={() => navigation.navigate("LocationPicker", { dinosaur: item })}
        >
          <MapIcon />
          <Text style={styles.mapBtnText}>
            {located ? "Editar ubicación AR" : "Agregar ubicación AR"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a4d2e" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Header showBack />

      <View style={styles.container}>
        <FlatList
          data={dinosaurs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 24 }}
        />

        {/* ── MODAL EDICIÓN ── */}
        <Modal
          visible={!!selected}
          animationType="slide"
          onRequestClose={() => setSelected(null)}
        >
          <ScrollView contentContainerStyle={styles.modal}>

            <Text style={styles.modalTitle}>{form.nombre}</Text>

            {/* MEDIA */}
            <TouchableOpacity
              style={styles.mediaContainer}
              onPress={() => setMediaMenuVisible(true)}
              disabled={uploadingMedia}
            >
              {form.tipo === "video" ? (
                <Video
                  source={{ uri: form.mediaURL }}
                  style={styles.preview}
                  resizeMode="cover"
                  useNativeControls
                  shouldPlay
                  isLooping
                />
              ) : form.mediaURL ? (
                <Image source={{ uri: form.mediaURL }} style={styles.preview} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={{ color: "#888" }}>Sin multimedia</Text>
                </View>
              )}
              <View style={styles.imageOverlay}>
                {uploadingMedia ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.imageOverlayText}>Cambiar imagen / video</Text>
                )}
              </View>
            </TouchableOpacity>

            {/* NOMBRE */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Nombre</Text>
              {selected && isEditable(selected) ? (
                <TextInput
                  style={styles.input}
                  value={form.nombre}
                  onChangeText={(v) => setForm((f) => ({ ...f, nombre: v }))}
                />
              ) : (
                <View style={styles.readOnly}>
                  <Text style={styles.readOnlyText}>{form.nombre}</Text>
                </View>
              )}
            </View>

            {/* DIETA */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Dieta</Text>
              <TextInput
                style={styles.input}
                value={form.dieta}
                onChangeText={(v) => setForm((f) => ({ ...f, dieta: v }))}
              />
            </View>

            {/* ERA */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Era</Text>
              <TextInput
                style={styles.input}
                value={form.era}
                onChangeText={(v) => setForm((f) => ({ ...f, era: v }))}
              />
            </View>

            {/* DATO CURIOSO */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Dato curioso</Text>
              <TextInput
                style={[styles.input, styles.multiline]}
                value={form.datoCurioso}
                onChangeText={(v) => setForm((f) => ({ ...f, datoCurioso: v }))}
                multiline
              />
            </View>

            {/* TIPO */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Tipo detectado</Text>
              <View style={styles.readOnly}>
                <Text style={styles.readOnlyText}>{form.tipo}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveBtnText}>
                {saving ? "Guardando..." : "Guardar cambios"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setSelected(null)}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>

          </ScrollView>
        </Modal>

        {/* ── MODAL MENÚ MEDIA ── */}
        <Modal
          visible={mediaMenuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMediaMenuVisible(false)}
        >
          <TouchableOpacity
            style={styles.menuOverlay}
            activeOpacity={1}
            onPress={() => setMediaMenuVisible(false)}
          >
            <View style={styles.menuSheet}>
              <Text style={styles.menuTitle}>Seleccionar multimedia</Text>

              <TouchableOpacity style={styles.menuOption} onPress={takePhoto}>
                <View style={styles.menuIconCamera}>
                  <View style={styles.menuIconCameraBody} />
                  <View style={styles.menuIconCameraLens} />
                </View>
                <Text style={styles.menuOptionText}>Tomar foto</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuOption} onPress={recordVideo}>
                <View style={styles.menuIconVideo}>
                  <View style={styles.menuIconVideoRect} />
                  <View style={styles.menuIconVideoTriangle} />
                </View>
                <Text style={styles.menuOptionText}>Grabar video</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuOption} onPress={pickFromGallery}>
                <View style={styles.menuIconGallery}>
                  <View style={styles.menuIconGalleryRect} />
                  <View style={styles.menuIconGalleryMountain} />
                </View>
                <Text style={styles.menuOptionText}>Elegir de galería</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuCancel}
                onPress={() => setMediaMenuVisible(false)}
              >
                <Text style={styles.menuCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: {
    flex: 1,
    backgroundColor: "#F8F7F4",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // CARD
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E0D8",
    overflow: "hidden",
  },
  cardMain: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: "#ddd",
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a2e1e",
  },
  cardSub: {
    fontSize: 13,
    color: "#7A7468",
    marginTop: 2,
  },
  tagRow: {
    flexDirection: "row",
    marginTop: 5,
    gap: 6,
    flexWrap: "wrap",
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  tagEditable: {
    backgroundColor: "#EAF2EC",
    borderColor: "#1a4d2e",
  },
  tag3D: {
    backgroundColor: "#F0EDFF",
    borderColor: "#6B4EFF",
  },
  tagLocated: {
    backgroundColor: "#EAF2EC",
    borderColor: "#1a4d2e",
  },
  tagNoLocation: {
    backgroundColor: "#FFF4ED",
    borderColor: "#C4855A",
  },
  tagText: {
    fontSize: 10,
    fontWeight: "700",
  },
  tagTextEditable: { color: "#1a4d2e" },
  tagText3D: { color: "#6B4EFF" },
  tagTextLocated: { color: "#1a4d2e" },
  tagTextNoLocation: { color: "#C4855A" },

  // INDICADOR UBICACIÓN (pin minimalista dentro del tag)
  locationDotWrapper: {
    width: 8,
    height: 10,
    alignItems: "center",
  },
  locationDotWrapperOff: {},
  locationDotPin: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: "#1a4d2e",
    backgroundColor: "#1a4d2e",
  },
  locationDotPinOff: {
    borderColor: "#C4855A",
    backgroundColor: "transparent",
  },
  locationDotTail: {
    width: 1.5,
    height: 3,
    backgroundColor: "#1a4d2e",
    borderRadius: 1,
  },
  locationDotTailOff: {
    backgroundColor: "#C4855A",
  },

  // LÁPIZ
  pencilWrapper: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  pencilBody: {
    width: 2.5,
    height: 12,
    backgroundColor: "#1a4d2e",
    borderRadius: 1,
    transform: [{ rotate: "-45deg" }],
  },
  pencilNib: {
    position: "absolute",
    bottom: 1,
    width: 0,
    height: 0,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 5,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#1a4d2e",
    transform: [{ rotate: "-45deg" }],
  },

  // BOTÓN MAPA
  mapBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2EC",
    paddingVertical: 10,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E0D8",
  },
  mapBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1a4d2e",
  },
  mapIconWrapper: {
    width: 16,
    height: 16,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  mapIconPin: {
    width: 8,
    height: 10,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#1a4d2e",
    backgroundColor: "transparent",
  },
  mapIconDot: {
    width: 2.5,
    height: 4,
    backgroundColor: "#1a4d2e",
    borderRadius: 1,
  },

  // MODAL EDICIÓN
  modal: {
    padding: 24,
    paddingTop: 48,
    backgroundColor: "#F8F7F4",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1a4d2e",
    marginBottom: 24,
  },
  mediaContainer: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#ddd",
    marginBottom: 20,
  },
  preview: { width: "100%", height: "100%" },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingVertical: 10,
    alignItems: "center",
  },
  imageOverlayText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  field: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
    color: "#4A4540",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  readOnly: {
    backgroundColor: "#ECE8E2",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  readOnlyText: { color: "#666", fontSize: 15 },
  saveBtn: {
    backgroundColor: "#1a4d2e",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
  },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  cancelBtn: { alignItems: "center", paddingVertical: 16 },
  cancelBtnText: { color: "#7A7468", fontSize: 14 },

  // MODAL MENÚ MEDIA
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  menuSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1a2e1e",
    marginBottom: 20,
    textAlign: "center",
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0EDE8",
    gap: 16,
  },
  menuOptionText: {
    fontSize: 16,
    color: "#1a2e1e",
    fontWeight: "600",
  },

  // ÍCONO CÁMARA
  menuIconCamera: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  menuIconCameraBody: {
    width: 20,
    height: 14,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#1a4d2e",
  },
  menuIconCameraLens: {
    position: "absolute",
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 2,
    borderColor: "#1a4d2e",
  },

  // ÍCONO VIDEO
  menuIconVideo: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 2,
  },
  menuIconVideoRect: {
    width: 14,
    height: 12,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: "#1a4d2e",
  },
  menuIconVideoTriangle: {
    width: 0,
    height: 0,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderLeftWidth: 7,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "#1a4d2e",
  },

  // ÍCONO GALERÍA
  menuIconGallery: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  menuIconGalleryRect: {
    width: 20,
    height: 16,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: "#1a4d2e",
  },
  menuIconGalleryMountain: {
    position: "absolute",
    bottom: 5,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#1a4d2e",
  },

  menuCancel: { alignItems: "center", paddingVertical: 16, marginTop: 4 },
  menuCancelText: { fontSize: 15, color: "#7A7468", fontWeight: "600" },
});