import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Image,
  SafeAreaView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { getDinosaurs, updateDinosaur, uploadDinosaurImage } from "../../services/dinosaurService";
import Header from "../../components/Header";

export default function EditDinosaursScreen({ navigation }) {
  const [dinosaurs, setDinosaurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    load();
  }, []);

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

  const openEdit = (dino) => {
    setSelected(dino);
    setForm({
      nombre: dino.nombre,
      dieta: dino.dieta,
      era: dino.era,
      datoCurioso: dino.datoCurioso,
      mediaURL: dino.mediaURL,
      targetName: dino.targetName,
      tipo: dino.tipo,
    });
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Se necesita acceso a la galería.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled) return;

    const localUri = result.assets[0].uri;
    setUploadingImage(true);
    try {
      const downloadURL = await uploadDinosaurImage(selected.id, localUri);
      setForm((f) => ({ ...f, mediaURL: downloadURL }));
      await updateDinosaur(selected.id, { mediaURL: downloadURL });
      setDinosaurs((prev) =>
        prev.map((d) => (d.id === selected.id ? { ...d, mediaURL: downloadURL } : d))
      );
      Alert.alert("Listo", "Imagen actualizada.");
    } catch {
      Alert.alert("Error", "No se pudo subir la imagen.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDinosaur(selected.id, { datoCurioso: form.datoCurioso });
      setDinosaurs((prev) =>
        prev.map((d) => (d.id === selected.id ? { ...d, datoCurioso: form.datoCurioso } : d))
      );
      setSelected(null);
      Alert.alert("Listo", "Dato curioso actualizado.");
    } catch {
      Alert.alert("Error", "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity style={styles.cardMain} onPress={() => openEdit(item)}>
        <Image source={{ uri: item.mediaURL }} style={styles.thumb} />
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.nombre}</Text>
          <Text style={styles.cardSub}>{item.era} · {item.dieta}</Text>
          <Text style={styles.locationTag}>
            {item.ubicacion ? "📍 Ubicación guardada" : "📍 Sin ubicación"}
          </Text>
        </View>
        <Text style={styles.editIcon}>✎</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.mapBtn}
        onPress={() => navigation.navigate("LocationPicker", { dinosaur: item })}
      >
        <Text style={styles.mapBtnText}>🗺 Editar ubicación AR</Text>
      </TouchableOpacity>
    </View>
  );

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

      <Modal
        visible={!!selected}
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <ScrollView contentContainerStyle={styles.modal}>
          <Text style={styles.modalTitle}>{form.nombre}</Text>

          {/* IMAGEN */}
          <TouchableOpacity style={styles.imageContainer} onPress={handlePickImage} disabled={uploadingImage}>
            {form.mediaURL ? (
              <Image source={{ uri: form.mediaURL }} style={styles.preview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>Sin imagen</Text>
              </View>
            )}
            <View style={styles.imageOverlay}>
              {uploadingImage
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.imageOverlayText}>📷 Cambiar imagen</Text>
              }
            </View>
          </TouchableOpacity>

          {/* INFO DE SOLO LECTURA */}
          {[
            { label: "Dieta", value: form.dieta },
            { label: "Era", value: form.era },
            { label: "Tipo", value: form.tipo },
            { label: "Target Name", value: form.targetName },
          ].map(({ label, value }) => (
            <View key={label} style={styles.field}>
              <Text style={styles.fieldLabel}>{label}</Text>
              <View style={styles.readOnly}>
                <Text style={styles.readOnlyText}>{value}</Text>
              </View>
            </View>
          ))}

          {/* EDITABLE */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Dato Curioso</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={form.datoCurioso}
              onChangeText={(v) => setForm((f) => ({ ...f, datoCurioso: v }))}
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveBtnText}>
              {saving ? "Guardando…" : "Guardar dato curioso"}
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F7F4",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F7F4",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E0D8",
    elevation: 2,
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
    backgroundColor: "#EAF2EC",
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
  locationTag: {
    fontSize: 11,
    color: "#1a4d2e",
    marginTop: 4,
    fontWeight: "600",
  },
  editIcon: {
    fontSize: 20,
    color: "#1a4d2e",
    paddingLeft: 8,
  },
  mapBtn: {
    backgroundColor: "#EAF2EC",
    paddingVertical: 10,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E5E0D8",
  },
  mapBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1a4d2e",
  },
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
  field: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4A4540",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E0DAD0",
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#1a2010",
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  imageContainer: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "#EAF2EC",
  },
  preview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    color: "#7A7468",
    fontSize: 14,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingVertical: 8,
    alignItems: "center",
  },
  imageOverlayText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  readOnly: {
    backgroundColor: "#F0EDE8",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E0DAD0",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  readOnlyText: {
    fontSize: 15,
    color: "#7A7468",
  },
  saveBtn: {
    backgroundColor: "#1a4d2e",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 10,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 14,
  },
  cancelBtnText: {
    color: "#7A7468",
    fontSize: 14,
  },
});
