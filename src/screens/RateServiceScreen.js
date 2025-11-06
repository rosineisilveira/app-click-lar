import React from 'react'; 
import {
  View, Text, StyleSheet, Alert, ActivityIndicator,
 TouchableOpacity, 
  
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../api/client';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { FontAwesome } from '@expo/vector-icons';

const RateServiceScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const serviceId = route.params?.serviceId;
  const serviceTitle = route.params?.serviceTitle;

  const [rating, setRating] = React.useState(0); 
  const [isSubmitting, setIsSubmitting] = React.useState(false); 
  const [error, setError] = React.useState(null); 

  React.useEffect(() => {
    if (!serviceId) {
      setError("Erro: ID do serviço não foi recebido.");
      Alert.alert("Erro", "Não foi possível identificar o serviço a ser avaliado.");
    }
     //console.log("RateServiceScreen recebeu serviceId:", serviceId);
  }, [serviceId]);

  const renderStarInput = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => setRating(i)} style={styles.starButton}>
          <FontAwesome
            name={i <= rating ? "star" : "star-o"} 
            size={36} 
            color={COLORS.accent} 
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const handleSubmitRating = async () => {
    if (!serviceId) {
       Alert.alert("Erro", "ID do serviço inválido. Não é possível enviar a avaliação.");
       return;
    }
    if (rating === 0) {
       Alert.alert("Avaliação Inválida", "Selecione de 1 a 5 estrelas.");
       return;
    }

    setIsSubmitting(true);
    setError(null); 
    try {
      const url = `/services/private/${serviceId}/rate`;
      //console.log("Enviando avaliação para:", url, "com rating:", rating); // Log

      await client.post(url, { rating });

      Alert.alert(
        "Obrigado!",
        `Avaliação registrada.`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );

    } catch (err) { // Mantém :any se estiver em .js, remova se for .tsx e usar unknown
      let errorMessage = "Não foi possível registrar a avaliação.";
       if (err.response) {
            errorMessage = err.response.data?.error || errorMessage;
            console.error("Erro API:", err.response.status, err.response.data);
       } else if (err.request) {
            console.error("Sem resposta:", err.request);
            errorMessage = "Sem conexão.";
       } else { console.error("Erro Req:", err.message); }
       Alert.alert("Erro", errorMessage);
       setError(errorMessage); 
       setIsSubmitting(false); 
    }
  };

  const isButtonActive = rating > 0 && !!serviceId; 

  if (error && !isSubmitting && !serviceId) { 
      return (
           <SafeAreaView style={styles.center}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                 <Text style={styles.backButtonText}>Voltar</Text>
              </TouchableOpacity>
           </SafeAreaView>
      );
  }

  return (
    <SafeAreaView style={styles.screenContainer}>
      <View style={styles.content}>
        <Text style={styles.title}>Avaliar Serviço</Text>
        <Text style={styles.serviceName}>{serviceTitle || 'Serviço'}</Text>
        <Text style={styles.instruction}>Toque nas estrelas para avaliar:</Text>
        <View style={styles.starsInputContainer}>
          {renderStarInput()}
        </View>

        {error && !serviceId && <Text style={styles.apiErrorText}>{error}</Text>}

        {isSubmitting ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.spinner} />
        ) : (
          <TouchableOpacity
            style={[
              styles.submitButton,
              !isButtonActive && styles.submitButtonInactive 
            ]}
            onPress={handleSubmitRating}
            disabled={!isButtonActive || isSubmitting} 
          >
            <Text style={[
                styles.submitButtonText,
                !isButtonActive && styles.submitButtonTextInactive 
            ]}>
              Enviar Avaliação
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    screenContainer: { 
      flex: 1,
      backgroundColor: COLORS.lightGray,
      justifyContent: 'center',
      padding: SIZES.padding * 1.5 
    },
    center: { 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: SIZES.padding 
    },
    content: {
      backgroundColor: COLORS.white, 
      borderRadius: SIZES.radius, 
      padding: SIZES.padding * 1.5, 
      alignItems: 'center', 
      shadowColor: COLORS.black, 
      shadowOffset: { width: 0, 
      height: 2 }, 
      shadowOpacity: 0.1, 
      shadowRadius: 5, 
      elevation: 3 
    },
    title: { 
      ...FONTS.h2, 
      color: COLORS.text, 
      marginBottom: SIZES.base 
    },
    serviceName: { 
      ...FONTS.body, 
      color: COLORS.gray, 
      fontSize: 16, 
      marginBottom: SIZES.padding * 1.5, 
      textAlign: 'center'
    },
    instruction: {
       ...FONTS.body, 
       color: COLORS.text, 
       marginBottom: SIZES.padding 
    },
    starsInputContainer: { 
      flexDirection: 'row', 
      marginBottom: SIZES.padding * 2 
    },
    starButton: {
       padding: SIZES.base 
    },
    spinner: { 
      marginVertical: 20 
    },
    errorText: {
      color: 'red', 
      textAlign: 'center', 
      marginBottom: SIZES.padding, 
      fontSize: 16
    },
    apiErrorText: { 
      color: 'red', 
      textAlign: 'center', 
      marginBottom: SIZES.padding, 
      fontSize: 14 
    },
    submitButton: {
      backgroundColor: COLORS.primary, 
      paddingVertical: 15,
      borderRadius: SIZES.radius,
      alignItems: 'center',
      width: '100%', 
      marginTop: SIZES.padding, 
    },
    submitButtonInactive: {
      backgroundColor: COLORS.gray, 
    },
    submitButtonText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: 'bold',
    },
     submitButtonTextInactive:{
         opacity: 0.7 
    },
    backButton: {
         marginTop: SIZES.padding,
         backgroundColor: COLORS.primary,
         paddingVertical: 10,
         paddingHorizontal: 20,
         borderRadius: SIZES.radius,
    },
     backButtonText:{
         color: COLORS.white,
         fontSize: 16,
    }
});

export default RateServiceScreen;