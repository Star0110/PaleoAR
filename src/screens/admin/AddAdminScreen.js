import React, { useState } from 'react';

import {
  View,
  Text,
 TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';

import {
  createUserWithEmailAndPassword,
} from 'firebase/auth';

import {
  doc,
  setDoc,
} from 'firebase/firestore';

import { auth, db } from '../../services/firebase';

import { COLORS } from '../../styles/colors';

export default function AddAdminScreen() {
  const [name, setName] = useState('');

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const createAdmin = async () => {
    try {
      const response =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      await setDoc(
        doc(db, 'users', response.user.uid),
        {
          uid: response.user.uid,
          name,
          email,
          role: 'admin',
        }
      );

      Alert.alert(
        'Éxito',
        'Administrador creado'
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Nuevo Administrador
      </Text>

      <TextInput
        placeholder='Nombre'
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        placeholder='Correo'
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder='Contraseña'
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={createAdmin}
      >
        <Text style={styles.buttonText}>
          Crear Admin
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: COLORS.primary,
  },

  input: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
  },

  button: {
    backgroundColor: COLORS.secondary,
    padding: 15,
    borderRadius: 15,
  },

  buttonText: {
    color: COLORS.white,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});