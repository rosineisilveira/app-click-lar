import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet, Alert,
  ScrollView, ActivityIndicator, TouchableOpacity
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import client from '../api/client';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const EditServiceScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const serviceId = route.params?.serviceId;

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
  
        const [catRes, serviceRes] = await Promise.all([
          client.get('/categories'),
          client.get(`/services/public/${serviceId}`)
        ]);

        setCategories(catRes.data);

        const service = serviceRes.data;
        setTitle(service.title || '');
        setDescription(service.description || '');
        setPrice(service.price?.toString() || '');
        setCategory(service.category || '');

      } catch (err) {
        console.error("Erro ao carregar dados para edição:", err);
        setError("Não foi possível carregar os dados do serviço.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [serviceId]);

  const handleSaveChanges = async () => {
    if (!title || !description || !price || !category) {
      Alert.alert("Erro", "Por favor, preencha todos os campos."); return;
    }
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0 || numericPrice > MAX_PRICE) {
       Alert.alert("Erro", "Preço inválido."); return;
    }

    setIsSaving(true);
    try {
      await client.put(`/services/private/${serviceId}`, {
        title, description, price: numericPrice, category
      });
      Alert.alert("Sucesso!", "Anúncio atualizado.", [{ text: "OK", onPress: () => navigation.goBack() }]);
    } catch (err) {
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteService = () => {
    Alert.alert("Confirmar Exclusão", "Tem certeza?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: async () => {
          setIsDeleting(true);
          try {
            await client.delete(`/services/private/${serviceId}`);
            navigation.goBack();
          } catch (err) {
            Alert.alert("Erro", "Não foi possível excluir.");
            setIsDeleting(false);
          }
      }}
    ]);
  };

  if (isLoading) return <ActivityIndicator size="large" color={COLORS.primary} style={styles.center} />;
  if (error) return <View style={styles.center}><Text style={{ color: 'red' }}>{error}</Text></View>;

  return (
    <SafeAreaView style={styles.screenContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Editar Anúncio</Text>

        <View style={styles.inputGroup}>
            <Text style={styles.label}>Título</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholderTextColor={COLORS.gray} />
        </View>

        <View style={styles.inputGroup}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} multiline textAlignVertical="top" placeholderTextColor={COLORS.gray} />
        </View>

        <View style={styles.inputGroup}>
            <Text style={styles.label}>Preço (R$)</Text>
            <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholderTextColor={COLORS.gray} />
        </View>

        <View style={styles.inputGroup}>
            <Text style={styles.label}>Categoria</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={category}
                onValueChange={(itemValue) => setCategory(itemValue)}
                style={styles.picker}
                dropdownIconColor={COLORS.primary}
                mode="dropdown"
              >
        
                {categories.map((cat, index) => (
                  <Picker.Item
                    key={index}
                    label={cat}
                    value={cat}
                    color={COLORS.text}
                    style={{ backgroundColor: COLORS.white }}
                  />
                ))}
              </Picker>
            </View>
        </View>

        {isSaving ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.spinner} />
        ) : (
          <Button title="Salvar Alterações" onPress={handleSaveChanges} color={COLORS.primary} />
        )}

        {!isSaving && (
           isDeleting ? <ActivityIndicator size="large" color="red" style={styles.spinner} /> :
           <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteService}>
               <Text style={styles.deleteButtonText}>Excluir Anúncio</Text>
           </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: COLORS.lightGray },
  scrollContent: { padding: SIZES.padding * 1.5, paddingBottom: 30 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { ...FONTS.h2, textAlign: 'center', marginBottom: SIZES.padding * 1.5, color: COLORS.text },
  inputGroup: { marginBottom: SIZES.padding * 1.2 },
  label: { ...FONTS.body, fontSize: 14, color: COLORS.gray, marginBottom: SIZES.base / 2, marginLeft: 5 },
  input: { backgroundColor: COLORS.white, minHeight: 50, borderColor: '#ddd', borderWidth: 1, borderRadius: SIZES.radius, paddingHorizontal: SIZES.padding, fontSize: 16, color: COLORS.text },
  textArea: { height: 120, paddingTop: 15 },
  pickerContainer: { backgroundColor: COLORS.white, borderColor: '#ddd', borderWidth: 1, borderRadius: SIZES.radius, justifyContent: 'center', overflow: 'hidden' },
  picker: { height: 55, width: '100%', color: COLORS.text, backgroundColor: COLORS.white },
  spinner: { marginVertical: 20 },
  deleteButton: { marginTop: 30, paddingVertical: 12, borderRadius: SIZES.radius, borderWidth: 1, borderColor: 'red', alignItems: 'center' },
  deleteButtonText: { color: 'red', fontSize: 16, fontWeight: 'bold' }
});

export default EditServiceScreen;