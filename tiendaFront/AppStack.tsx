// @ts-ignore
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

// pantallas principales
import Home from './app/(tabs)/others/Home';
import Login from './app/(tabs)/login';
import Register from './app/(tabs)/register';
import AdminHome from './app/(tabs)/opAdmin/AdminHome';
import EmployeeHome from './app/(tabs)/operations/EmployeeHome';
import { TabsStackParamList } from './app/(tabs)/types';

// operaciones
import UserConE from './app/(tabs)/operations/UserConE';
import Orders from './app/(tabs)/operations/Orders';
import Search from './app/(tabs)/operations/Search';
import OrderStatus from './app/(tabs)/operations/OrderStatus';

// administrador
import NewProducts from './app/(tabs)/opAdmin/NewProducts';
import NewUsers from './app/(tabs)/opAdmin/NewUsers';
import EarNings from './app/(tabs)/opAdmin/EarNings';
import Company from './app/(tabs)/opAdmin/Company';
import CompanyInfo from './app/(tabs)/companyInfo';

const Stack = createNativeStackNavigator<TabsStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: true }}
    >
      {/* pantallas principales */}
      <Stack.Screen
        name="Home"
        component={Home}
        options={{ title: "Inicio" }}
      />
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ title: "Iniciar Sesión" }}
      />
      <Stack.Screen
        name="Register"
        component={Register}
        options={{ title: "Registro" }}
      />
      <Stack.Screen
        name="EmployeeHome"
        component={EmployeeHome}
        options={{ title: "Panel Empleado" }}
      />
      <Stack.Screen
        name="AdminHome"
        component={AdminHome}
        options={{ title: "Panel Administrador" }}
      />

      {/* operaciones */}
      <Stack.Screen
        name="UserConE"
        component={UserConE}
        options={{ title: "Agregar Productos" }}
      />
      <Stack.Screen
        name="Orders"
        component={Orders}
        options={{ title: "Pedidos" }}
      />
      <Stack.Screen
        name="OrderStatus"
        component={OrderStatus}
        options={{ title: "Estado del Pedido" }}
      />
      <Stack.Screen
        name="Search"
        component={Search}
        options={{ title: "Buscar Productos" }}
      />
      

      {/* administrador */}
      <Stack.Screen
        name="NewUsers"
        component={NewUsers}
        options={{ title: "Usuarios" }}
      />
      <Stack.Screen
        name="NewProducts"
        component={NewProducts}
        options={{ title: "Productos Nuevos" }}
      />
      <Stack.Screen
        name="EarNings"
        component={EarNings}
        options={{ title: "Ganancias" }}
      />

      {/* compañía */}
      <Stack.Screen
        name="Company"
        component={Company}
        options={{ title: "Editar Información de la Empresa" }}
      />
      <Stack.Screen
        name="CompanyInfo"
        component={CompanyInfo}
        options={{ title: "Información del Local" }}
      />
    </Stack.Navigator>
  );
}
