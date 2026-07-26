import { Slot } from "expo-router";

import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { FavoritesProvider } from "../context/FavoritesContext";
import { LanguageProvider } from "../context/LanguageContext";
import { TableProvider } from "../context/TableContext";
import { ThemeProvider } from "../context/ThemeContext";
export default function RootLayout() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <TableProvider>
          <AuthProvider>
            <CartProvider>
              <FavoritesProvider>
                <Slot />
              </FavoritesProvider>
            </CartProvider>
          </AuthProvider>
        </TableProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
