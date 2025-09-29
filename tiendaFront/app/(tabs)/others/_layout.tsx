// app/(tabs)/(client)/_layout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ClientTabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#6200ee",
        tabBarInactiveTintColor: "gray",
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "Home") iconName = "home";
          else if (route.name === "OrdersClient") iconName = "list";
          else if (route.name === "PayClient") iconName = "card";
          else if (route.name === "UserCon") iconName = "person";
          else iconName = "ellipse";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="Home" options={{ title: "Home" }} />
    
      <Tabs.Screen name="PayClient" options={{ title: "Pago" }} />
      <Tabs.Screen name="OrdersClient" options={{ title: "Órdenes" }} />
      <Tabs.Screen name="UserCon" options={{ title: "Perfil" }} />
    </Tabs>
  );
}
