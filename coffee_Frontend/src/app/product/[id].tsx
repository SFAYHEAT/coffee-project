import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import FloatingBeans from "../../components/FloatingBeans";
import { useCart } from "../../context/CartContext";
import { useTheme } from "../../context/ThemeContext";
import { BASE_URL } from "../../services/api";
const sizes = ["S", "M", "L"];
const sizePrices: any = { S: 0, M: 0.7, L: 1.4 };
const milkOptions = ["Whole", "Oat", "Almond", "Soy"];
const flavorOptions = ["None", "Caramel", "Vanilla", "Hazelnut", "Cinnamon"];

function FadeSection({ delay = 0, style, children }: any) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      delay,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

function ScalePress({ onPress, children, style }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={style}
      onPressIn={() =>
        Animated.spring(scale, { toValue: 0.94, useNativeDriver: true }).start()
      }
      onPressOut={() =>
        Animated.spring(scale, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }).start()
      }
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [toppings, setToppings] = useState<any[]>([]);
  const [selectedSize, setSelectedSize] = useState("S");
  const [qty, setQty] = useState(1);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [milk, setMilk] = useState("Whole");
  const [flavor, setFlavor] = useState("None");
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");

  const scrollY = useRef(new Animated.Value(0)).current;
  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0, 200],
    outputRange: [1.2, 1, 1.1],
    extrapolate: "clamp",
  });
  const imageOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0.5],
    extrapolate: "clamp",
  });
  const headerOpacity = scrollY.interpolate({
    inputRange: [150, 250],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  useEffect(() => {
    fetch(`${BASE_URL}/api/admin/products/${id}`)
      .then((r) => r.json())
      .then(setProduct);
    fetch(`${BASE_URL}/api/admin/toppings`)
      .then((r) => r.json())
      .then(setToppings);
  }, [id]);

  const toggleTopping = (tid: string) => {
    setSelectedToppings((prev) =>
      prev.includes(tid) ? prev.filter((t) => t !== tid) : [...prev, tid],
    );
  };
  const toppingsTotal = toppings
    .filter((t) => selectedToppings.includes(t._id))
    .reduce((sum, t) => sum + t.price, 0);
  const customizerExtra =
    (milk !== "Whole" ? 0.5 : 0) + (flavor !== "None" ? 0.5 : 0);

  if (!product)
    return (
      <View
        style={[
          styles.container,
          { alignItems: "center", justifyContent: "center" },
        ]}
      >
        <FloatingBeans color={colors.ORANGE} />
        <Ionicons name="cafe-outline" size={48} color={colors.LIGHT} />
        <Text style={{ color: colors.LIGHT, marginTop: 16, fontWeight: "700" }}>
          Brewing details...
        </Text>
      </View>
    );

  const unitPrice =
    product.price + sizePrices[selectedSize] + toppingsTotal + customizerExtra;
  const totalPrice = unitPrice * qty;

  const placeOrder = () => {
    addToCart({
      id: `${product._id}-${selectedSize}-${milk}-${flavor}-${selectedToppings.join("")}`,
      productId: product._id,
      name: `${product.name} (${selectedSize}, ${milk} milk)`,
      price: unitPrice,
      image: product.imageUrl
        ? { uri: `${BASE_URL}${product.imageUrl}` }
        : null,
      qty,
    });
    router.push("/checkout");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.BG }}>
      <Animated.View style={[styles.stickyHeader, { opacity: headerOpacity }]}>
        <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
        <Text style={styles.stickyTitle} numberOfLines={1}>
          {product.name}
        </Text>
      </Animated.View>

      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color={colors.CREAM} />
      </TouchableOpacity>

      <ScrollView
        style={styles.container}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      >
        <Animated.View
          style={{
            width: "100%",
            height: 360,
            overflow: "hidden",
            opacity: imageOpacity,
          }}
        >
          <Animated.Image
            source={
              product.imageUrl
                ? { uri: `${BASE_URL}${product.imageUrl}` }
                : require("../../../assets/images/avatar.jpg")
            }
            style={[styles.image, { transform: [{ scale: imageScale }] }]}
          />
          <LinearGradient
            colors={["transparent", colors.BG]}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 100,
            }}
          />
        </Animated.View>

        <View style={styles.sheet}>
          <FloatingBeans color={colors.ORANGE} />
          <FadeSection delay={0} style={styles.row}>
            <Text style={styles.name}>{product.name}</Text>
            <Text style={styles.price}>${totalPrice.toFixed(2)}</Text>
          </FadeSection>
          <Text style={styles.subtitle}>{product.description}</Text>

          {product.origin ? (
            <FadeSection delay={60} style={styles.journeyBox}>
              <View style={styles.journeyHeader}>
                <Ionicons
                  name="earth-outline"
                  size={15}
                  color={colors.ORANGE}
                />
                <Text style={styles.journeyLabel}>Origin</Text>
              </View>
              <Text style={styles.journeyValue}>{product.origin}</Text>
              {product.tastingNotes?.length > 0 && (
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 8,
                    marginTop: 8,
                  }}
                >
                  {product.tastingNotes.map((n: string) => (
                    <View key={n} style={styles.noteTag}>
                      <Text style={styles.noteText}>{n}</Text>
                    </View>
                  ))}
                </View>
              )}
            </FadeSection>
          ) : null}

          <FadeSection delay={100} style={styles.qtyRow}>
            <ScalePress onPress={() => setQty(Math.max(1, qty - 1))}>
              <View style={styles.qtyBtn}>
                <Ionicons name="remove" size={16} color={colors.CREAM} />
              </View>
            </ScalePress>
            <Text style={styles.qtyText}>{qty}</Text>
            <ScalePress onPress={() => setQty(qty + 1)}>
              <View style={styles.qtyBtn}>
                <Ionicons name="add" size={16} color={colors.CREAM} />
              </View>
            </ScalePress>
          </FadeSection>

          <FadeSection delay={140}>
            <Text style={styles.sizeLabel}>Size</Text>
            <View style={styles.sizeRow}>
              {sizes.map((s) => (
                <ScalePress key={s} onPress={() => setSelectedSize(s)}>
                  <View
                    style={[
                      styles.sizeBox,
                      selectedSize === s && styles.sizeBoxActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sizeText,
                        selectedSize === s && styles.sizeTextActive,
                      ]}
                    >
                      {s}
                    </Text>
                  </View>
                </ScalePress>
              ))}
            </View>
          </FadeSection>
          <FadeSection delay={180}>
            <Text style={styles.sizeLabel}>Milk</Text>
            <View style={styles.sizeRow}>
              {milkOptions.map((m) => (
                <ScalePress key={m} onPress={() => setMilk(m)}>
                  <View
                    style={[styles.sizeBox, milk === m && styles.sizeBoxActive]}
                  >
                    <Text
                      style={[
                        styles.sizeText,
                        milk === m && styles.sizeTextActive,
                      ]}
                    >
                      {m}
                    </Text>
                  </View>
                </ScalePress>
              ))}
            </View>
          </FadeSection>
          <FadeSection delay={220}>
            <Text style={styles.sizeLabel}>Flavor</Text>
            <View style={styles.sizeRow}>
              {flavorOptions.map((f) => (
                <ScalePress key={f} onPress={() => setFlavor(f)}>
                  <View
                    style={[
                      styles.sizeBox,
                      flavor === f && styles.sizeBoxActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sizeText,
                        flavor === f && styles.sizeTextActive,
                      ]}
                    >
                      {f}
                    </Text>
                  </View>
                </ScalePress>
              ))}
            </View>
          </FadeSection>

          {toppings.length > 0 && (
            <FadeSection delay={260}>
              <Text style={styles.sizeLabel}>Toppings</Text>
              <View style={styles.sizeRow}>
                {toppings.map((t) => (
                  <ScalePress key={t._id} onPress={() => toggleTopping(t._id)}>
                    <View
                      style={[
                        styles.sizeBox,
                        selectedToppings.includes(t._id) &&
                          styles.sizeBoxActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.sizeText,
                          selectedToppings.includes(t._id) &&
                            styles.sizeTextActive,
                        ]}
                      >
                        {t.name}
                      </Text>
                    </View>
                  </ScalePress>
                ))}
              </View>
            </FadeSection>
          )}

          <FadeSection delay={300}>
            <ScalePress onPress={placeOrder}>
              <View style={styles.orderBtn}>
                <Ionicons name="bag-add" size={18} color="#FFFFFF" />
                <Text style={styles.orderText}>Place Order</Text>
              </View>
            </ScalePress>
          </FadeSection>
        </View>
      </ScrollView>

      <View style={[styles.floatingBar, { backgroundColor: colors.BG }]}>
        <View>
          <Text style={{ color: colors.LIGHT, fontSize: 12 }}>Total</Text>
          <Text
            style={{ color: colors.CREAM, fontSize: 20, fontWeight: "900" }}
          >
            ${totalPrice.toFixed(2)}
          </Text>
        </View>
        <ScalePress onPress={placeOrder}>
          <View
            style={[
              styles.orderBtn,
              { marginTop: 0, paddingVertical: 14, paddingHorizontal: 28 },
            ]}
          >
            <Text style={styles.orderText}>Order Now</Text>
          </View>
        </ScalePress>
      </View>
    </View>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.BG },
    stickyHeader: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      height: 90,
      justifyContent: "flex-end",
      paddingBottom: 12,
      paddingHorizontal: 20,
    },
    stickyTitle: {
      color: colors.CREAM,
      fontSize: 18,
      fontWeight: "900",
      textAlign: "center",
    },
    image: { width: "100%", height: "100%" },
    back: {
      position: "absolute",
      top: 55,
      left: 18,
      zIndex: 20,
      backgroundColor: "rgba(0,0,0,0.45)",
      borderRadius: 20,
      padding: 10,
    },
    sheet: {
      backgroundColor: colors.BG,
      marginTop: -30,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      padding: 24,
      paddingBottom: 120,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    name: { fontSize: 24, fontWeight: "900", color: colors.CREAM },
    subtitle: {
      color: colors.LIGHT,
      fontSize: 13,
      marginTop: 6,
      lineHeight: 20,
    },
    price: { color: colors.ORANGE, fontWeight: "900", fontSize: 18 },
    journeyBox: {
      marginTop: 18,
      backgroundColor: colors.CARD,
      borderRadius: 24,
      padding: 18,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
    },
    journeyHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
    journeyLabel: { color: colors.LIGHT, fontSize: 12, fontWeight: "700" },
    journeyValue: {
      color: colors.CREAM,
      fontSize: 16,
      fontWeight: "800",
      marginTop: 6,
    },
    noteTag: {
      backgroundColor: colors.BG,
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 14,
    },
    noteText: { color: colors.CREAM, fontSize: 12, fontWeight: "700" },
    qtyRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 20,
      gap: 16,
    },
    qtyBtn: {
      backgroundColor: colors.CARD,
      width: 38,
      height: 38,
      borderRadius: 19,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
    },
    qtyText: {
      fontSize: 17,
      fontWeight: "900",
      color: colors.CREAM,
      minWidth: 24,
      textAlign: "center",
    },
    sizeLabel: {
      marginTop: 24,
      marginBottom: 10,
      color: colors.CREAM,
      fontWeight: "800",
      fontSize: 13,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    sizeRow: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
    sizeBox: {
      borderWidth: 1.5,
      borderColor: "rgba(255,255,255,0.1)",
      borderRadius: 16,
      paddingVertical: 10,
      paddingHorizontal: 20,
      backgroundColor: colors.CARD,
    },
    sizeBoxActive: {
      backgroundColor: colors.ORANGE,
      borderColor: colors.ORANGE,
    },
    sizeText: { color: colors.CREAM, fontWeight: "800" },
    sizeTextActive: { color: colors.BG },
    orderBtn: {
      backgroundColor: colors.ORANGE,
      borderRadius: 20,
      paddingVertical: 18,
      alignItems: "center",
      marginTop: 24,
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
      shadowColor: colors.ORANGE,
      shadowOpacity: 0.35,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    },
    orderText: { color: "#FFFFFF", fontWeight: "900", fontSize: 15 },
    starPickerRow: {
      flexDirection: "row",
      gap: 8,
      marginTop: 12,
      marginBottom: 14,
    },

    floatingBar: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: "rgba(255,255,255,0.05)",
    },
  });
