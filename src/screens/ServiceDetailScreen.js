import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Linking,
  Alert,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Image,
  Button 
} from 'react-native';
import client from '../api/client';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

const logo = require('../../assets/splash.png'); 

const renderStars = (rating) => {
  const stars = [];
  const roundedRating = Math.round((rating || 0) * 2) / 2; 
  for (let i = 1; i <= 5; i++) {
    let name = "star-o"; 
    if (roundedRating >= i) name = "star"; 
    else if (roundedRating >= i - 0.5) name = "star-half-o";
    stars.push(<FontAwesome key={i} name={name} size={18} color={COLORS.accent} style={{ marginRight: 2 }}/>);
  }
  return stars;
};

const ServiceDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const initialServiceId = route.params?.serviceId;
  const [service, setService] = useState(null); 
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null);
  const { userToken } = useContext(AuthContext);

  const fetchServiceDetails = useCallback(async () => {
    
    if (!initialServiceId) {
      setError("ID do serviço não fornecido.");
      setIsLoading(false); 
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const url = `/services/public/${initialServiceId}`;
      console.log(`Buscando detalhes em: ${client.defaults.baseURL}${url}`);
      const response = await client.get(url, { timeout: 15000 });

      console.log("API Respondeu com:", JSON.stringify(response.data, null, 2));

      if (response.data && typeof response.data === 'object') {
         setService(response.data);
      } else {
          console.error("Resposta inválida da API:", response.data);
          setError("Formato de resposta inesperado do servidor.");
          setService(null); 
      }

    } catch (err) {
        let errorMessage = "Ocorreu um erro inesperado.";
        
        if (err.response) {
          console.error("Erro de resposta da API:", err.response.status, err.response.data);
          errorMessage = `Erro ${err.response.status}: Serviço não encontrado ou erro no servidor.`;
        } else if (err.request) {
          console.error("Nenhuma resposta recebida:", err.request);
          errorMessage = "Não foi possível conectar ao servidor.";
        } else {
          console.error("Erro ao configurar requisição:", err.message);
        }
        setError(errorMessage);
        console.error("Erro completo fetchDetails:", JSON.stringify(err, null, 2));
        setService(null); 
    } finally {
      setIsLoading(false);
      console.log("Busca de detalhes finalizada.");
    }
  }, [initialServiceId]); 

  useFocusEffect(
      useCallback(() => {
          async function performFetch() {
              await fetchServiceDetails();
          }
          
          performFetch();
                 
      }, [fetchServiceDetails]) 
  );

  const openWhatsApp = () => {
    const phone = service?.providerId?.phone;
    if (!phone) {
      Alert.alert("Contato Indisponível", "Este prestador não informou um número de telefone.");
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/55${cleanPhone}`;
    Linking.openURL(url).catch(() => Alert.alert("Erro", "Não foi possível abrir o WhatsApp."));
  };

  const handleRatePress = () => {
    if (!service || !service._id) {
        Alert.alert("Erro", "Aguarde o carregamento completo do serviço.");
        return;
    }
    if (userToken) {
      console.log("Navegando para RateService com ID:", service._id);
      navigation.navigate('RateService', {
        serviceId: service._id,
        serviceTitle: service.title
      });
    } else {
      Alert.alert( "Avaliação Requer Login", "Você precisa estar logado para avaliar.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Fazer Login", onPress: () => navigation.navigate('Login') },
          { text: "Cadastrar", onPress: () => navigation.navigate('Register') }
        ]
      );
    }
  };

  if (isLoading && !service && !error) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (error && !service) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Tentar Novamente" onPress={fetchServiceDetails} color={COLORS.primary}/>
      </SafeAreaView>
    );
  }

  if (!service || typeof service !== 'object' || !service._id) {
     console.log("Renderizando 'Serviço não encontrado' porque 'service' é:", service);
    return (
      <SafeAreaView style={styles.center}>
        <Text>Serviço não encontrado.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screenContainer}>
        <ScrollView>
            {isLoading && <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 10}}/>}
            <View style={styles.card}>
                <View style={styles.header}>
                    <Image source={logo} style={styles.logo} resizeMode="contain" />
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.title}>{service.title}</Text>
                        <Text style={styles.category}>{service.category}</Text>
                        <View style={styles.ratingDisplayContainer}>
                            {renderStars(service.averageRating)}
                            <Text style={styles.ratingCountText}>({service.ratingsCount || 0} avaliações)</Text>
                        </View>
                    </View>
                </View>
    
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Prestador</Text>
                    <Text style={styles.providerName}>{service.providerId?.name || 'Não informado'}</Text>
                </View>
                
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Descrição</Text>
                    <Text style={styles.description}>{service.description}</Text>
                </View>
                
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preço</Text>
                    <Text style={styles.price}>R$ {service.price ? service.price.toFixed(2) : 'N/A'}</Text>
                </View>
                
                <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity style={styles.rateButton} onPress={handleRatePress}>
                       <FontAwesome name="star-o" size={18} color={COLORS.primary} />
                       <Text style={styles.rateButtonText}>Avaliar este Serviço</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.whatsappButton} onPress={openWhatsApp}>
                        <FontAwesome name="whatsapp" size={24} color={COLORS.white} />
                        <Text style={styles.whatsappButtonText}>Contatar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screenContainer: { 
    flex: 1, 
    backgroundColor: COLORS.lightGray 
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: SIZES.padding 
  },
  errorText: { 
    color: 'red', 
    textAlign: 'center', 
    marginBottom: SIZES.padding 
  },
  card: {
    backgroundColor: COLORS.white, 
    margin: SIZES.padding, 
    borderRadius: SIZES.radius,
    padding: SIZES.padding, 
    shadowColor: COLORS.black, 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, 
    shadowRadius: 4, elevation: 5,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginBottom: SIZES.padding 
  },
  logo: { 
    width: 60, 
    height: 60, 
    marginRight: SIZES.padding 
  },
  headerTextContainer:{ 
    flex: 1 
  },
  title: { 
    ...FONTS.h2, 
    color: COLORS.text, 
    marginBottom: 4 
  },
  category: { 
    ...FONTS.body, 
    color: COLORS.gray, 
    fontSize: 14, marginBottom: 8 
  },
  ratingDisplayContainer: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  ratingCountText: { 
    ...FONTS.body, fontSize: 12, 
    color: COLORS.gray, 
    marginLeft: SIZES.base 
  },
  section: { 
    marginBottom: SIZES.padding * 1.5 
  },
  sectionTitle: {
    ...FONTS.body, 
    color: COLORS.gray, 
    marginBottom: SIZES.base / 2,
    fontSize: 12, 
    textTransform: 'uppercase', 
    fontWeight: '600'
  },
  providerName: { 
    ...FONTS.body, 
    fontSize: 16, color: COLORS.text 
  },
  description: { 
    ...FONTS.body, fontSize: 16, 
    lineHeight: 24, 
    color: COLORS.text 
  },
  price: { 
    ...FONTS.h3, 
    color: COLORS.green, 
    fontWeight: 'bold' 
  },
  actionButtonsContainer:{
      marginTop: SIZES.padding * 1.5, 
      paddingTop: SIZES.padding,
      borderTopWidth: 1, 
      borderTopColor: COLORS.lightGray,
  },
  rateButton: {
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'center',
      paddingVertical: 10, 
      marginBottom: SIZES.padding,
      borderRadius: SIZES.radius, 
      borderWidth: 1, 
      borderColor: COLORS.primary,
  },
  rateButtonText: { 
    color: COLORS.primary, 
    marginLeft: 8, fontSize: 15, 
    fontWeight: 'bold' 
  },
  whatsappButton: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#25D366', 
    paddingVertical: 12, 
    paddingHorizontal: 20,
    borderRadius: SIZES.radius,
  },
  whatsappButtonText: { 
    color: COLORS.white, 
    marginLeft: 10, fontSize: 16, 
    fontWeight: 'bold' 
  },
});


export default ServiceDetailScreen;