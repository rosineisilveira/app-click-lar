import React, { useEffect, useContext, useCallback } from 'react';
import { View } from 'react-native';
import { AuthProvider, AuthContext } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';
import * as SplashScreen from 'expo-splash-screen';

// Impede a splash screen de desaparecer sozinha antes da hora
SplashScreen.preventAutoHideAsync();

function Root() {
  const { isLoading } = useContext(AuthContext);

  const onLayoutRootView = useCallback(async () => {
    
    if (!isLoading) {
      await SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return null; 
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <AppNavigator />
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}