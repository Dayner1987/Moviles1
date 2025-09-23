// @ts-ignore
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import React from 'react';
import AdminHome from './app/(tabs)/AdminHome';
import ClientHome from './app/(tabs)/ClientHome';
import EmployeeHome from './app/(tabs)/EmployeeHome';
import Home from './app/(tabs)/index';
import Login from './app/(tabs)/login';
import Register from './app/(tabs)/register';
import { TabsStackParamList } from './app/(tabs)/types';


// importa tus nuevas pantallas (todas con export default)
import AddProducts from './app/(tabs)/operations/AddProducts';
import Orders from './app/(tabs)/operations/Orders';
import Search from './app/(tabs)/operations/Search';
import Search2 from './app/(tabs)/operations/Search2';
import OrderStatus from './app/(tabs)/operations/OrderStatus';

import NewProducts from './app/(tabs)/opAdmin/NewProducts';
import NewUsers from './app/(tabs)/opAdmin/NewUsers';
import EarNings from './app/(tabs)/opAdmin/EarNings';


const Stack = createNativeStackNavigator<TabsStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: true }}
    >
      {/* pantallas principales */}
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="ClientHome" component={ClientHome} />
      <Stack.Screen name="EmployeeHome" component={EmployeeHome} />
      <Stack.Screen name="AdminHome" component={AdminHome} />

      {/* operaciones */}
      <Stack.Screen name="AddProducts" component={AddProducts} />
      <Stack.Screen name="Orders" component={Orders} />
    <Stack.Screen name="OrderStatus" component={OrderStatus} />
      <Stack.Screen name="Search" component={Search} />
      <Stack.Screen name="Search2" component={Search2} />

      <Stack.Screen name="NewUsers" component={NewUsers} />
      <Stack.Screen name="NewProducts" component={NewProducts} />
      <Stack.Screen name="EarNings" component={EarNings} />
      
    
    </Stack.Navigator>
  );
}
