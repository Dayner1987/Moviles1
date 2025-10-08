// hooks/UseStatus.ts
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {jwtDecode} from "jwt-decode";
import { JwtPayload } from "../app/data/jwtPayload";

let globalUser: JwtPayload | null = null;
let listeners: ((user: JwtPayload | null) => void)[] = [];

export function useStatus() {
  const [user, setUserState] = useState<JwtPayload | null>(globalUser);
  const [loading, setLoading] = useState(true);

  const setUser = (newUser: JwtPayload | null) => {
    globalUser = newUser;
    setUserState(newUser);
    listeners.forEach((l) => l(newUser));
  };

  useEffect(() => {
    const listener = (u: JwtPayload | null) => setUserState(u);
    listeners.push(listener);

    (async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        const decoded = jwtDecode<JwtPayload>(token);
        setUser(decoded);
      }
      setLoading(false);
    })();

    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  return { user, setUser, loading };
}
