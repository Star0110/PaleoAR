import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';

import {
  registerUser,
  logoutUser,
} from '../../services/authService';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      await registerUser(
        name,
        email,
        password
      );

      await logoutUser();

      Alert.alert(
        'Éxito',
        'Usuario registrado. Por favor inicia sesión.',
        [
          {
            text: 'Ir a login',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.message
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>

          {/* Barra superior */}
          <View style={styles.topBar} />

          {/* Contenido centrado */}
          <View style={styles.content}>

            {/* Hero */}
            <View style={styles.hero}>
              <Text style={styles.title}>
                Crear
                <Text style={styles.titleAccent}>
                  {' '}cuenta
                </Text>
              </Text>

              <Text style={styles.subtitle}>
                Únete y empieza a explorar el museo de fósiles con realidad aumentada
              </Text>
            </View>

            {/* Card */}
            <View style={styles.card}>

              <Text style={styles.sectionLabel}>
                Datos de registro
              </Text>

              {/* Nombre */}
              <Text style={styles.fieldLabel}>
                Nombre completo
              </Text>

              <TextInput
                placeholder='Tu nombre'
                placeholderTextColor='#B0A898'
                style={styles.input}
                value={name}
                onChangeText={setName}
              />

              {/* Correo */}
              <Text style={styles.fieldLabel}>
                Correo electrónico
              </Text>

              <TextInput
                placeholder='tu@correo.com'
                placeholderTextColor='#B0A898'
                keyboardType='email-address'
                autoCapitalize='none'
                style={styles.input}
                value={email}
                onChangeText={setEmail}
              />

              {/* Contraseña */}
              <Text style={styles.fieldLabel}>
                Contraseña
              </Text>

              <TextInput
                placeholder='••••••••'
                placeholderTextColor='#B0A898'
                secureTextEntry
                style={styles.input}
                value={password}
                onChangeText={setPassword}
              />

              {/* Botón */}
              <TouchableOpacity
                style={styles.button}
                onPress={handleRegister}
              >
                <Text style={styles.buttonText}>
                  Registrarse
                </Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />

                <Text style={styles.dividerText}>
                  o
                </Text>

                <View style={styles.dividerLine} />
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  ¿Ya tienes cuenta?
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('Login')
                  }
                >
                  <Text style={styles.footerLink}>
                    Iniciar sesión
                  </Text>
                </TouchableOpacity>
              </View>

            </View>

          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8F7F4',
  },

  container: {
    flex: 1,
    backgroundColor: '#F8F7F4',
  },

  topBar: {
    width: '100%',
    height: 5,
    backgroundColor: '#1a4d2e',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },

  // HERO
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
    width: '100%',
  },

  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1a2e1e',
    letterSpacing: 0.5,
    marginBottom: 10,
    textAlign: 'center',
  },

  titleAccent: {
    color: '#1a4d2e',
  },

  subtitle: {
    fontSize: 13.5,
    color: '#7A7468',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },

  // CARD
  card: {
    backgroundColor: '#FFFFFF',

    borderRadius: 28,

    paddingHorizontal: 24,
    paddingVertical: 28,

    width: '88%',

    alignSelf: 'center',

    borderWidth: 1,
    borderColor: '#E5E0D8',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.06,
    shadowRadius: 20,

    elevation: 5,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color: '#1a4d2e',
    marginBottom: 22,
  },

  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4A4540',
    marginBottom: 6,
    letterSpacing: 0.2,
  },

  input: {
    backgroundColor: '#F4F2EE',

    borderRadius: 14,

    borderWidth: 1.5,
    borderColor: '#E0DAD0',

    paddingVertical: 14,
    paddingHorizontal: 16,

    marginBottom: 14,

    fontSize: 15,

    color: '#1a2010',
  },

  button: {
    backgroundColor: '#1a4d2e',

    borderRadius: 14,

    paddingVertical: 16,

    alignItems: 'center',

    marginTop: 6,
    marginBottom: 8,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',

    marginVertical: 16,

    gap: 12,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E0D8',
  },

  dividerText: {
    fontSize: 11,
    color: '#B0A898',
    letterSpacing: 1,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },

  footerText: {
    color: '#7A7068',
    fontSize: 13,
  },

  footerLink: {
    color: '#1a4d2e',
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});