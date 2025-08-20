// AppStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './app/(tabs)/index';
import Login from './app/(tabs)/login';
import Register from './app/(tabs)/register';
import { TabsStackParamList } from './app/(tabs)/types';

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
    </Stack.Navigator>
  );
}
