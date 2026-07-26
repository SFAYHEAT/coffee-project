import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import FloatingBeans from "../../components/FloatingBeans";
import { useCart } from "../../context/CartContext";
import { useFavorites } from "../../context/FavoritesContext";
import { useTheme } from "../../context/ThemeContext";

function FavoriteCard({ item, index, remove, addCart, colors }: any) {
  const styles = makeStyles(colors);

  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      delay: index * 150,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [40, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Image source={item.image} style={styles.image} />

      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>

        <Text style={styles.price}>${item.price.toFixed(2)}</Text>

        <TouchableOpacity style={styles.cartBtn} onPress={() => addCart(item)}>
          <Ionicons name="bag-add" size={16} color={colors.BG} />

          <Text style={styles.cartText}>Add</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.delete} onPress={() => remove(item.id)}>
        <Ionicons name="heart" size={22} color="#FF5A5F" />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function Favorites() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const { favorites, removeFavorite } = useFavorites();
  const { addToCart } = useCart();

  const emptyAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (favorites.length === 0) {
      Animated.loop(
        Animated.sequence([
          Animated.spring(emptyAnim, {
            toValue: 1.15,
            useNativeDriver: true,
          }),
          Animated.spring(emptyAnim, {
            toValue: 1,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [favorites.length]);

  if (favorites.length === 0) {
    return (
      <View style={styles.empty}>
        <FloatingBeans color={colors.ORANGE} />

        <Animated.View
          style={[
            styles.emptyIcon,
            {
              transform: [
                {
                  scale: emptyAnim,
                },
              ],
            },
          ]}
        >
          <Ionicons name="heart-outline" size={55} color={colors.ORANGE} />
        </Animated.View>

        <Text style={styles.emptyTitle}>No favorites yet</Text>

        <Text style={styles.emptyText}>
          Save your favorite coffee drinks here
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FloatingBeans color={colors.ORANGE} />

      <Text style={styles.header}>Favorites ❤️</Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >
        {favorites.map((item: any, index: number) => (
          <FavoriteCard
            key={item.id}
            item={item}
            index={index}
            remove={removeFavorite}
            addCart={addToCart}
            colors={colors}
          />
        ))}
      </ScrollView>
    </View>
  );
}
const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.BG,
    },

    header: {
      color: colors.CREAM,
      fontSize: 28,
      fontWeight: "900",
      paddingTop: 65,
      paddingHorizontal: 22,
      paddingBottom: 25,
    },

    card: {
      marginHorizontal: 20,
      marginBottom: 16,
      backgroundColor: colors.CARD,
      borderRadius: 30,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",

      shadowColor: "#000",
      shadowOpacity: 0.35,
      shadowRadius: 18,
      shadowOffset: {
        width: 0,
        height: 10,
      },

      elevation: 10,
    },

    image: {
      width: 90,
      height: 90,
      borderRadius: 25,
    },

    info: {
      flex: 1,
      marginLeft: 16,
    },

    name: {
      fontSize: 17,
      fontWeight: "900",
      color: colors.CREAM,
    },

    price: {
      fontSize: 16,
      fontWeight: "900",
      color: colors.ORANGE,
      marginTop: 6,
    },

    cartBtn: {
      marginTop: 14,
      height: 38,
      width: 95,
      borderRadius: 18,
      backgroundColor: colors.ORANGE,

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",

      gap: 6,
    },

    cartText: {
      color: colors.BG,
      fontWeight: "900",
    },

    delete: {
      width: 45,
      height: 45,
      borderRadius: 22,

      backgroundColor: "#33211C",

      alignItems: "center",
      justifyContent: "center",
    },

    empty: {
      flex: 1,

      backgroundColor: colors.BG,

      justifyContent: "center",
      alignItems: "center",

      paddingHorizontal: 40,
    },

    emptyIcon: {
      width: 120,
      height: 120,
      borderRadius: 60,

      backgroundColor: colors.CARD,

      alignItems: "center",
      justifyContent: "center",

      shadowColor: "#000",
      shadowOpacity: 0.35,
      shadowRadius: 20,

      elevation: 12,
    },

    emptyTitle: {
      color: colors.CREAM,

      fontSize: 23,

      fontWeight: "900",

      marginTop: 25,
    },

    emptyText: {
      color: colors.LIGHT,

      fontSize: 14,

      marginTop: 10,

      textAlign: "center",
    },
  });
