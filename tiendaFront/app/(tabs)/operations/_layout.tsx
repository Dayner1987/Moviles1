// app/(tabs)/operations/_layout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function OperationsTabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#007AFF", // Azul tipo iOS
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 0.5,
          borderTopColor: "#ccc",
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "EmployeeHome") iconName = "person";
          else if (route.name === "Orders") iconName = "list-circle";
          else if (route.name === "OrderStatus") iconName = "time";
          else if (route.name === "Search") iconName = "search";
          else if (route.name === "UserConE") iconName = "person";
          else iconName = "ellipse";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen
        name="EmployeeHome"
        options={{ title: "Inicio" }}
      />
     
      <Tabs.Screen
        name="Orders"
        options={{ title: "Pedidos" }}
      />
      <Tabs.Screen
        name="OrderStatus"
        options={{ title: "Estado" }}
      />
      <Tabs.Screen
        name="Search"
        options={{ title: "Buscar" }}
      />
       <Tabs.Screen
        name="UserConE"
        options={{ title: "Usuario" }}
      />
    </Tabs>
  );
}
