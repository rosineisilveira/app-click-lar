import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import client from '../api/client'; 
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { Feather } from '@expo/vector-icons'; 
import { SafeAreaView } from 'react-native-safe-area-context';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login } = useContext(AuthContext); 
  
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); 

  const handleLogin = async () => {
    
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha o email e a senha.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password); 
    } catch (error) {
      Alert.alert('Erro no Login', error.message || "Não foi possível fazer o login.");
      console.error("Erro no login:", error);
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
          <Text style={styles.title}>Bem-vindo!</Text>
          <Text style={styles.subtitle}>Faça login para continuar</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
                style={styles.input}
                placeholder="Digite seu Email de usuário"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
             />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Digite sua senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible} 
              />
              <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
                <Feather name={isPasswordVisible ? "eye-off" : "eye"} size={20} color={COLORS.gray} />
              </TouchableOpacity>
            </View>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={styles.spinner}/>
          ) : (
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Entrar</Text>
            </TouchableOpacity>
          )}

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Não tem uma conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>

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
    ...FONTS.h1, 
    textAlign: 'center',
    marginBottom: SIZES.base,
    color: COLORS.primary, 
  },
  subtitle: {
    ...FONTS.body,
    textAlign: 'center',
    marginBottom: SIZES.padding * 2, 
    color: COLORS.gray,
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
   forgotPassword: {
     alignSelf: 'flex-end', 
     marginBottom: SIZES.padding * 1.5,
   },
   forgotPasswordText: {
     color: COLORS.primary,
     fontSize: 14,
   },
  spinner: {
    marginTop: SIZES.padding * 1.5,
  },
  loginButton: {
      backgroundColor: COLORS.primary,
      paddingVertical: 15,
      borderRadius: SIZES.radius,
      alignItems: 'center',
      marginTop: SIZES.padding, 
  },
  loginButtonText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: 'bold',
  },
  registerContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: SIZES.padding * 2, 
  },
  registerText: {
      ...FONTS.body,
      color: COLORS.gray,
  },
  registerLink: {
      ...FONTS.body,
      color: COLORS.primary,
      fontWeight: 'bold',
  }
});

export default LoginScreen;