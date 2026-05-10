import React, { useContext } from 'react';

import { NavigationContainer } from '@react-navigation/native';

import { AuthContext } from '../context/AuthContext';

import AuthNavigator from './AuthNavigator';

import AppNavigator from './AppNavigator';

export default function RootNavigator() {
  const { user } =
    useContext(AuthContext);

  return (
    <NavigationContainer>
      {user ? (
        <AppNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}