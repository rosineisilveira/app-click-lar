import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; 
import client from '../api/client';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const EditProfileScreen = () => {
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [initialData, setInitialData] = useState(null); 
  const [isLoading, setIsLoading] = useState(true); 
  const [isSaving, setIsSaving] = useState(false); 
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await client.get('/users/private/profile');
        const userData = response.data;
        setInitialData(userData);

        setName(userData.name);
        setEmail(userData.email);
        setPhone(userData.phone);

      } catch (err) {
        setError("Não foi possível carregar seus dados.");
        console.error("Erro ao buscar perfil para edição:", err.response?.data || err.message);
        Alert.alert("Erro", "Não foi possível carregar seus dados para edição.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []); 

  const handleSave = async () => {
    
    if (!name || !email || !phone) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    
    if (initialData && name === initialData.name && email === initialData.email && phone === initialData.phone) {
      Alert.alert("Nenhuma Alteração", "Você não modificou nenhum dado.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const updatedData = { name, email, phone };
      
      await client.put('/users/private/profile', updatedData);

      Alert.alert(
        "Sucesso!",
        "Seu perfil foi atualizado.",
        [{ text: "OK", onPress: () => navigation.goBack() }] 
      );

    } catch (err) {
      const apiError = err.response?.data?.error || "Não foi possível salvar as alterações.";
      setError(apiError);
      Alert.alert("Erro ao Salvar", apiError);
      console.error("Erro ao atualizar perfil:", err.response?.data || err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (error && !initialData) { 
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Tentar Novamente" onPress={() => { /* Lógica para tentar buscar de novo */ }}/>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screenContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Editar Perfil</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome Completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Seu nome"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Telefone (WhatsApp)</Text>
          <TextInput
            style={styles.input}
            placeholder="(XX) XXXXX-XXXX"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        {error && <Text style={styles.apiErrorText}>{error}</Text>}

        {isSaving ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.spinner} />
        ) : (
          <Button title="Salvar Alterações" onPress={handleSave} color={COLORS.primary} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  scrollContent: {
    padding: SIZES.padding,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  title: {
    ...FONTS.h2,
    textAlign: 'center',
    marginBottom: SIZES.padding * 1.5,
    color: COLORS.text,
  },
  inputGroup: {
    marginBottom: SIZES.padding * 1.2,
  },
  label: {
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: SIZES.base / 2,
  },
  input: {
    backgroundColor: COLORS.white,
    height: 50,
    borderColor: '#ddd', 
    borderWidth: 1,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    fontSize: 16,
    color: COLORS.text,
  },
  spinner: {
    marginTop: SIZES.padding,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: SIZES.padding,
  },
  apiErrorText: {
      color: 'red',
      textAlign: 'center',
      marginBottom: SIZES.padding,
      fontSize: 14,
  }
});

export default EditProfileScreen;