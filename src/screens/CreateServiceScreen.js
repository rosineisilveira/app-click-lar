import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import client from '../api/client';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const CreateServiceScreen = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(''); 
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const MAX_PRICE = 9999999;

  useEffect(() => {
    
    client.get('/categories')
      .then(response => {
        setCategories(response.data);

      })
      .catch(error => {
        console.error("Erro ao buscar categorias:", error);
        Alert.alert("Erro", "Não foi possível carregar as categorias.");
      });
  }, []);

  const handleCreateService = async () => {
    
    if (!title || !description || !price || !category) {
      Alert.alert("Campos Obrigatórios", "Por favor, preencha todos os campos, incluindo a categoria.");
      return;
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      Alert.alert("Erro no Preço", "Por favor, insira um preço válido maior que zero.");
      return;
    }
    if (numericPrice > MAX_PRICE) {
      Alert.alert("Erro no Preço", `O preço não pode ser superior a R$ ${MAX_PRICE.toLocaleString('pt-BR')}.`);
      return;
    }

    setIsLoading(true);
    try {
      const serviceData = {
        title,
        description,
        price: numericPrice,
        category
      };

      const response = await client.post('/services/private', serviceData);

      if (response.status === 201) {
        Alert.alert(
          "Sucesso!",
          "Seu anúncio foi criado.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Não foi possível criar o anúncio.";
      Alert.alert("Erro", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Cadastrar Novo Anúncio</Text>
        
        <View style={styles.inputGroup}>
            <Text style={styles.label}>Título</Text>
            <TextInput
                style={styles.input}
                placeholder="ex: Eletricista Residencial"
                placeholderTextColor={COLORS.gray}
                value={title}
                onChangeText={setTitle}
            />
        </View>
        
        <View style={styles.inputGroup}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Descreva detalhadamente seu serviço..."
                placeholderTextColor={COLORS.gray}
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
            />
        </View>
        
        <View style={styles.inputGroup}>
            <Text style={styles.label}>Preço (R$)</Text>
            <TextInput
              style={styles.input}
              placeholder="ex: 150.00"
              placeholderTextColor={COLORS.gray}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
        </View>

        <View style={styles.inputGroup}>
            <Text style={styles.label}>Categoria</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={category}
                onValueChange={(itemValue, itemIndex) => {
                    
                    if (itemValue === "") {
                        setCategory("");
                        return;
                    }
                    //console.log("Categoria selecionada:", itemValue); 
                    setCategory(itemValue);
                }}
                style={styles.picker} 
                
                mode="dropdown" 
                dropdownIconColor={COLORS.primary}
              >
                
                <Picker.Item label="Selecione uma categoria..." value="" color={COLORS.gray} />
                
                {categories.map((cat, index) => (
                  <Picker.Item key={index} label={cat} value={cat} color={COLORS.text} />
                ))}
              </Picker>
            </View>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.spinner} />
        ) : (
          <TouchableOpacity style={styles.submitButton} onPress={handleCreateService}>
            <Text style={styles.submitButtonText}>Publicar Anúncio</Text>
          </TouchableOpacity>
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
    padding: SIZES.padding * 1.5,
    paddingBottom: 50, 
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
    marginLeft: 5,
  },
  input: {
    backgroundColor: COLORS.white,
    minHeight: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    fontSize: 16,
    color: COLORS.text,
  },
  textArea: {
    height: 120,
    paddingTop: 15,
  },
 
  pickerContainer: {
    backgroundColor: COLORS.white,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: SIZES.radius,
    justifyContent: 'center', 
  },
  picker: {
    height: 55, 
    width: '100%',
    color: COLORS.text,
    backgroundColor: COLORS.white, 
  },
  spinner: {
    marginTop: SIZES.padding * 1.5,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: SIZES.padding,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default CreateServiceScreen;