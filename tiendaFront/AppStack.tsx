// AppStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './app/(tabs)/index';
import Login from './app/(tabs)/login';
import Register from './app/(tabs)/register';
import { TabsStackParamList } from './app/(tabs)/types';
import ClientHome from './app/(tabs)/ClientHome';
import EmployeeHome from './app/(tabs)/EmployeeHome';
import AdminHome from './app/(tabs)/AdminHome';

const Stack = createNativeStackNavigator<TabsStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: true }} // Puedes poner false si no quieres headers
    >
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />     
      <Stack.Screen name="ClientHome" component={ClientHome} />
       <Stack.Screen name="EmployeeHome" component={EmployeeHome} />
      <Stack.Screen name="AdminHome" component={AdminHome} />
    </Stack.Navigator>
  );
}
