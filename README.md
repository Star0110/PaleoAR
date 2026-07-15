# 🦖 PaleoAR

![React Native](https://img.shields.io/badge/React%20Native-Expo-61DAFB?logo=react)
![JavaScript](https://img.shields.io/badge/JavaScript-100%25-F7DF1E?logo=javascript)
![Firebase](https://img.shields.io/badge/Firebase-Auth%2FFirestore%2FStorage%2FFCM-FFCA28?logo=firebase)
![Unity AR](https://img.shields.io/badge/Realidad%20Aumentada-Unity%20%2B%20AR%20Foundation-000000?logo=unity)
![EAS Build](https://img.shields.io/badge/Build-EAS%20Build-4630EB?logo=expo)
![Material Design](https://img.shields.io/badge/UI-Material%20Design-757575?logo=materialdesign)

Aplicación móvil multiplataforma con Realidad Aumentada para museos de fósiles, desarrollada en React Native (Expo). Permite a los visitantes escanear marcadores visuales junto a las vitrinas para desbloquear modelos 3D y contenido interactivo sobre organismos prehistóricos, mientras avanzan en un sistema de gamificación por niveles. Este repositorio contiene el lado de la aplicación móvil (frontend + backend en Firebase); el módulo de Realidad Aumentada vive en [PaleoAR_Unity](https://github.com/Star0110/PaleoAR_Unity).

## 🚀 Tecnologías Clave

| **Capa**              | **Tecnologías**                                                   |
|------------------------|--------------------------------------------------------------------|
| Frontend               | React Native, Expo, Material Design                               |
| Backend / BaaS         | Firebase Authentication, Firestore, Storage, Cloud Messaging (FCM) |
| Realidad Aumentada     | Unity + AR Foundation (integrado vía deep linking)                 |
| Geolocalización        | expo-location                                                      |
| Build & despliegue     | EAS Build                                                          |

## 🔥 Features Destacadas

- 🔐 **Autenticación con roles diferenciados**: cuentas de Jugador (visitante) y Administrador, con flujos y permisos distintos.
- 📷 **Escaneo de fósiles vía RA**: activa el módulo de Realidad Aumentada en Unity mediante deep linking para reconocer marcadores visuales (image targets) junto a las vitrinas.
- 🏆 **Sistema de gamificación por niveles**: progreso registrado en Firestore, con insignias por escanear fósiles (Recolector Prehistórico → Paleontólogo Junior → Leyenda del Museo).
- 🗺️ **Mapa de puntos de interés**: geolocalización en tiempo real de los fósiles disponibles en el museo.
- 🛠️ **Panel de administrador**: gestión de fósiles/puntos de interés, edición de contenido (textos, imágenes, coordenadas GPS) sin necesidad de republicar la app, gestión de usuarios y creación de nuevos administradores.
- 🔔 **Notificaciones push en tiempo real** (Firebase Cloud Messaging) cuando se registra un nuevo fósil o punto de interés.
- 📴 **Funcionamiento offline**: persistencia local del catálogo para consulta sin conexión a internet.
- 🔄 **Sincronización en tiempo real** con Firestore mediante `onSnapshot`.

## 🏗️ Estructura del Proyecto

```
src/
├── context/
│   └── AuthContext.js          # Estado global de autenticación
├── services/
│   ├── firebase.js             # Inicialización y conexión a Firebase
│   ├── authService.js          # Registro, login y logout
│   ├── gamificationService.js  # Lógica de niveles e insignias
│   ├── dinosaurService.js      # Gestión de fósiles y storage
│   └── notificationsService.js # Push y historial in-app
├── hooks/
│   └── useGamification.js      # Hook de progreso del jugador
└── screens/
    └── user/
        ├── ScanScreen.js       # Activación del módulo AR
        └── MapScreen.js        # Mapa con marcadores de fósiles
```

## 👥 Participantes del Proyecto

**Equipo**:
- [@Star](https://github.com/Star0110) — Starenka Susana Ortiz Gallegos
- [@Valentina](https://github.com/ValentinaVillarreal) - Valentina Esquivel Villarreal
- [@IsraelJP](https://github.com/IsraelJP) - Israel Jiménez Palomino


## 📋 Alcance

El proyecto contempla tres puntos de interés (fósiles) reconocibles vía marcadores visuales, dos roles de usuario (administrador y visitante) y actualización remota de contenido sin republicar la app. Quedan fuera del alcance: modelos 3D animados y publicación comercial en tiendas de aplicaciones.

## ⚖️ Licencia

Proyecto académico desarrollado para la materia de Tecnología Móvil, Instituto Tecnológico de Toluca.
