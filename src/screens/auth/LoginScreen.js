import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';

import { loginUser } from '../../services/authService';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await loginUser(email, password);
    } catch (error) {
      Alert.alert('Error', error.message);
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

          {/* Contenido */}
          <View style={styles.content}>

            {/* HERO */}
            <View style={styles.hero}>

              {/* ICONO SIN FONDO */}
              <Image
                source={require('../../assets/PaleoAR_icono.png')}
                style={styles.logo}
              />

              {/* TITULO */}
              <Text style={styles.title}>
                Paleo
                <Text style={styles.titleAccent}>
                  AR
                </Text>
              </Text>

              {/* SUBTITULO */}
              <Text style={styles.subtitle}>
                Un viaje moderno por el museo de fósiles
              </Text>

              {/* PILLS */}
              <View style={styles.pillRow}>

                <View style={styles.pill}>
                  <Text style={styles.pillText}>
                    AR
                  </Text>
                </View>

                <View style={styles.pill}>
                  <Text style={styles.pillText}>
                    Museo de Fósiles
                  </Text>
                </View>

              </View>

            </View>

            {/* CARD */}
            <View style={styles.card}>

              <Text style={styles.sectionLabel}>
                Inicio de sesión
              </Text>

              {/* EMAIL */}
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

              {/* PASSWORD */}
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

              {/* FORGOT */}
              <TouchableOpacity>
                <Text style={styles.forgot}>
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>

              {/* BOTON */}
              <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
              >
                <Text style={styles.buttonText}>
                  Iniciar sesión
                </Text>
              </TouchableOpacity>

              {/* DIVIDER */}
              <View style={styles.divider}>

                <View style={styles.dividerLine} />

                <Text style={styles.dividerText}>
                  o
                </Text>

                <View style={styles.dividerLine} />

              </View>

              {/* FOOTER */}
              <View style={styles.footer}>

                <Text style={styles.footerText}>
                  ¿No tienes cuenta?
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('Register')
                  }
                >
                  <Text style={styles.footerLink}>
                    Crear una
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

  // CONTENIDO
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

    paddingBottom: 26,

    width: '100%',
  },

  // ICONO
 logo: {
  width: 600,
  height: 170,

  resizeMode: 'contain',

  marginBottom: 6,
},

  title: {
    fontSize: 42,

    fontWeight: '900',

    color: '#1a2e1e',

    letterSpacing: 1,

    marginBottom: 8,
  },

  titleAccent: {
    color: '#1a4d2e',
  },

  subtitle: {
    fontSize: 14,

    color: '#7A7468',

    textAlign: 'center',

    lineHeight: 22,

    maxWidth: 260,

    marginBottom: 18,
  },

  // PILLS
  pillRow: {
    flexDirection: 'row',
    gap: 8,
  },

  pill: {
    backgroundColor: '#EAF2EC',

    borderWidth: 1,
    borderColor: '#C2DDC9',

    borderRadius: 20,

    paddingVertical: 5,
    paddingHorizontal: 14,
  },

  pillText: {
    fontSize: 11,

    fontWeight: '700',

    color: '#1a4d2e',

    letterSpacing: 0.5,
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

  forgot: {
    textAlign: 'center',

    fontSize: 12.5,

    color: '#9A9080',

    marginBottom: 16,

    textDecorationLine: 'underline',
  },

  button: {
    backgroundColor: '#1a4d2e',

    borderRadius: 14,

    paddingVertical: 16,

    alignItems: 'center',

    marginBottom: 8,
  },

  buttonText: {
    color: '#FFFFFF',

    fontSize: 15,

    fontWeight: '700',

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