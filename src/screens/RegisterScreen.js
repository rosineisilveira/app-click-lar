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

const RegisterScreen = () => {
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); 
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false); 

  const nameRegex = /^[a-zA-ZÀ-ÿ ]{3,}$/;
  const phoneRegex = /^\d{10,11}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; 

  const handleRegister = async () => {
    
    if (!name || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }
    if (!nameRegex.test(name)) {
       Alert.alert('Erro no Nome', 'Nome inválido (mínimo 3 letras) sem números.'); return;
    }
    if (!emailRegex.test(email)) { 
        Alert.alert('Erro no E-mail', 'Por favor, insira um e-mail válido.');
        return;
    }
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
       Alert.alert('Erro no Telefone', 'Telefone inválido (10 ou 11 números).'); return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.'); return;
    }
    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.'); return;
    }

    setIsLoading(true);
    try {
      const userData = { name, email, phone, password };
      const response = await client.post('/register', userData);
      if (response.status === 201) {
        Alert.alert(
          'Sucesso!',
          'Sua conta foi criada. Faça o login.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Não foi possível completar o cadastro.';
      Alert.alert('Erro no Cadastro', errorMessage);
      console.error("Erro no cadastro:", error.response?.data || error.message);
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
          <Text style={styles.title}>Crie sua Conta de Prestador</Text>

          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome Completo *</Text>
            <TextInput style={styles.input} placeholder="Como você quer ser chamado" value={name} onChangeText={setName} autoCapitalize="words"/>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail </Text>
            <TextInput style={styles.input} placeholder="seu@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"/>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefone (WhatsApp) *</Text>
            <TextInput style={styles.input} placeholder="(XX) XXXXX-XXXX" value={phone} onChangeText={setPhone} keyboardType="phone-pad"/>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible} 
              />
              <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
                <Feather name={isPasswordVisible ? "eye-off" : "eye"} size={20} color={COLORS.gray} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirme a Senha *</Text>
             <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Digite a senha novamente"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
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
            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <Text style={styles.registerButtonText}>Cadastrar</Text>
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
  registerButton: {
      backgroundColor: COLORS.primary,
      paddingVertical: 15,
      borderRadius: SIZES.radius,
      alignItems: 'center',
      marginTop: SIZES.padding,
  },
  registerButtonText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: 'bold',
  }
});

export default RegisterScreen;