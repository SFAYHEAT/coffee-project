import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CoffeeSteam from "../../components/CoffeeSteam";
import FloatingBeans from "../../components/FloatingBeans";
import FloatingCart from "../../components/FloatingCart";
import MoodSelector from "../../components/MoodSelector";
import TableScanModal from "../../components/TableScanModal";
import WeatherWidget from "../../components/WeatherWidget";
import { useCart } from "../../context/CartContext";
import { useFavorites } from "../../context/FavoritesContext";
import { useTable } from "../../context/TableContext";
import { useTheme } from "../../context/ThemeContext";
import { BASE_URL } from "../../services/api";

const { width } = Dimensions.get("window");
const categories = [
  { label: "All", icon: "apps-outline", desc: "Everything we brew" },
  {
    label: "Coffee",
    icon: "cafe-outline",
    desc: "Bold espresso-based classics",
  },
  { label: "Latte", icon: "cafe-outline", desc: "Smooth, milky & comforting" },
  {
    label: "Dessert",
    icon: "ice-cream-outline",
    desc: "Sweet bites to pair with coffee",
  },
  { label: "Tea", icon: "leaf-outline", desc: "Light, aromatic & soothing" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}

function ScalePress({ children, onPress, style }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      onPressIn={() =>
        Animated.spring(scale, { toValue: 0.92, useNativeDriver: true }).start()
      }
      onPressOut={() =>
        Animated.spring(scale, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }).start()
      }
      style={style}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

function CategoryChip({ cat, active, onPress, colors }: any) {
  const anim = useRef(new Animated.Value(active ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(anim, {
      toValue: active ? 1 : 0,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, [active]);
  const maxW = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 140] });
  return (
    <ScalePress onPress={onPress}>
      <View
        style={[
          styles(colors).chip,
          active && {
            backgroundColor: colors.ORANGE,
            shadowColor: colors.ORANGE,
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 6,
          },
        ]}
      >
        <Ionicons
          name={cat.icon}
          size={20}
          color={active ? colors.BG : colors.ORANGE}
        />
        <Text
          style={[styles(colors).chipLabel, active && { color: colors.BG }]}
        >
          {cat.label}
        </Text>
        <Animated.View style={{ maxWidth: maxW, overflow: "hidden" }}>
          {active && (
            <Text style={styles(colors).chipDesc} numberOfLines={1}>
              {cat.desc}
            </Text>
          )}
        </Animated.View>
      </View>
    </ScalePress>
  );
}

function ProductCard({ item, index, onCart, onFav, liked, colors }: any) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      delay: index * 80,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);
  return (
    <Animated.View
      style={[
        styles(colors).productCard,
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [70, 0],
              }),
            },
            {
              scale: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.88, 1],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push(`/product/${item._id}`)}
      >
        <View style={styles(colors).imageWrap}>
          <Image
            source={
              item.imageUrl
                ? { uri: `${BASE_URL}${item.imageUrl}` }
                : require("../../../assets/images/avatar.jpg")
            }
            style={styles(colors).productImage}
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.5)"]}
            style={styles(colors).imageGrad}
          />
        </View>
        <Text style={styles(colors).productName}>{item.name}</Text>
        <Text style={styles(colors).productPrice}>
          ${(Number(item.price) || 0).toFixed(2)}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles(colors).heart}
        onPress={() => onFav(item)}
      >
        <Animated.View>
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={22}
            color={liked ? "#FF5A5F" : colors.CREAM}
          />
        </Animated.View>
      </TouchableOpacity>
      <ScalePress onPress={() => onCart(item)}>
        <View style={styles(colors).cartButton}>
          <Ionicons name="bag-add-outline" size={17} color={colors.BG} />
          <Text style={styles(colors).cartText}>Add</Text>
        </View>
      </ScalePress>
    </Animated.View>
  );
}

