import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import client from '../api/client';

const CreateServiceScreen = ({ navigation }) => {
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
        if (response.data.length > 0) {
          setCategory(response.data[0]); 
        }
      })
      .catch(error => {
        console.error("Erro ao buscar categorias:", error);
        Alert.alert("Erro", "Não foi possível carregar as categorias.");
      });
  }, []);

  const handleCreateService = async () => {
    
    if (!title || !description || !price || !category) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      Alert.alert("Erro no Preço", "Por favor, insira um preço válido (apenas números maior que zero).");
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
        price: parseFloat(price), 
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cadastrar Novo Anúncio</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Título do Anúncio (ex: Eletricista...)"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Descrição detalhada do seu serviço"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Preço (ex: 150.00)"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Categoria</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={category}
          onValueChange={(itemValue) => setCategory(itemValue)}
        >
          {categories.map((cat, index) => (
            <Picker.Item key={index} label={cat} value={cat} />
          ))}
        </Picker>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <Button title="Publicar Anúncio" onPress={handleCreateService} />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: 'gray',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  pickerContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
  },
});

export default CreateServiceScreen;