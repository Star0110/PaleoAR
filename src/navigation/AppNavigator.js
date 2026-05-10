import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/user/HomeScreen';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import AddAdminScreen from '../screens/admin/AddAdminScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AdminHome"
        component={AdminHomeScreen}
        options={{ title: 'Admin' }}
      />
      <Stack.Screen
        name="AddAdmin"
        component={AddAdminScreen}
        options={{ title: 'Nuevo administrador' }}
      />
    </Stack.Navigator>
  );
}
