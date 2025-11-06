import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { AuthContext } from '../context/AuthContext';

import ClassifiedsScreen from '../screens/ClassifiedsScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ServiceDetailScreen from '../screens/ServiceDetailScreen';
import CreateServiceScreen from '../screens/CreateServiceScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import EditServiceScreen from '../screens/EditServiceScreen';
import RateServiceScreen from '../screens/RateServiceScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { userToken, isLoading } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {userToken == null ? (
          // Telas para usuário não logado
          <>
            <Stack.Screen name="Classifieds" component={ClassifiedsScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Entrar' }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Cadastre-se' }} />
            <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} options={{ title: 'Detalhes do Anúncio' }} />
          </>
        ) : (
          // Telas para usuário logado
          <>
            <Stack.Screen name="Classifieds" component={ClassifiedsScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Meu Perfil' }} />
            <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} options={{ title: 'Detalhes do Anúncio' }} />
            <Stack.Screen name="CreateService" component={CreateServiceScreen} options={{ title: 'Novo Anúncio' }} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Editar Perfil' }} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Alterar Senha' }} />
            <Stack.Screen name="EditService" component={EditServiceScreen} options={{ title: 'Editar Anúncio' }} />
            <Stack.Screen name="RateService" component={RateServiceScreen} options={{ title: 'Avaliar Serviço' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;