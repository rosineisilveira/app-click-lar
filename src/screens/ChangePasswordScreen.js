import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import client from '../api/client';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false); 
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false); 
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false); 

  const handleSavePassword = async () => {
    
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert("Erro", "Por favor, preencha todos os campos."); return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert("Erro", "A nova senha e a confirmação não coincidem."); return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Erro", "A nova senha deve ter pelo menos 6 caracteres."); return;
    }
    if (newPassword === currentPassword) {
      Alert.alert("Aviso", "A nova senha não pode ser igual à senha atual."); return;
    }

    setIsLoading(true);
    try {
      await client.put('/users/private/change-password', { currentPassword, newPassword });
      Alert.alert(
        "Sucesso!",
        "Sua senha foi alterada.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Não foi possível alterar a senha.";
      Alert.alert("Erro ao Alterar Senha", errorMessage);
      console.error("Erro ao alterar senha:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Alterar Senha</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha Atual</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Digite sua senha atual"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!isCurrentPasswordVisible}
              />
              <TouchableOpacity onPress={() => setIsCurrentPasswordVisible(!isCurrentPasswordVisible)} style={styles.eyeIcon}>
                <Feather name={isCurrentPasswordVisible ? "eye-off" : "eye"} size={20} color={COLORS.gray} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nova Senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!isNewPasswordVisible}
              />
              <TouchableOpacity onPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)} style={styles.eyeIcon}>
                <Feather name={isNewPasswordVisible ? "eye-off" : "eye"} size={20} color={COLORS.gray} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirme a Nova Senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Digite a nova senha novamente"
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                secureTextEntry={!isConfirmPasswordVisible}
              />
              <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} style={styles.eyeIcon}>
                <Feather name={isConfirmPasswordVisible ? "eye-off" : "eye"} size={20} color={COLORS.gray} />
              </TouchableOpacity>
            </View>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={styles.spinner}/>
          ) : (
            <TouchableOpacity style={styles.saveButton} onPress={handleSavePassword}>
              <Text style={styles.saveButtonText}>Salvar Nova Senha</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SIZES.padding * 1.5,
    justifyContent: 'center',
  },
  title: {
    ...FONTS.h2,
    textAlign: 'center',
    marginBottom: SIZES.padding * 2, 
  },
  inputGroup: {
    marginBottom: SIZES.padding * 1.5, 
  },
  label: {
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: SIZES.base,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: SIZES.radius,
    height: 50,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
    fontSize: 16,
    color: COLORS.text,
  },
  eyeIcon: {
    padding: SIZES.padding * 0.75,
  },
  spinner: {
    marginTop: SIZES.padding * 1.5,
  },
  saveButton: {
      backgroundColor: COLORS.primary,
      paddingVertical: 15,
      borderRadius: SIZES.radius,
      alignItems: 'center',
      marginTop: SIZES.padding * 1.5, 
  },
  saveButtonText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: 'bold',
  }
});

export default ChangePasswordScreen;