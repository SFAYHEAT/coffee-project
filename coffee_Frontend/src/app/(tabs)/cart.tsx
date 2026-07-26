import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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
import { useTheme } from "../../context/ThemeContext";

function CartItem({
  item,
  index,
  increase,
  decrease,
  remove,
  updateToppings,
  styles,
  colors,
}: any) {
  const anim = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      delay: index * 100,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);
  const press = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };
  const toppingsTotal = (item.toppings || []).reduce(
    (sum: number, t: string) => sum + (t === "cake" ? 2.5 : 1.5),
    0,
  );
  const finalPrice = (item.basePrice ?? item.price) + toppingsTotal;
  return (
    <Animated.View
      style={[
        styles.item,
        {
          opacity: anim,
          transform: [
            {
              translateX: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [60, 0],
              }),
            },
            { scale },
          ],
        },
      ]}
    >
      <Image source={item.image} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>${finalPrice.toFixed(2)}</Text>
        <View style={styles.qty}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => decrease(item.id)}
          >
            <Ionicons name="remove" size={16} color={colors.CREAM} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.qty}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => increase(item.id)}
          >
            <Ionicons name="add" size={16} color={colors.CREAM} />
          </TouchableOpacity>
        </View>
        {item.toppings !== undefined && (
          <View style={{ marginTop: 10 }}>
            {["cake", "cookie"].map((t) => {
              const active = item.toppings.includes(t);
              return (
                <TouchableOpacity
                  key={t}
                  onPress={() => {
                    const newToppings = active
                      ? item.toppings.filter((x: string) => x !== t)
                      : [...item.toppings, t];
                    const tt = newToppings.reduce(
                      (s: number, id: string) =>
                        s + (id === "cake" ? 2.5 : 1.5),
                      0,
                    );
                    updateToppings(
                      item.id,
                      newToppings,
                      (item.basePrice ?? item.price) + tt,
                    );
                  }}
                >
                  <Text
                    style={{
                      color: active ? colors.ORANGE : colors.LIGHT,
                      marginTop: 4,
                      fontWeight: active ? "800" : "600",
                    }}
                  >
                    {active ? "✓" : "○"}{" "}
                    {t === "cake" ? "Cake Slice (+$2.50)" : "Cookie (+$1.50)"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
      <TouchableOpacity
        onPress={() => {
          press();
          remove(item.id);
        }}
        style={{ padding: 8 }}
      >
        <Ionicons name="trash-outline" size={22} color="#FF5A5F" />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function Cart() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { cart, increaseQty, decreaseQty, removeFromCart, updateToppings } =
    useCart();
  const fade = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    if (cart.length === 0) {
      Animated.loop(
        Animated.sequence([
          Animated.spring(bounce, { toValue: 1.15, useNativeDriver: true }),
          Animated.spring(bounce, { toValue: 1, useNativeDriver: true }),
        ]),
      ).start();
    }
  }, [cart.length]);

  const total = cart.reduce((sum: number, item: any) => {
    const tt = (item.toppings || []).reduce(
      (s: number, t: string) => s + (t === "cake" ? 2.5 : 1.5),
      0,
    );
    return sum + ((item.basePrice ?? item.price) + tt) * item.qty;
  }, 0);

  if (cart.length === 0)
    return (
      <View style={styles.empty}>
        <FloatingBeans color={colors.ORANGE} />
        <Animated.View
          style={[styles.emptyCircle, { transform: [{ scale: bounce }] }]}
        >
          <Ionicons name="bag-outline" size={50} color={colors.ORANGE} />
        </Animated.View>
        <Animated.View style={{ opacity: fade }}>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>
            Choose your favorite coffee and start ordering
          </Text>
          <TouchableOpacity
            style={styles.browse}
            onPress={() => router.push("/home")}
          >
            <Text style={styles.browseText}>Browse Coffee</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );

  return (
    <View style={styles.container}>
      <FloatingBeans color={colors.ORANGE} />
      <Text style={styles.header}>My Cart ☕</Text>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {cart.map((item: any, index: number) => (
          <CartItem
            key={item.id}
            item={item}
            index={index}
            increase={increaseQty}
            decrease={decreaseQty}
            remove={removeFromCart}
            updateToppings={updateToppings}
            styles={styles}
            colors={colors}
          />
        ))}
      </ScrollView>
      <View style={styles.checkoutBox}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.total}>${total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => router.push("/checkout")}
          activeOpacity={0.85}
        >
          <Ionicons name="card-outline" size={20} color={colors.BG} />
          <Text style={styles.checkoutText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.BG,
      paddingTop: 55,
    },

    header: {
      color: colors.CREAM,
      fontSize: 28,
      fontWeight: "900",
      marginHorizontal: 22,
      marginBottom: 20,
    },

    item: {
      backgroundColor: colors.CARD,
      marginHorizontal: 20,
      marginBottom: 16,
      borderRadius: 26,
      padding: 15,
      flexDirection: "row",
      alignItems: "center",
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 5,
    },

    image: {
      width: 85,
      height: 85,
      borderRadius: 20,
      backgroundColor: colors.BG,
    },

    info: {
      flex: 1,
      marginLeft: 14,
    },

    name: {
      color: colors.CREAM,
      fontSize: 16,
      fontWeight: "900",
    },

    price: {
      color: colors.ORANGE,
      fontSize: 15,
      fontWeight: "900",
      marginTop: 5,
    },

    qty: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginTop: 10,
    },

    qtyBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.BG,
      justifyContent: "center",
      alignItems: "center",
    },

    qtyText: {
      color: colors.CREAM,
      fontWeight: "900",
      fontSize: 15,
    },

    empty: {
      flex: 1,
      backgroundColor: colors.BG,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 30,
    },

    emptyCircle: {
      width: 110,
      height: 110,
      borderRadius: 55,
      backgroundColor: colors.CARD,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 25,
    },

    emptyTitle: {
      color: colors.CREAM,
      fontSize: 24,
      fontWeight: "900",
      textAlign: "center",
    },

    emptyText: {
      color: colors.LIGHT,
      textAlign: "center",
      marginTop: 10,
      fontSize: 14,
    },

    browse: {
      marginTop: 25,
      backgroundColor: colors.ORANGE,
      paddingHorizontal: 30,
      paddingVertical: 14,
      borderRadius: 25,
      alignItems: "center",
    },

    browseText: {
      color: colors.BG,
      fontWeight: "900",
    },

    checkoutBox: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.BG,
      borderTopWidth: 1,
      borderTopColor: "rgba(255,255,255,0.08)",
      paddingHorizontal: 22,
      paddingVertical: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    totalLabel: {
      color: colors.LIGHT,
      fontSize: 12,
      fontWeight: "700",
    },

    total: {
      color: colors.CREAM,
      fontSize: 24,
      fontWeight: "900",
      marginTop: 3,
    },

    checkoutBtn: {
      backgroundColor: colors.ORANGE,
      height: 52,
      paddingHorizontal: 28,
      borderRadius: 26,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      shadowColor: colors.ORANGE,
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 6,
    },

    checkoutText: {
      color: colors.BG,
      fontWeight: "900",
      fontSize: 15,
    },
  });
