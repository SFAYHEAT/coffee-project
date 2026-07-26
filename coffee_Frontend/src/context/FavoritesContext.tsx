import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

const FavoritesContext = createContext<any>(null);

export function FavoritesProvider({ children }: any) {
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const saved = await AsyncStorage.getItem("favorites");

      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (error) {
      console.log("LOAD FAVORITES ERROR", error);
    }
  };

  const saveFavorites = async (data: any[]) => {
    setFavorites(data);

    await AsyncStorage.setItem(
      "favorites",

      JSON.stringify(data),
    );
  };

  const toggleFavorite = async (item: any) => {
    const normalized = {
      ...item,
      id: item.id ?? item._id,
    };

    const exists = favorites.some((f) => f.id === normalized.id);

    let updated;

    if (exists) {
      updated = favorites.filter((f) => f.id !== normalized.id);
    } else {
      updated = [...favorites, normalized];
    }

    await saveFavorites(updated);
  };

  const removeFavorite = (id: string) => {
    const updated = favorites.filter((item) => item.id !== id);

    saveFavorites(updated);
  };

  const isFavorite = (id: string) => {
    return favorites.some((item) => item.id === id);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,

        toggleFavorite,

        removeFavorite,

        isFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