export default function Home() {
  const { colors } = useTheme();
  const s = styles(colors);
  const { table } = useTable();
  const [showScan, setShowScan] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { cart, addToCart } = useCart();
  const { favorites, toggleFavorite } = useFavorites();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [recommendation, setRecommendation] = useState<any>(null);
  const [selectedMood, setSelectedMood] = useState("");
  const [moodIntensity, setMoodIntensity] = useState(0);
  const cartCount = cart.reduce((s: number, i: any) => s + i.qty, 0);

  const scrollY = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const heroAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;

  const heroY = scrollY.interpolate({
    inputRange: [0, 250],
    outputRange: [0, 80],
    extrapolate: "clamp",
  });
  const heroScale = scrollY.interpolate({
    inputRange: [0, 250],
    outputRange: [1, 1.12],
    extrapolate: "clamp",
  });
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const loadUser = async () => {
    try {
      const data = await AsyncStorage.getItem("user");
      if (data) setUser(JSON.parse(data));
    } catch (e) {}
  };
  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/products`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      setProducts([]);
    }
    setLoading(false);
  };
  const loadRecommendation = async (
    mood = selectedMood,
    intensity = moodIntensity,
  ) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/recommend?mood=${mood}&intensity=${intensity}`,
      );
      const data = await res.json();
      setRecommendation(data?.suggestion ? data : null);
    } catch (e) {
      setRecommendation(null);
    }
  };

  useEffect(() => {
    loadUser();
    loadProducts();
    loadRecommendation();
    Animated.parallel([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(heroAnim, {
        toValue: 1,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(searchAnim, {
        toValue: 1,
        delay: 300,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(() => {
    loadProducts();
    loadRecommendation();
  }, []);

  const filtered = products.filter((item) => {
    if (!item) return false;
    const matchSearch = (item.name || "")
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchCat =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const handleAddCart = (item: any) => {
    if (!table) {
      setPendingProduct(item);
      setShowScan(true);
      return;
    }
    addToCart({
      id: item._id,
      name: item.name,
      price: item.price,
      image: item.imageUrl ? { uri: `${BASE_URL}${item.imageUrl}` } : null,
      qty: 1,
    });
  };

  const handleMoodChange = (mood: string, intensity: number) => {
    setSelectedMood(mood);
    setMoodIntensity(intensity);
    loadRecommendation(mood, intensity);
  };

  return (
    <View style={s.container}>
      <FloatingBeans color={colors.ORANGE} />
      <TableScanModal
        visible={showScan}
        onDone={(success = true) => {
          setShowScan(false);
          if (success && pendingProduct) {
            addToCart({
              id: pendingProduct._id,
              name: pendingProduct.name,
              price: pendingProduct.price,
              image: pendingProduct.imageUrl
                ? { uri: `${BASE_URL}${pendingProduct.imageUrl}` }
                : null,
              qty: 1,
            });
          }
          setPendingProduct(null);
        }}
      />
      <FloatingCart count={cartCount} colors={colors} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            tintColor={colors.ORANGE}
            colors={[colors.ORANGE]}
          />
        }
      >
        <Animated.View
          style={[
            s.header,
            {
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-40, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View>
            <Text style={s.smallText}>
              {getGreeting()} {user?.name ? user.name.split(" ")[0] : ""}
            </Text>
            <Text style={s.username}>You deserve a great coffee today</Text>
          </View>
          <View style={s.headerActions}>
            <ScalePress onPress={() => router.push("/notifications" as any)}>
              <View style={s.notificationBtn}>
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color={colors.CREAM}
                />
              </View>
            </ScalePress>
            <ScalePress onPress={() => router.push("/profile")}>
              <Image
                source={
                  user?.avatar
                    ? { uri: user.avatar }
                    : require("../../../assets/images/avatar.jpg")
                }
                style={s.avatar}
              />
            </ScalePress>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            s.hero,
            {
              opacity: heroAnim,
              transform: [{ translateY: heroY }, { scale: heroScale }],
            },
          ]}
        >
          <Image
            source={require("../../../assets/images/beans-bg.jpg")}
            style={s.heroImage}
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,.85)"]}
            style={StyleSheet.absoluteFillObject}
          />
          <CoffeeSteam />
          <View style={s.heroText}>
            <Text style={s.heroTitle}>Your Perfect</Text>
            <Text style={s.heroTitle}>Coffee Moment</Text>
            <Text style={s.heroSubtitle}>Fresh roasted beans every day</Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            s.searchBox,
            {
              opacity: searchAnim,
              transform: [
                {
                  translateY: searchAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Ionicons name="search" size={20} color={colors.LIGHT} />
          <TextInput
            placeholder="Search coffee..."
            placeholderTextColor="#A9978B"
            value={search}
            onChangeText={setSearch}
            style={s.search}
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch("")}
              style={{ padding: 4 }}
            >
              <Ionicons name="close-circle" size={18} color={colors.LIGHT} />
            </TouchableOpacity>
          )}
        </Animated.View>

        <WeatherWidget colors={colors} />

        {recommendation?.suggestion && (
          <ScalePress
            onPress={() =>
              router.push(`/product/${recommendation.suggestion._id}`)
            }
          >
            <View style={s.recommendBanner}>
              <Ionicons
                name="sparkles-outline"
                size={24}
                color={colors.ORANGE}
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={s.recommendReason}>{recommendation.reason}</Text>
                <Text style={s.recommendItem}>
                  Try: {recommendation.suggestion.name}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.ORANGE}
              />
            </View>
          </ScalePress>
        )}

        <MoodSelector colors={colors} onChange={handleMoodChange} />

        {selectedMood && (
          <Animated.View style={[s.moodResult, { opacity: searchAnim }]}>
            <Ionicons name="sparkles-outline" size={18} color={colors.ORANGE} />
            <Text style={s.moodText}>
              Perfect, we'll find something for your {selectedMood} mood ☕
            </Text>
          </Animated.View>
        )}

        <Text style={s.sectionTitle}>Categories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {categories.map((cat) => (
            <CategoryChip
              key={cat.label}
              cat={cat}
              active={selectedCategory === cat.label}
              onPress={() => setSelectedCategory(cat.label)}
              colors={colors}
            />
          ))}
        </ScrollView>

        <Text style={s.sectionTitle}>Popular Coffee</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20, paddingRight: 20 }}
        >
          {filtered.map((item, index) => (
            <ProductCard
              key={item._id}
              item={item}
              index={index}
              onCart={handleAddCart}
              onFav={() => toggleFavorite(item)}
              liked={favorites?.some((f: any) => f.id === item._id)}
              colors={colors}
            />
          ))}
        </ScrollView>

        <ScalePress onPress={() => router.push("/menu")}>
          <View style={s.moreButton}>
            <Text style={s.moreText}>Explore Full Menu</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.CREAM} />
          </View>
        </ScalePress>

        <ScalePress onPress={() => router.push("/menu")}>
          <View style={s.promo}>
            <Image
              source={require("../../../assets/images/cappuccino-wide.jpg")}
              style={s.promoImage}
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,.85)"]}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={s.promoContent}>
              <Text style={s.promoTitle}>Special Offer 🎁</Text>
              <Text style={s.promoSubtitle}>
                Buy one coffee and get another free today
              </Text>
            </View>
          </View>
        </ScalePress>
      </ScrollView>
    </View>
  );
}

const styles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.BG },
    header: {
      paddingTop: 60,
      paddingHorizontal: 22,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    smallText: { color: colors.LIGHT, fontSize: 13, fontWeight: "600" },
    username: {
      color: colors.CREAM,
      fontSize: 20,
      fontWeight: "900",
      marginTop: 5,
      maxWidth: 220,
    },
    headerActions: { flexDirection: "row", alignItems: "center", gap: 12 },
    notificationBtn: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: colors.CARD,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.06)",
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: colors.ORANGE,
    },
    hero: {
      height: 240,
      margin: 22,
      borderRadius: 36,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 10,
    },
    heroImage: { width: "100%", height: "100%" },
    heroText: { position: "absolute", left: 22, bottom: 25 },
    heroTitle: {
      fontSize: 30,
      fontWeight: "900",
      color: "#fff",
      textShadowColor: "rgba(0,0,0,0.5)",
      textShadowRadius: 10,
    },
    heroSubtitle: {
      color: "#E8D9CC",
      fontSize: 14,
      marginTop: 8,
      fontWeight: "600",
    },
    searchBox: {
      height: 58,
      marginHorizontal: 22,
      backgroundColor: colors.CARD,
      borderRadius: 24,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 18,
      gap: 12,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
    },
    search: { flex: 1, color: colors.CREAM, fontSize: 14 },
    recommendBanner: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.CARD,
      marginHorizontal: 22,
      marginTop: 16,
      borderRadius: 22,
      padding: 16,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
    },
    recommendReason: { color: colors.LIGHT, fontSize: 12 },
    recommendItem: {
      color: colors.CREAM,
      fontWeight: "900",
      marginTop: 4,
      fontSize: 14,
    },
    moodResult: {
      marginHorizontal: 22,
      marginTop: 12,
      padding: 14,
      borderRadius: 18,
      backgroundColor: colors.CARD,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
    },
    moodText: { color: colors.CREAM, fontSize: 13, fontWeight: "700", flex: 1 },
    sectionTitle: {
      color: colors.CREAM,
      fontSize: 20,
      fontWeight: "900",
      marginHorizontal: 22,
      marginTop: 28,
      marginBottom: 16,
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.CARD,
      marginLeft: 18,
      paddingHorizontal: 18,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
    },
    chipLabel: { color: colors.CREAM, fontWeight: "800", fontSize: 13 },
    chipDesc: {
      color: colors.BG,
      fontSize: 11,
      fontWeight: "700",
      marginLeft: 4,
    },
    productCard: {
      width: 170,
      backgroundColor: colors.CARD,
      borderRadius: 28,
      marginLeft: 20,
      padding: 14,
      shadowColor: "#000",
      shadowOpacity: 0.3,
      shadowRadius: 15,
      elevation: 8,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.04)",
    },
    imageWrap: { position: "relative", borderRadius: 20, overflow: "hidden" },
    productImage: {
      width: "100%",
      height: 150,
      resizeMode: "cover",
      borderRadius: 20,
    },
    imageGrad: { ...StyleSheet.absoluteFillObject, borderRadius: 20 },
    heart: {
      position: "absolute",
      right: 8,
      top: 8,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(0,0,0,0.35)",
      alignItems: "center",
      justifyContent: "center",
    },
    productName: {
      color: colors.CREAM,
      fontSize: 15,
      fontWeight: "900",
      marginTop: 10,
    },
    productPrice: {
      color: colors.ORANGE,
      fontSize: 15,
      fontWeight: "900",
      marginTop: 5,
    },
    cartButton: {
      height: 38,
      backgroundColor: colors.ORANGE,
      borderRadius: 18,
      marginTop: 12,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 5,
    },
    cartText: { color: colors.BG, fontWeight: "900", fontSize: 13 },
    moreButton: {
      marginHorizontal: 22,
      marginTop: 25,
      height: 58,
      borderRadius: 24,
      backgroundColor: colors.CARD,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
    },
    moreText: { color: colors.CREAM, fontWeight: "900", fontSize: 15 },
    promo: {
      height: 160,
      margin: 22,
      borderRadius: 32,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 10,
    },
    promoImage: { width: "100%", height: "100%" },
    promoContent: { position: "absolute", left: 20, bottom: 20 },
    promoTitle: {
      color: "#fff",
      fontSize: 24,
      fontWeight: "900",
      textShadowColor: "rgba(0,0,0,0.5)",
      textShadowRadius: 10,
    },
    promoSubtitle: {
      color: "#E8D9CC",
      marginTop: 6,
      fontSize: 13,
      fontWeight: "600",
    },
  });
