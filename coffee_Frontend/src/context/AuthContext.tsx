import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { API_URL, BASE_URL } from "../services/api";

type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isAdmin?: boolean;
  role?: "client" | "cashier" | "admin";
} | null;

type AuthContextType = {
  user: User;
  token: string | null;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;

  signup: (name: string, email: string, password: string) => Promise<void>;

  logout: () => Promise<void>;

  updateUser: (data: Partial<NonNullable<User>>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);

  const [token, setToken] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  // LOAD SAVED SESSION
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");

        const storedUser = await AsyncStorage.getItem("user");

        if (storedToken && storedUser) {
          setToken(storedToken);

          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.log("AUTH LOAD ERROR:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      console.log("LOGIN RESPONSE:", data);

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      await AsyncStorage.setItem("token", data.token);

      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      setToken(data.token);

      setUser(data.user);
    } catch (error) {
      console.log("LOGIN ERROR:", error);

      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    const res = await fetch(`${API_URL}/signup`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Signup failed");
    }

    await AsyncStorage.setItem("token", data.token);

    await AsyncStorage.setItem("user", JSON.stringify(data.user));

    setToken(data.token);

    setUser(data.user);
  };

  const updateUser = async (data: Partial<NonNullable<User>>) => {
    const currentToken = await AsyncStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/api/user/update-info`, {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",

        Authorization: `Bearer ${currentToken}`,
      },

      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message);
    }

    await AsyncStorage.setItem("user", JSON.stringify(result.user));

    setUser(result.user);
  };

  const logout = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token");

      await fetch(`${API_URL}/tables/release`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${storedToken}`,
        },
      });
    } catch (error) {
      console.log("RELEASE TABLE ERROR", error);
    }

    await AsyncStorage.multiRemove(["token", "user"]);

    setToken(null);

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,

        login,
        signup,
        logout,

        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return ctx;
}
