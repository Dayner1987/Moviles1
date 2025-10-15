// app/(tabs)/opAdmin/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function AdminTabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#D32F2F", // Rojo administrativo
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 0.5,
          borderTopColor: "#ccc",
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "NewProducts") iconName = "home";
          else if (route.name === "NewUsers") iconName = "people";
          else if (route.name === "Company") iconName = "business";
          else if (route.name === "EarNings") iconName = "cash";
          else if (route.name === "UserConA") iconName = "person";
          else iconName = "ellipse";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      
      
      <Tabs.Screen
        name="NewProducts"
        options={{ title: "Productos" }}
      />
      <Tabs.Screen
        name="NewUsers"
        options={{ title: "Usuarios" }}
      />
      <Tabs.Screen
        name="Company"
        options={{ title: "Empresa" }}
      />
      <Tabs.Screen
        name="Earnings"
        options={{ title: "Ganancias" }}
      />
      <Tabs.Screen
        name="UserConA"
        options={{ title: "Usuario" }}
      />
    </Tabs>
  );
}
