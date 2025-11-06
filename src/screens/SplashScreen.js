import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

const SplashScreen = () => (
  <View style={styles.container}>
    <Text style={styles.logo}>MeuApp de Serviços</Text>
    <ActivityIndicator size="large" color="#0000ff" />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
});

export default SplashScreen;