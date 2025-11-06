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
  TouchableOpacity 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native'; 
import { Picker } from '@react-native-picker/picker';
import client from '../api/client';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const EditServiceScreen = () => {
  const navigation = useNavigation();
  const route = useRoute(); 
  const { serviceId } = route.params; 

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);

  const [isLoading, setIsLoading] = useState(true); 
  const [isSaving, setIsSaving] = useState(false); 
  const [isDeleting, setIsDeleting] = useState(false); 
  const [error, setError] = useState(null);

  const MAX_PRICE = 9999999;

  useEffect(() => {
    const fetchData = async () => {
      if (!serviceId) {
          setError("ID do serviço não fornecido.");
          setIsLoading(false);
          return;
      }
      try {

        setIsLoading(true);
        setError(null);
      
        const [serviceResponse, categoriesResponse] = await Promise.all([
          client.get(`/services/public/${serviceId}`), 
          client.get('/categories')
        ]);

        const serviceData = serviceResponse.data;
        const fetchedCategories = categoriesResponse.data;

        setTitle(serviceData.title);
        setDescription(serviceData.description);
        setPrice(serviceData.price.toString()); 
        setCategory(serviceData.category);
        setCategories(fetchedCategories);

      } catch (err) {
        setError("Não foi possível carregar os dados do serviço.");
        console.error("Erro ao buscar dados para edição:", err.response?.data || err.message);
        Alert.alert("Erro", "Não foi possível carregar os dados para edição.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [serviceId]); 

  const handleSaveChanges = async () => {
    if (!title || !description || !price || !category) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      Alert.alert("Erro no Preço", "Por favor, insira um preço válido (número maior que zero).");
      return;
    }
    if (numericPrice > MAX_PRICE) {
      Alert.alert("Erro no Preço", `O preço não pode ser superior a R$ ${MAX_PRICE.toLocaleString('pt-BR')}.`);
      return;
    }
    
    setIsSaving(true);
    setError(null);
    try {
      const updatedData = {
        title,
        description,
        price: parseFloat(price),
        category
      };
      
      await client.put(`/services/private/${serviceId}`, updatedData);
      Alert.alert(
        "Sucesso!",
        "Anúncio atualizado.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      const apiError = err.response?.data?.error || "Não foi possível salvar as alterações.";
      setError(apiError);
      Alert.alert("Erro ao Salvar", apiError);
      console.error("Erro ao atualizar serviço:", err.response?.data || err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteService = () => {
    Alert.alert(
      "Confirmar Exclusão",
      "Você tem certeza que deseja excluir este anúncio? Esta ação é irreversível.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            setError(null);

            try {
              await client.delete(`/services/private/${serviceId}`);
              Alert.alert(
                "Sucesso!",
                "Anúncio excluído.",
                [{ text: "OK", onPress: () => navigation.goBack() }]
              );
            } catch (err) {
              const apiError = err.response?.data?.error || "Não foi possível excluir o anúncio.";
              setError(apiError);
              Alert.alert("Erro ao Excluir", apiError);
              console.error("Erro ao deletar serviço:", err.response?.data || err.message);
              setIsDeleting(false); 
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (error && !title) { 
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screenContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Editar Anúncio</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Título</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} multiline />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Preço (R$)</Text>
          <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Categoria</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={category} onValueChange={(itemValue) => setCategory(itemValue)}>
              {categories.map((cat, index) => (
                <Picker.Item key={index} label={cat} value={cat} />
              ))}
            </Picker>
          </View>
        </View>

        {error && <Text style={styles.apiErrorText}>{error}</Text>}

        {isSaving ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.spinner} />
        ) : (
          <Button title="Salvar Alterações" onPress={handleSaveChanges} color={COLORS.primary} disabled={isDeleting} />
        )}

        {isDeleting ? (
            <ActivityIndicator size="large" color="red" style={styles.spinner}/>
        ) : (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteService} disabled={isSaving}>
                <Text style={styles.deleteButtonText}>Excluir Anúncio</Text>
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
    minHeight: 50, 
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 10, 
    fontSize: 16,
    color: COLORS.text,
  },
  textArea: {
    height: 120, 
    textAlignVertical: 'top', 
  },
  pickerContainer: {
    backgroundColor: COLORS.white,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: SIZES.radius,
  },
  spinner: {
    marginTop: SIZES.padding * 1.5,
    marginBottom: SIZES.padding,
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
  },
  deleteButton: {
      marginTop: SIZES.padding * 1.5, 
      paddingVertical: 12,
      borderRadius: SIZES.radius,
      borderWidth: 1,
      borderColor: 'red',
      alignItems: 'center',
  },
  deleteButtonText: {
      color: 'red',
      fontSize: 16,
      fontWeight: 'bold',
  }
});

export default EditServiceScreen;