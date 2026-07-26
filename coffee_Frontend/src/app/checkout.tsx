import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import FloatingBeans from "../components/FloatingBeans";
import { useCart } from "../context/CartContext";
import { useTable } from "../context/TableContext";
import { useTheme } from "../context/ThemeContext";
import { BASE_URL } from "../services/api";

function CheckoutRow({ item, index, styles }: any) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      delay: index * 90,
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
              translateX: anim.interpolate({
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

        <View style={styles.row}>
          <Text style={styles.muted}>Qty: {item.qty}</Text>

          <Text style={styles.price}>
            ${(item.price * item.qty).toFixed(2)}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function Checkout() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const { cart, clearCart } = useCart();
  const { table } = useTable();

  const [loading, setLoading] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;
  const orderBtnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const total = cart.reduce(
    (sum: number, item: any) => sum + item.price * item.qty,
    0,
  );

  const pressIn = () =>
    Animated.spring(orderBtnScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  const pressOut = () =>
    Animated.spring(orderBtnScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

  const placeOrder = async () => {
    if (cart.length === 0) {
      Alert.alert("Cart empty", "Add items before checking out");
      return;
    }

    if (!table) {
      Alert.alert("No table", "Please scan your table QR code first");
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart.map((i: any) => ({
            id: i.id,
            name: i.name,
            price: i.price,
            qty: i.qty,
          })),
          total,
          tableNumber: table,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Order failed");
      }

      clearCart();

      Alert.alert("Success", "Your order has been placed!");

      router.replace("/home");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <FloatingBeans color={colors.ORANGE} />

      <Animated.View
        style={[
          styles.header,
          {
            opacity: fade,
            transform: [
              {
                translateY: fade.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.CREAM} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Review Order</Text>

        <View style={{ width: 22 }} />
      </Animated.View>

      <View style={styles.tableBox}>
        <Ionicons name="restaurant-outline" size={16} color={colors.ORANGE} />

        <Text style={styles.tableText}>Table: {table ?? "Not scanned"}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {cart.map((item: any, index: number) => (
          <CheckoutRow
            key={item.id}
            item={item}
            index={index}
            styles={styles}
          />
        ))}
      </ScrollView>

      <Animated.View style={[styles.summaryRow, { opacity: fade }]}>
        <Text style={styles.summaryLabel}>Total</Text>

        <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
      </Animated.View>

      <Animated.View style={{ transform: [{ scale: orderBtnScale }] }}>
        <TouchableOpacity
          style={[styles.orderBtn, loading && { opacity: 0.7 }]}
          onPress={placeOrder}
          onPressIn={pressIn}
          onPressOut={pressOut}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={colors.BG} />
          ) : (
            <>
              <Text style={styles.orderText}>Place Order</Text>

              <Ionicons name="arrow-forward" size={18} color={colors.BG} />
            </>
          )}
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity
        style={styles.tableBox}
        onPress={() => router.push("/games")}
      >
        <Ionicons
          name="game-controller-outline"
          size={16}
          color={colors.ORANGE}
        />
        <Text style={styles.tableText}>Play while you wait</Text>
      </TouchableOpacity>
    </View>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.BG,
      paddingHorizontal: 20,
      paddingTop: 55,
    },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 18,
    },

    headerTitle: {
      fontSize: 18,
      fontWeight: "900",
      color: colors.CREAM,
    },

    tableBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.CARD,
      borderRadius: 14,
      paddingVertical: 10,
      paddingHorizontal: 14,
      marginBottom: 18,
      alignSelf: "flex-start",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
    },

    tableText: {
      color: colors.CREAM,
      fontWeight: "700",
      fontSize: 12,
    },

    card: {
      flexDirection: "row",
      backgroundColor: colors.CARD,
      borderRadius: 20,
      padding: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
    },

    image: {
      width: 60,
      height: 60,
      borderRadius: 14,
    },

    info: {
      flex: 1,
      marginLeft: 12,
      justifyContent: "center",
    },

    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 6,
    },

    name: {
      fontWeight: "800",
      color: colors.CREAM,
      fontSize: 14,
    },

    muted: {
      fontSize: 12,
      color: colors.LIGHT,
    },

    price: {
      fontWeight: "800",
      color: colors.ORANGE,
      fontSize: 13,
    },

    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.CARD,
      borderRadius: 18,
      padding: 18,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
    },

    summaryLabel: {
      color: colors.LIGHT,
      fontSize: 13,
      fontWeight: "700",
    },

    summaryValue: {
      color: colors.CREAM,
      fontWeight: "900",
      fontSize: 20,
    },

    orderBtn: {
      backgroundColor: colors.ORANGE,
      borderRadius: 20,
      paddingVertical: 16,
      marginBottom: 12,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      shadowColor: colors.ORANGE,
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 6,
    },

    orderText: {
      color: "#FFFFFF",
      fontWeight: "900",
      fontSize: 16,
      letterSpacing: 0.5,
    },
  });
