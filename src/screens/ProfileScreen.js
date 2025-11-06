import React, { useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  FlatList, 
  ActivityIndicator,
  TouchableOpacity, 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import client from '../api/client';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { Feather, MaterialIcons } from '@expo/vector-icons'; 
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileScreen = ({ navigation }) => {
  const { logout } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [myServices, setMyServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(() => {
    async function loadData() {
      try {
        const [profileResponse, servicesResponse] = await Promise.all([
          client.get('/users/private/profile'),
          client.get('/services/private/mine')
        ]);
        setProfileData(profileResponse.data);
        setMyServices(servicesResponse.data);
      } catch (error) {
        console.error("Erro ao buscar dados do perfil:", error.response?.data || error.message);
        Alert.alert("Erro", "Não foi possível carregar seus dados.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData(); 
  }, []); 

  useFocusEffect(fetchData); 
  
  const handleDeleteAccount = () => {
    Alert.alert(
      "Confirmar Exclusão",
      "Você tem certeza que deseja deletar sua conta? Todos os seus anúncios também serão removidos. Esta ação é irreversível.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Deletar",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoading(true); 
              await client.delete('/users/private/profile');
              Alert.alert("Sucesso", "Sua conta foi deletada.");
              logout(); 
            } catch (error) {
              Alert.alert("Erro", "Não foi possível deletar sua conta.");
              setIsLoading(false); 
            }
          }
        }
      ]
    );
  };

  const renderListHeader = () => (
    <>
      {profileData && (
        <View style={styles.profileCard}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {profileData.name ? profileData.name.substring(0, 1).toUpperCase() : '?'}
            </Text>
          </View>
          <Text style={styles.name}>{profileData.name}</Text>
          <View style={styles.infoRow}>
            <MaterialIcons name="email" size={18} color={COLORS.primary} style={styles.icon}/>
            <Text style={styles.detailHighlight}>{profileData.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="phone" size={18} color={COLORS.primary} style={styles.icon}/>
            <Text style={styles.detailHighlight}>{profileData.phone}</Text>
          </View>
        </View>
      )}

      <View style={styles.profileActionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={() => {  navigation.navigate('EditProfile')  }}>
           <Feather name="edit-2" size={18} color={COLORS.primary} />
           <Text style={styles.actionButtonText}>Editar Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => {  navigation.navigate('ChangePassword')  }}>
           <MaterialIcons name="lock-outline" size={18} color={COLORS.primary} />
           <Text style={styles.actionButtonText}>Alterar Senha</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Meus Anúncios</Text>
    </>
  );

  const renderServiceItem = ({ item }) => (
    <TouchableOpacity style={styles.serviceCard} onPress={() => {  navigation.navigate('EditService', { serviceId: item._id })  }}>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.servicePriceHighlight}>R$ {item.price.toFixed(2)}</Text>
      </View>
      <Feather name="chevron-right" size={20} color={COLORS.gray} />
    </TouchableOpacity>
  );

  const renderListFooter = () => (
    <View style={styles.footerActions}>
      {myServices.length < 3 && <View style={{height: 50}} />}
      <TouchableOpacity style={[styles.footerButton, styles.logoutButton]} onPress={logout}>
         <MaterialIcons name="logout" size={18} color={COLORS.gray} />
         <Text style={[styles.footerButtonText, styles.logoutButtonText]}>Sair</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.footerButton, styles.deleteButton]} onPress={handleDeleteAccount}>
         <MaterialIcons name="delete-forever" size={18} color={'red'} />
         <Text style={[styles.footerButtonText, styles.deleteButtonText]}>Deletar Conta</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Você ainda não cadastrou nenhum serviço.</Text>
    </View>
  );

  if (isLoading && !profileData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screenContainer}>
      <FlatList
        data={myServices}
        keyExtractor={item => item._id}
        renderItem={renderServiceItem}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={renderListFooter}
        ListEmptyComponent={renderEmptyList}
        onRefresh={fetchData} 
        refreshing={isLoading} 
        contentContainerStyle={styles.listContentContainer} 
        showsVerticalScrollIndicator={false} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
  },
  listContentContainer: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 30, 
  },
 
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 1.5,
    marginTop: SIZES.padding,
    marginBottom: SIZES.padding * 1.5,
    alignItems: 'center', 
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  avatarText: {
    fontSize: 36,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  name: {
    ...FONTS.h2,
    color: COLORS.text,
    marginBottom: SIZES.padding, 
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base,
    width: '100%', 
    paddingLeft: '10%', 
  },
  icon: {
    marginRight:SIZES.padding * 0.75, 
  },
  detail: {
    ...FONTS.body,
    color: COLORS.gray,
    fontSize: 14,
  },
  detailHighlight: { 
    ...FONTS.body,
    color: COLORS.text, 
    fontSize: 16, 
    fontWeight: '500', 
  },
  profileActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly', 
    marginBottom: SIZES.padding * 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: SIZES.base * 1.5, 
    paddingHorizontal: SIZES.padding * 1.5,
    borderRadius: SIZES.radius * 2, 
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionButtonText: {
    ...FONTS.body,
    color: COLORS.primary,
    marginLeft: SIZES.base,
    fontWeight: '600', 
  },
  // Seção "Meus Anúncios"
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    marginBottom: SIZES.padding, 
    marginLeft: SIZES.base / 2,
  },
  serviceCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  serviceInfo: {
    flex: 1,
    marginRight: SIZES.base,
  },
  serviceTitle: {
    ...FONTS.body,
    fontWeight: '600', 
    color: COLORS.text,
    fontSize: 15,
    marginBottom: 4,
  },
  servicePrice: {
    ...FONTS.body,
    color: COLORS.gray,
    fontSize: 13,
    marginTop: 2,
  },
  servicePriceHighlight: { 
     ...FONTS.h3, 
     color: COLORS.green, 
     fontWeight: 'bold', 
     fontSize: 16, 
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: SIZES.padding,
  },
  emptyText: {
    ...FONTS.body,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: SIZES.padding, 
  },
  footerActions: {
      marginTop: SIZES.padding * 2.5, 
      paddingTop: SIZES.padding * 1.5,
      borderTopWidth: 1,
      borderTopColor: '#eee',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.padding,
    marginBottom: SIZES.padding, 
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    borderWidth: 1, 
  },
  footerButtonText: {
     marginLeft: SIZES.base,
     fontSize: 16,
     fontWeight: '500', 
  },
  logoutButton: {
      borderColor: COLORS.gray, 
  },
  logoutButtonText:{
      color: COLORS.gray,
  },
  deleteButton: {
      borderColor: 'red', 
  },
  deleteButtonText:{
      color: 'red',
  },
});

export default ProfileScreen;