import React, {
  useContext,
} from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import {
  AuthContext,
} from '../../context/AuthContext';

export default function HomeScreen() {

  const {
    role,
  } = useContext(AuthContext);

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        PaleoAR
      </Text>

      {/* ADMIN */}
      {role === 'admin' && (
        <View style={styles.adminBox}>

          <Text style={styles.adminTitle}>
            Panel Administrador
          </Text>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>
              Agregar Dinosaurio
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>
              Administrar Usuarios
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>
              Agregar Administrador
            </Text>
          </TouchableOpacity>

        </View>
      )}

      {/* PLAYER */}
      {role === 'player' && (
        <View style={styles.playerBox}>

          <Text style={styles.playerTitle}>
            Bienvenido Explorador
          </Text>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>
              Escanear Fósil
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>
              Ver Colección
            </Text>
          </TouchableOpacity>

        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#F8F7F4',

    padding: 20,
  },

  title: {
    fontSize: 40,

    fontWeight: '900',

    color: '#1a4d2e',

    marginBottom: 40,
  },

  adminBox: {
    width: '100%',
  },

  playerBox: {
    width: '100%',
  },

  adminTitle: {
    fontSize: 24,

    fontWeight: '700',

    marginBottom: 20,

    color: '#1a4d2e',

    textAlign: 'center',
  },

  playerTitle: {
    fontSize: 24,

    fontWeight: '700',

    marginBottom: 20,

    color: '#1a4d2e',

    textAlign: 'center',
  },

  button: {
    backgroundColor: '#1a4d2e',

    paddingVertical: 16,

    borderRadius: 16,

    marginBottom: 16,

    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',

    fontSize: 16,

    fontWeight: '700',
  },
});