import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { BASE_URL } from "../services/api";

function MenuCard({ item, index, styles, colors, addToCart }: any) {
  const animation = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(animation, {
      toValue: 1,
      delay: index * 120,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: animation,
          transform: [
            {
              translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [40, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={{ flexDirection: "row", flex: 1, alignItems: "center" }}
        onPress={() => router.push(`/product/${item._id}`)}
      >
        <Image
          source={
            item.imageUrl
              ? { uri: `${BASE_URL}${item.imageUrl}` }
              : require("../../assets/images/avatar.jpg")
          }
          style={styles.image}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.price}>${item.price.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.add}
        onPress={() =>
          addToCart({
            id: item._id,
            name: item.name,
            price: item.price,
            image: item.imageUrl
              ? { uri: `${BASE_URL}${item.imageUrl}` }
              : null,
            qty: 1,
          })
        }
      >
        <Ionicons name="bag-add" size={17} color={colors.BG} />
        <Text style={styles.addText}>Add</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function Menu() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { addToCart } = useCart();
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${BASE_URL}/api/admin/products`)
      .then((r) => r.json())
      .then(setProducts)
      .catch((e) => console.log("MENU LOAD ERROR", e));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={colors.CREAM} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Coffee Menu</Text>
          <Text style={styles.subtitle}>Choose your favorite drink</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {products.map((item, index) => (
          <MenuCard
            key={item._id}
            item={item}
            index={index}
            styles={styles}
            colors={colors}
            addToCart={addToCart}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.BG },
    header: {
      paddingTop: 60,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 15,
      marginBottom: 25,
    },
    back: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.CARD,
      alignItems: "center",
      justifyContent: "center",
    },
    title: { fontSize: 26, fontWeight: "900", color: colors.CREAM },
    subtitle: { fontSize: 13, color: colors.LIGHT, marginTop: 4 },
    card: {
      backgroundColor: colors.CARD,
      marginHorizontal: 20,
      marginBottom: 16,
      borderRadius: 30,
      padding: 15,
      flexDirection: "row",
      alignItems: "center",
    },
    image: { width: 95, height: 95, borderRadius: 25 },
    info: { flex: 1, marginLeft: 15 },
    name: { fontSize: 18, fontWeight: "900", color: colors.CREAM },
    description: { fontSize: 12, color: colors.LIGHT, marginTop: 5 },
    price: {
      color: colors.ORANGE,
      fontSize: 17,
      fontWeight: "900",
      marginTop: 8,
    },
    add: {
      marginTop: 10,
      backgroundColor: colors.ORANGE,
      height: 36,
      width: 85,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 5,
    },
    addText: { fontWeight: "900", color: colors.BG },
  });
