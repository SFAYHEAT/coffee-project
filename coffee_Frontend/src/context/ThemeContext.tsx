import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

const darkColors = {
  BG: "#120B08",
  CARD: "#241713",
  CREAM: "#F7EFE8",
  ORANGE: "#D99052",
  LIGHT: "#B9A89C",
};

const lightColors = {
  BG: "#F7EFE8",
  CARD: "#FFFFFF",
  CREAM: "#1A120D",
  ORANGE: "#D99052",
  LIGHT: "#6B5B50",
};

type ThemeContextType = {
  isDark: boolean;
  colors: typeof darkColors;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("theme").then((val) => {
      if (val === "light") setIsDark(false);
    });
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    AsyncStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider
      value={{ isDark, colors: isDark ? darkColors : lightColors, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
