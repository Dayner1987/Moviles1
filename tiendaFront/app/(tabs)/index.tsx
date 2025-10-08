// app/index.tsx
import { Redirect } from "expo-router";

export default function Index() {
  // Redirige a las tabs del cliente al iniciar la app
  return <Redirect href="/(tabs)/others/Home" />;
}
