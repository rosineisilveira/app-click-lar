import React, { useState, useContext, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity, 
  ActivityIndicator,
  ScrollView, 
  Alert,
  Image, 
  TextInput 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../api/client';
import { AuthContext } from '../context/AuthContext';
import ServiceCard from '../components/ServiceCard';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons'; 

const headerLogo = require('../../assets/splash.png'); 

const ClassifiedsScreen = ({ navigation }) => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const { userToken } = useContext(AuthContext);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); 
    return () => clearTimeout(timerId); 
  }, [searchQuery]);

  const fetchServices = useCallback(async (categoryFilter = null, searchFilter = null) => {
    try {
      
      if (services.length === 0 || categoryFilter !== selectedCategory || searchFilter !== debouncedSearchQuery) {
         setIsLoading(true);
      }
      let url = '/services/public?';
      const params = [];
      if (categoryFilter && categoryFilter !== 'Todos') {
        params.push(`category=${encodeURIComponent(categoryFilter)}`);
      }
      if (searchFilter && searchFilter.trim() !== '') {
         params.push(`search=${encodeURIComponent(searchFilter.trim())}`);
      }
      url += params.join('&');

      console.log("Buscando serviços com URL:", url);

      const response = await client.get(url);
      setServices(response.data);
    } catch (error) {
      console.error("Erro ao buscar serviços:", error.response?.data || error.message);
      Alert.alert("Erro", "Não foi possível carregar os serviços.");
    } finally {
      setIsLoading(false);
    }
  
  }, [selectedCategory, debouncedSearchQuery]); 

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      
      client.get('/categories')
        .then(response => { if (isMounted) setCategories(['Todos', ...response.data]); })
        .catch(error => { console.error("Erro ao buscar categorias:", error); /* ... */ });

      fetchServices(selectedCategory, debouncedSearchQuery);

      return () => { isMounted = false; };
    }, [fetchServices, selectedCategory, debouncedSearchQuery]) 
  );

  const handleCategoryPress = (category) => {
    setSearchQuery(''); 
    setDebouncedSearchQuery(''); 
    setSelectedCategory(category);
  };

  const renderService = ({ item }) => (
     <ServiceCard
      item={item}
      onPress={() => navigation.navigate('ServiceDetail', { serviceId: item._id })}
    />
  );

  const renderCategoryButton = (category, index) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.categoryButton,
        selectedCategory === category && styles.selectedCategoryButton
      ]}
      onPress={() => handleCategoryPress(category)}
    >
      <Text style={[
          styles.categoryButtonText,
          selectedCategory === category && styles.selectedCategoryButtonText
      ]}>
        {category}
      </Text>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.screenContainer}>
      <View style={styles.header}>
        <Image source={headerLogo} style={styles.headerLogo} resizeMode="contain" />
        <View style={styles.headerActions}>
          {userToken ? (
            <>
              <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('CreateService')}>
                 <Text style={styles.createButtonText}>Criar Anúncio</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
                <Text style={styles.profileButtonText}>Meu Perfil</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginButtonText}>Entrar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerButtonText}>Cadastrar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color={COLORS.gray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar serviço por nome..."
          value={searchQuery}
          onChangeText={setSearchQuery} 
          placeholderTextColor={COLORS.gray}
        />
         {searchQuery.length > 0 && (
             <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchIcon}>
                 <Feather name="x-circle" size={18} color={COLORS.gray} />
             </TouchableOpacity>
         )}
      </View>

      <View style={styles.categoryContainer}>
         <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScrollView}>
           {categories.map(renderCategoryButton)}
         </ScrollView>
      </View>

      {isLoading && services.length === 0 ? ( 
        <ActivityIndicator style={{ flex: 1, marginTop: 50 }} size="large" color={COLORS.primary} />
      ) : (
        <FlatList
          data={services}
          renderItem={renderService}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingBottom: SIZES.padding * 2 }}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum serviço encontrado para "{selectedCategory}"{debouncedSearchQuery ? ` com o termo "${debouncedSearchQuery}"` : ''}.</Text>}
          onRefresh={() => fetchServices(selectedCategory, debouncedSearchQuery)} 
          refreshing={isLoading} 
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screenContainer: { 
    flex: 1, 
    backgroundColor: COLORS.lightGray 
  },
  header: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: SIZES.padding, 
    paddingVertical: SIZES.base,
    backgroundColor: COLORS.white, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee',
    height: 60,
  },
  headerLogo: { 
    height: '80%', 
    width: 100, 
    aspectRatio: 3/1 
  },
  headerActions: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  loginButton: { 
    paddingHorizontal: SIZES.padding * 0.75, 
    paddingVertical: SIZES.base * 0.75, 
    marginRight: SIZES.base 
  },
  loginButtonText: { 
    ...FONTS.body, 
    color: COLORS.primary, 
    fontWeight: '600', 
    fontSize: 14 
  },
  registerButton: { 
    backgroundColor: COLORS.accent, 
    paddingHorizontal: SIZES.padding * 1.2, 
    paddingVertical: SIZES.base * 0.75, 
    borderRadius: SIZES.radius * 2 
  },
  registerButtonText: { 
    ...FONTS.body, 
    color: COLORS.white, 
    fontWeight: 'bold', 
    fontSize: 14 
  },
  createButton: {
    backgroundColor: COLORS.accent, 
    paddingHorizontal: SIZES.padding * 1.2, 
    paddingVertical: SIZES.base * 0.75,
    borderRadius: SIZES.radius * 2, 
    marginRight: SIZES.padding,
  },
  createButtonText: { 
    ...FONTS.body, 
    color: COLORS.white, 
    fontWeight: 'bold', 
    fontSize: 14 
  },
  profileButton: {
    backgroundColor: COLORS.primary, 
    paddingHorizontal: SIZES.padding * 1.2, 
    paddingVertical: SIZES.base * 0.75,
    borderRadius: SIZES.radius * 2,
  },
  profileButtonText: { 
    ...FONTS.body, 
    color: COLORS.white, 
    fontWeight: 'bold', 
    fontSize: 14 
  },
  searchContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding, 
    marginHorizontal: SIZES.padding,
    marginVertical: SIZES.padding * 0.75, 
    borderRadius: SIZES.radius, 
    borderWidth: 1, 
    borderColor: '#eee', 
    height: 45,
  },
  searchIcon: { 
    marginRight: SIZES.base 
  },
  searchInput: {
    flex: 1, 
    ...FONTS.body, 
    fontSize: 14, 
    color: COLORS.text, height: '100%' 
  },
  clearSearchIcon:{
      paddingLeft: SIZES.base, 
  },
  categoryContainer: {
    paddingVertical: 12, 
    backgroundColor: COLORS.white, 
    borderBottomWidth: 1,
    borderBottomColor: '#eee', 
    marginBottom: 10, 
  },
  categoryScrollView: { 
    paddingHorizontal: SIZES.padding 
  },
  categoryButton: {
    backgroundColor: COLORS.lightGray, 
    paddingHorizontal: 20, 
    paddingVertical: 10,
    borderRadius: 20, 
    marginRight: 10,
  },
  selectedCategoryButton: { 
    backgroundColor: COLORS.primary 
  },
  categoryButtonText: { 
    color: COLORS.text, 
    fontSize: 14, 
    fontWeight: '500'
  },
  selectedCategoryButtonText: { 
    color: COLORS.white, 
    fontWeight: 'bold'
  },
  emptyText: {
    textAlign: 'center', 
    marginTop: 50, 
    fontSize: 16, 
    color: COLORS.gray, 
    paddingHorizontal: 20,
  },
  
});

export default ClassifiedsScreen;