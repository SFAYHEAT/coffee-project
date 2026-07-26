import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { BASE_URL } from "../services/api";

// ================= COFFEE GRAIN BACKGROUND =================
function CoffeeBackground({ colors }: any) {
  const beans = [
    { top: "3%", left: "8%", size: 22, rot: "15deg", op: 0.05 },
    { top: "12%", left: "78%", size: 30, rot: "-20deg", op: 0.06 },
    { top: "22%", left: "35%", size: 18, rot: "40deg", op: 0.04 },
    { top: "30%", left: "60%", size: 26, rot: "-10deg", op: 0.05 },
    { top: "42%", left: "12%", size: 20, rot: "25deg", op: 0.05 },
    { top: "50%", left: "85%", size: 24, rot: "5deg", op: 0.04 },
    { top: "60%", left: "45%", size: 32, rot: "-30deg", op: 0.06 },
    { top: "70%", left: "20%", size: 18, rot: "10deg", op: 0.04 },
    { top: "78%", left: "70%", size: 22, rot: "-15deg", op: 0.05 },
    { top: "88%", left: "5%", size: 28, rot: "20deg", op: 0.05 },
    { top: "95%", left: "55%", size: 20, rot: "-5deg", op: 0.04 },
    { top: "18%", left: "92%", size: 16, rot: "35deg", op: 0.04 },
  ];

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {beans.map((b, i) => (
        <Ionicons
          key={i}
          name="cafe"
          size={b.size}
          color={colors.ORANGE}
          style={{
            position: "absolute",
            top: b.top as any,
            left: b.left as any,
            opacity: b.op,
            transform: [{ rotate: b.rot }],
          }}
        />
      ))}
    </View>
  );
}

// ================= FADE/SLIDE IN WRAPPER =================
function FadeInView({ children, delay = 0, style }: any) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 420,
      delay,
      easing: Easing.out(Easing.cubic),
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
                outputRange: [16, 0],
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

// ================= PRESSABLE SCALE WRAPPER =================
function PressScale({ onPress, disabled, style, children }: any) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();

  const pressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled}
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      style={style}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ================= TAB ICON MAP =================
const TAB_ICONS: Record<string, any> = {
  products: "cafe-outline",
  tables: "grid-outline",
  users: "people-outline",
  complaints: "chatbubbles-outline",
  toppings: "add-circle-outline",
  wheel: "sync-outline",
  analytics: "stats-chart-outline",
};

export default function Admin() {
  const scrollRef = useRef<ScrollView>(null);
  const productRefs = useRef<{ [key: string]: number }>({});
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [detailedOrders, setDetailedOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [allReviews, setAllReviews] = useState<any[]>([]);

  const loadDetailedAnalytics = async () => {
    const token = await AsyncStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/admin/users/analytics/detailed`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setDetailedOrders(data.orders || []);
    setTopProducts(data.topProducts || []);
    setAllReviews(data.reviews || []);
  };
  const [section, setSection] = useState<
    | "products"
    | "tables"
    | "users"
    | "complaints"
    | "toppings"
    | "wheel"
    | "analytics"
  >("products");

  // ================= PRODUCTS =================

  const [products, setProducts] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  // Coffee Journey fields
  const [origin, setOrigin] = useState("");
  const [roastLevel, setRoastLevel] = useState("5");
  const [tastingNotes, setTastingNotes] = useState("");

  const [imageUri, setImageUri] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);

  // ================= USERS =================

  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userAdmin, setUserAdmin] = useState(false);

  const [userPoints, setUserPoints] = useState("");
  const [userTier, setUserTier] = useState("");
  const [userRole, setUserRole] = useState("client");

  // ================= USERS CRUD =================

  const editUser = (user: any) => {
    if (editingUserId === user._id) {
      setEditingUserId(null);
      return;
    }

    setEditingUserId(user._id);

    setUserName(user.name || "");
    setUserEmail(user.email || "");
    setUserAdmin(user.isAdmin || false);

    setUserPoints(String(user.loyaltyPoints || 0));
    setUserTier(user.tier || "Bronze");
    setUserRole(user.role || "client");
  };
  const forceLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");

    Alert.alert(
      "Access Removed",
      "Your admin privileges were removed. You will be logged out.",
    );

    router.replace("/login");
  };
  const saveUser = async () => {
    if (!editingUserId) return;

    const token = await AsyncStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/api/admin/users/${editingUserId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: userName,
        email: userEmail,
        isAdmin: userAdmin,
        loyaltyPoints: Number(userPoints),
        tier: userTier,
        role: userRole,
      }),
    });

    const data = await res.json();

    console.log("UPDATE RESPONSE:", data);

    if (!res.ok) {
      Alert.alert("Error", data.message || "Update failed");
      return;
    }

    Alert.alert("Success", "User updated");

    setEditingUserId(null);

    loadUsers();
  };

  const deleteUser = async (id: string) => {
    Alert.alert("Delete user", "Are you sure?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: async () => {
          const token = await AsyncStorage.getItem("token");

          await fetch(`${BASE_URL}/api/admin/users/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          loadUsers();
        },
      },
    ]);
  };

  // ================= TABLES =================

  const [tables, setTables] = useState<any[]>([]);
  const [tableNumber, setTableNumber] = useState("");

  // ================= COMPLAINTS =================

  const [threads, setThreads] = useState<any[]>([]);

  const [replyText, setReplyText] = useState<{
    [key: string]: string;
  }>({});

  // ================= TOPPINGS =================

  const [toppings, setToppings] = useState<any[]>([]);

  const [toppingName, setToppingName] = useState("");

  const [toppingPrice, setToppingPrice] = useState("");

  const [editingToppingId, setEditingToppingId] = useState<string | null>(null);

  // ================= WHEEL =================

  const [prizes, setPrizes] = useState<any[]>([]);

  const [prizeLabel, setPrizeLabel] = useState("");

  const [prizeType, setPrizeType] = useState("discount");

  const [prizeValue, setPrizeValue] = useState("");

  const [prizeWeight, setPrizeWeight] = useState("1");

  const [editingPrizeId, setEditingPrizeId] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
    loadUsers();
    loadTables();
  }, []);

  // ================= PRODUCT LOAD =================

  const loadProducts = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/products`);

      setProducts(await res.json());
    } catch (e) {
      console.log(e);
    }
  };

  const loadUsers = async () => {
    const token = await AsyncStorage.getItem("token");

    const [uRes, sRes] = await Promise.all([
      fetch(`${BASE_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),

      fetch(`${BASE_URL}/api/admin/users/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    ]);

    const usersData = await uRes.json();
    const statsData = await sRes.json();

    if (
      usersData.message === "Admin access required" ||
      statsData.message === "Admin access required"
    ) {
      forceLogout();
      return;
    }

    console.log("USERS RESPONSE:", usersData);
    console.log("STATS RESPONSE:", statsData);

    setUsers(Array.isArray(usersData) ? usersData : usersData.users || []);
    setStats(statsData);
  };

  const loadTables = async () => {
    const token = await AsyncStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/api/admin/tables`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (data.message === "Admin access required") {
      forceLogout();
      return;
    }

    setTables(Array.isArray(data) ? data : []);
  };

  const loadThreads = async () => {
    const token = await AsyncStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/api/reclamation`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setThreads(await res.json());
  };

  // ================= TOPPINGS LOAD =================

  const loadToppings = async () => {
    const res = await fetch(`${BASE_URL}/api/admin/toppings`);

    setToppings(await res.json());
  };

  // ================= WHEEL LOAD =================

  const loadPrizes = async () => {
    const res = await fetch(`${BASE_URL}/api/admin/wheel`);

    setPrizes(await res.json());
  };
  // ================= IMAGE =================

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImage = async (token: string) => {
    if (!imageUri) return null;

    const form = new FormData();

    form.append("image", {
      uri: imageUri,
      name: "photo.jpg",
      type: "image/jpeg",
    } as any);

    const res = await fetch(`${BASE_URL}/api/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });

    const data = await res.json();

    return data.url;
  };

  // ================= PRODUCT SAVE =================

  const resetForm = () => {
    setName("");
    setPrice("");
    setCategory("");
    setDescription("");

    setOrigin("");
    setRoastLevel("5");
    setTastingNotes("");

    setImageUri(null);

    setEditingId(null);
  };

  const saveProduct = async () => {
    if (!name || !price || !category) {
      Alert.alert("Missing fields", "Name price category required");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");

      let finalImageUrl = imageUri;

      // Upload only new local images
      if (imageUri && !imageUri.startsWith("http")) {
        finalImageUrl = await uploadImage(token as string);
      }

      const body = {
        name,

        price: Number(price),

        category,

        description,

        origin,

        roastLevel: Number(roastLevel),

        tastingNotes: tastingNotes
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),

        ...(finalImageUrl && {
          imageUrl: finalImageUrl,
        }),
      };

      const url = editingId
        ? `${BASE_URL}/api/admin/products/${editingId}`
        : `${BASE_URL}/api/admin/products`;

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed saving product");
      }

      resetForm();

      await loadProducts();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const editProduct = (p: any) => {
    setEditingId(p._id);

    setName(p.name || "");

    setPrice(String(p.price || ""));

    setCategory(p.category || "");

    setDescription(p.description || "");

    setOrigin(p.origin || "");

    setRoastLevel(String(p.roastLevel || 5));

    setTastingNotes((p.tastingNotes || []).join(", "));

    console.log("EDIT IMAGE:", p.imageUrl);

    setImageUri(
      p.imageUrl
        ? p.imageUrl.startsWith("http")
          ? p.imageUrl
          : `${BASE_URL}${p.imageUrl}`
        : null,
    );
  };

  const deleteProduct = async (id: string) => {
    const token = await AsyncStorage.getItem("token");

    await fetch(`${BASE_URL}/api/admin/products/${id}`, {
      method: "DELETE",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    loadProducts();
  };

  // ================= TABLES =================

  const addTable = async () => {
    if (!tableNumber) return;

    const token = await AsyncStorage.getItem("token");

    await fetch(`${BASE_URL}/api/admin/tables`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        tableNumber,
        qrCode: `coffeeapp://table/${tableNumber}`,
      }),
    });

    setTableNumber("");

    loadTables();
  };

  const toggleActive = async (t: any) => {
    const token = await AsyncStorage.getItem("token");

    await fetch(`${BASE_URL}/api/admin/tables/${t._id}`, {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",

        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        active: !t.active,
      }),
    });

    loadTables();
  };

  const deleteTable = async (id: string) => {
    const token = await AsyncStorage.getItem("token");

    await fetch(`${BASE_URL}/api/admin/tables/${id}`, {
      method: "DELETE",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    loadTables();
  };
  // ================= COMPLAINTS =================

  const reply = async (id: string) => {
    const text = replyText[id];

    if (!text) return;

    const token = await AsyncStorage.getItem("token");

    await fetch(`${BASE_URL}/api/reclamation/${id}/reply`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        message: text,
      }),
    });

    setReplyText((prev) => ({
      ...prev,

      [id]: "",
    }));

    loadThreads();
  };

  // ================= TOPPINGS CRUD =================

  const saveTopping = async () => {
    if (!toppingName || !toppingPrice) {
      Alert.alert("Missing fields", "Name and price required");

      return;
    }

    const token = await AsyncStorage.getItem("token");

    const body = {
      name: toppingName,

      price: Number(toppingPrice),
    };

    const url = editingToppingId
      ? `${BASE_URL}/api/admin/toppings/${editingToppingId}`
      : `${BASE_URL}/api/admin/toppings`;

    const method = editingToppingId ? "PUT" : "POST";

    await fetch(url, {
      method,

      headers: {
        "Content-Type": "application/json",

        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(body),
    });

    setToppingName("");

    setToppingPrice("");

    setEditingToppingId(null);

    loadToppings();
  };

  const editTopping = (t: any) => {
    setEditingToppingId(t._id);

    setToppingName(t.name);

    setToppingPrice(String(t.price));
  };

  const deleteTopping = async (id: string) => {
    const token = await AsyncStorage.getItem("token");

    await fetch(`${BASE_URL}/api/admin/toppings/${id}`, {
      method: "DELETE",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    loadToppings();
  };

  // ================= WHEEL CRUD =================

  const savePrize = async () => {
    if (!prizeLabel || !prizeValue) {
      Alert.alert("Missing fields", "Label and value required");

      return;
    }

    const token = await AsyncStorage.getItem("token");

    const body = {
      label: prizeLabel,

      type: prizeType,

      value: prizeValue,

      weight: Number(prizeWeight),
    };

    const url = editingPrizeId
      ? `${BASE_URL}/api/admin/wheel/${editingPrizeId}`
      : `${BASE_URL}/api/admin/wheel`;

    const method = editingPrizeId ? "PUT" : "POST";

    await fetch(url, {
      method,

      headers: {
        "Content-Type": "application/json",

        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(body),
    });

    setPrizeLabel("");

    setPrizeValue("");

    setPrizeWeight("1");

    setPrizeType("discount");

    setEditingPrizeId(null);

    loadPrizes();
  };

  const editPrize = (p: any) => {
    setEditingPrizeId(p._id);

    setPrizeLabel(p.label);

    setPrizeType(p.type);

    setPrizeValue(String(p.value));

    setPrizeWeight(String(p.weight));
  };

  const deletePrize = async (id: string) => {
    const token = await AsyncStorage.getItem("token");

    await fetch(`${BASE_URL}/api/admin/wheel/${id}`, {
      method: "DELETE",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    loadPrizes();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.BG }}>
      <CoffeeBackground colors={colors} />
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={{
          paddingBottom: 80,
        }}
      >
        <FadeInView>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.eyebrow}>COffEE CONTROL PANEL</Text>
              <Text style={styles.title}>Admin Dashboard</Text>
            </View>
            <View style={styles.headerBadge}>
              <Ionicons
                name="shield-checkmark"
                size={20}
                color={colors.ORANGE}
              />
            </View>
          </View>
        </FadeInView>

        {/* ================= TABS ================= */}

        <View style={styles.tabs}>
          {[
            "products",
            "tables",
            "users",
            "complaints",
            "toppings",
            "wheel",
            "analytics",
          ].map((s: any) => (
            <PressScale
              key={s}
              style={[styles.tabButton, section === s && styles.activeTab]}
              onPress={() => {
                setSection(s);

                if (s === "toppings") loadToppings();
                if (s === "wheel") loadPrizes();
                if (s === "complaints") loadThreads();
                if (s === "analytics") loadDetailedAnalytics();
              }}
            >
              <Ionicons
                name={TAB_ICONS[s]}
                size={15}
                color={section === s ? colors.BG : colors.LIGHT}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[styles.tabText, section === s && { color: colors.BG }]}
              >
                {s.toUpperCase()}
              </Text>
            </PressScale>
          ))}
        </View>

        {/* ================= PRODUCTS ================= */}

        {section === "products" && (
          <FadeInView key="products-section">
            <Text style={styles.sectionTitle}>PRODUCTS MANAGEMENT</Text>

            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="add-circle" size={18} color={colors.ORANGE} />
                <Text style={styles.productName}>ADD NEW PRODUCT</Text>
              </View>

              <Text style={styles.fieldLabel}>Name</Text>
              <TextInput
                placeholder="Name"
                placeholderTextColor="#8A7A6F"
                value={editingId ? "" : name}
                onChangeText={setName}
                style={styles.input}
                editable={!editingId}
              />

              <Text style={styles.fieldLabel}>Price</Text>
              <TextInput
                placeholder="Price"
                placeholderTextColor="#8A7A6F"
                keyboardType="numeric"
                value={editingId ? "" : price}
                onChangeText={setPrice}
                style={styles.input}
                editable={!editingId}
              />

              <Text style={styles.fieldLabel}>Category</Text>
              <TextInput
                placeholder="Category"
                placeholderTextColor="#8A7A6F"
                value={editingId ? "" : category}
                onChangeText={setCategory}
                style={styles.input}
                editable={!editingId}
              />

              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                placeholder="Description"
                placeholderTextColor="#8A7A6F"
                value={editingId ? "" : description}
                onChangeText={setDescription}
                style={styles.input}
                editable={!editingId}
              />

              <Text style={styles.fieldLabel}>Origin</Text>
              <TextInput
                placeholder="Origin e.g Colombia"
                placeholderTextColor="#8A7A6F"
                value={editingId ? "" : origin}
                onChangeText={setOrigin}
                style={styles.input}
                editable={!editingId}
              />

              <Text style={styles.fieldLabel}>Roast Level</Text>
              <TextInput
                placeholder="1-10"
                placeholderTextColor="#8A7A6F"
                keyboardType="numeric"
                value={editingId ? "" : roastLevel}
                onChangeText={setRoastLevel}
                style={styles.input}
                editable={!editingId}
              />

              <Text style={styles.fieldLabel}>Tasting Notes</Text>
              <TextInput
                placeholder="Chocolate, Caramel"
                placeholderTextColor="#8A7A6F"
                value={editingId ? "" : tastingNotes}
                onChangeText={setTastingNotes}
                style={styles.input}
                editable={!editingId}
              />

              <Text style={styles.fieldLabel}>Photo</Text>
              <PressScale
                style={styles.imageBtn}
                onPress={pickImage}
                disabled={!!editingId}
              >
                {imageUri ? (
                  <Image
                    source={{
                      uri: imageUri || undefined,
                    }}
                    style={styles.previewImage}
                  />
                ) : (
                  <View style={{ alignItems: "center" }}>
                    <Ionicons
                      name="image-outline"
                      size={26}
                      color={colors.LIGHT}
                    />
                    <Text style={styles.imageBtnText}>Pick Image</Text>
                  </View>
                )}
              </PressScale>

              <PressScale
                style={styles.button}
                onPress={saveProduct}
                disabled={!!editingId}
              >
                <Text style={styles.buttonText}>ADD PRODUCT</Text>
              </PressScale>
              {editingId && (
                <Text
                  style={{
                    color: colors.LIGHT,
                    marginTop: 8,
                    textAlign: "center",
                  }}
                >
                  Editing below — cancel to add new
                </Text>
              )}
            </View>

            {Array.isArray(products) &&
              products.map((p, idx) => (
                <FadeInView key={p._id} delay={Math.min(idx * 40, 300)}>
                  <View
                    style={styles.productRow}
                    onLayout={(e) => {
                      productRefs.current[p._id] = e.nativeEvent.layout.y;
                    }}
                  >
                    {p.imageUrl ? (
                      <Image
                        source={{
                          uri: p.imageUrl.startsWith("http")
                            ? p.imageUrl
                            : `${BASE_URL}${p.imageUrl}`,
                        }}
                        style={styles.thumb}
                      />
                    ) : (
                      <View style={[styles.thumb, styles.thumbPlaceholder]}>
                        <Ionicons
                          name="cafe-outline"
                          size={26}
                          color={colors.LIGHT}
                        />
                      </View>
                    )}

                    <InfoRow
                      title="Product Name"
                      value={p.name}
                      styles={styles}
                    />
                    <InfoRow
                      title="Price"
                      value={`$${p.price}`}
                      styles={styles}
                    />
                    <InfoRow
                      title="Category"
                      value={p.category}
                      styles={styles}
                    />
                    <Text style={styles.productCat}>
                      Origin: {p.origin || "Unknown"}
                    </Text>
                    <Text style={styles.productCat}>
                      Roast Level: {p.roastLevel || 5}/10
                    </Text>
                    <Text style={styles.productCat}>
                      Description: {p.description || "None"}
                    </Text>

                    <View style={styles.actions}>
                      <TouchableOpacity
                        onPress={() =>
                          editingId === p._id ? resetForm() : editProduct(p)
                        }
                      >
                        <Ionicons
                          name="create-outline"
                          size={22}
                          color={colors.ORANGE}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteProduct(p._id)}>
                        <Ionicons
                          name="trash-outline"
                          size={22}
                          color="#FF5A5F"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {editingId === p._id && (
                    <FadeInView style={styles.card}>
                      <View style={styles.cardHeaderRow}>
                        <Ionicons
                          name="create"
                          size={18}
                          color={colors.ORANGE}
                        />
                        <Text style={styles.productName}>
                          EDITING: {p.name}
                        </Text>
                      </View>

                      <Text style={styles.fieldLabel}>Name</Text>
                      <TextInput
                        value={name}
                        onChangeText={setName}
                        style={styles.input}
                        placeholderTextColor="#8A7A6F"
                      />

                      <Text style={styles.fieldLabel}>Price</Text>
                      <TextInput
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="numeric"
                        style={styles.input}
                        placeholderTextColor="#8A7A6F"
                      />

                      <Text style={styles.fieldLabel}>Category</Text>
                      <TextInput
                        value={category}
                        onChangeText={setCategory}
                        style={styles.input}
                        placeholderTextColor="#8A7A6F"
                      />

                      <Text style={styles.fieldLabel}>Description</Text>
                      <TextInput
                        value={description}
                        onChangeText={setDescription}
                        style={styles.input}
                        placeholderTextColor="#8A7A6F"
                      />

                      <Text style={styles.fieldLabel}>Origin</Text>
                      <TextInput
                        value={origin}
                        onChangeText={setOrigin}
                        style={styles.input}
                        placeholderTextColor="#8A7A6F"
                      />

                      <Text style={styles.fieldLabel}>Roast Level</Text>
                      <TextInput
                        value={roastLevel}
                        onChangeText={setRoastLevel}
                        keyboardType="numeric"
                        style={styles.input}
                        placeholderTextColor="#8A7A6F"
                      />

                      <Text style={styles.fieldLabel}>Tasting Notes</Text>
                      <TextInput
                        value={tastingNotes}
                        onChangeText={setTastingNotes}
                        style={styles.input}
                        placeholderTextColor="#8A7A6F"
                      />

                      <Text style={styles.fieldLabel}>Photo</Text>
                      <PressScale style={styles.imageBtn} onPress={pickImage}>
                        {imageUri ? (
                          <Image
                            source={{ uri: imageUri }}
                            style={styles.previewImage}
                          />
                        ) : (
                          <View style={{ alignItems: "center" }}>
                            <Ionicons
                              name="image-outline"
                              size={26}
                              color={colors.LIGHT}
                            />
                            <Text style={styles.imageBtnText}>
                              Pick New Image (optional)
                            </Text>
                          </View>
                        )}
                      </PressScale>

                      <PressScale style={styles.button} onPress={saveProduct}>
                        <Text style={styles.buttonText}>UPDATE PRODUCT</Text>
                      </PressScale>
                      <PressScale
                        style={[styles.button, styles.cancelButton]}
                        onPress={resetForm}
                      >
                        <Text style={styles.buttonText}>CANCEL</Text>
                      </PressScale>
                    </FadeInView>
                  )}
                </FadeInView>
              ))}
          </FadeInView>
        )}
        {/* ================= analytics ================= */}
        {section === "analytics" && (
          <FadeInView key="analytics-section">
            <Text style={styles.sectionTitle}>REVENUE & ANALYTICS</Text>
            {stats && (
              <View style={styles.statsRow}>
                <FadeInView delay={0} style={styles.statBox}>
                  <View style={styles.statIconWrap}>
                    <Ionicons
                      name="cash-outline"
                      size={20}
                      color={colors.ORANGE}
                    />
                  </View>
                  <Text style={styles.statValue}>
                    ${stats.totalRevenue?.toFixed(2) || 0}
                  </Text>
                  <Text style={styles.statLabel}>Revenue</Text>
                </FadeInView>
                <FadeInView delay={80} style={styles.statBox}>
                  <View style={styles.statIconWrap}>
                    <Ionicons
                      name="receipt-outline"
                      size={20}
                      color={colors.ORANGE}
                    />
                  </View>
                  <Text style={styles.statValue}>{stats.orderCount || 0}</Text>
                  <Text style={styles.statLabel}>Orders</Text>
                </FadeInView>
                <FadeInView delay={160} style={styles.statBox}>
                  <View style={styles.statIconWrap}>
                    <Ionicons
                      name="people-outline"
                      size={20}
                      color={colors.ORANGE}
                    />
                  </View>
                  <Text style={styles.statValue}>{stats.userCount || 0}</Text>
                  <Text style={styles.statLabel}>Users</Text>
                </FadeInView>
              </View>
            )}

            <Text style={styles.sectionTitle}>MOST LIKED PRODUCTS</Text>
            {topProducts.map((p, i) => (
              <FadeInView key={p.name} delay={i * 50} style={styles.productRow}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Ionicons
                    name="trophy"
                    size={18}
                    color={i === 0 ? "#FFD700" : colors.ORANGE}
                  />
                  <InfoRow
                    title={`#${i + 1} Rank`}
                    value={`${p.name} — ${p.count} orders`}
                    styles={styles}
                  />
                </View>
              </FadeInView>
            ))}

            <Text style={styles.sectionTitle}>ALL ORDERS</Text>
            {detailedOrders.map((o, i) => (
              <FadeInView
                key={o._id}
                delay={Math.min(i * 30, 300)}
                style={styles.productRow}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <Ionicons
                    name="person-circle-outline"
                    size={18}
                    color={colors.ORANGE}
                  />
                  <Text style={styles.productName}>{o.customer}</Text>
                </View>
                <InfoRow title="Email" value={o.email} styles={styles} />
                <InfoRow title="Table" value={o.tableNumber} styles={styles} />
                <InfoRow
                  title="Date"
                  value={new Date(o.date).toLocaleString()}
                  styles={styles}
                />
                <InfoRow
                  title="Items"
                  value={o.items
                    .map((i: any) => `${i.name} x${i.qty}`)
                    .join(", ")}
                  styles={styles}
                />
                <InfoRow
                  title="Total"
                  value={`$${o.total.toFixed(2)}`}
                  styles={styles}
                />
              </FadeInView>
            ))}

            <Text style={styles.sectionTitle}>PRODUCT REVIEWS</Text>
            {allReviews.length === 0 && (
              <Text style={{ color: colors.LIGHT }}>No reviews yet</Text>
            )}
            {allReviews.map((r, i) => (
              <FadeInView
                key={r._id}
                delay={Math.min(i * 30, 300)}
                style={styles.productRow}
              >
                <View style={{ flexDirection: "row", gap: 4, marginBottom: 6 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Ionicons
                      key={n}
                      name={n <= r.rating ? "star" : "star-outline"}
                      size={16}
                      color={colors.ORANGE}
                    />
                  ))}
                </View>
                <InfoRow title="Customer" value={r.customer} styles={styles} />
                <InfoRow title="Product" value={r.product} styles={styles} />
                {r.comment ? (
                  <InfoRow title="Comment" value={r.comment} styles={styles} />
                ) : null}
                <InfoRow
                  title="Date"
                  value={new Date(r.date).toLocaleString()}
                  styles={styles}
                />
              </FadeInView>
            ))}
          </FadeInView>
        )}

        {/* ================= USERS ================= */}
        {section === "users" && (
          <FadeInView key="users-section">
            <Text style={styles.sectionTitle}>USERS MANAGEMENT</Text>

            {Array.isArray(users) &&
              users.map((u, idx) => (
                <FadeInView key={u._id} delay={Math.min(idx * 40, 300)}>
                  <View style={styles.productRow}>
                    <View style={styles.avatarRow}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {(u.name || "?").charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.roleChip,
                          u.isAdmin && styles.roleChipAdmin,
                        ]}
                      >
                        <Text style={styles.roleChipText}>
                          {u.isAdmin ? "Administrator" : "Customer"}
                        </Text>
                      </View>
                    </View>
                    <InfoRow title="Name" value={u.name} styles={styles} />
                    <InfoRow title="Email" value={u.email} styles={styles} />
                    <InfoRow
                      title="Orders"
                      value={u.orderCount || 0}
                      styles={styles}
                    />
                    <InfoRow
                      title="Total Spent"
                      value={`$${u.totalSpent || 0}`}
                      styles={styles}
                    />
                    <InfoRow
                      title="Loyalty Points"
                      value={u.loyaltyPoints || 0}
                      styles={styles}
                    />
                    <InfoRow
                      title="Tier"
                      value={u.tier || "Bronze"}
                      styles={styles}
                    />

                    <View style={styles.actions}>
                      <TouchableOpacity onPress={() => editUser(u)}>
                        <Ionicons
                          name="create-outline"
                          size={22}
                          color={colors.ORANGE}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteUser(u._id)}>
                        <Ionicons
                          name="trash-outline"
                          size={22}
                          color="#FF5A5F"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {editingUserId === u._id && (
                    <FadeInView style={styles.card}>
                      <View style={styles.cardHeaderRow}>
                        <Ionicons
                          name="create"
                          size={18}
                          color={colors.ORANGE}
                        />
                        <Text style={styles.productName}>
                          EDITING: {u.name}
                        </Text>
                      </View>

                      <Text style={styles.fieldLabel}>Name</Text>
                      <TextInput
                        style={styles.input}
                        value={userName}
                        onChangeText={setUserName}
                        placeholderTextColor="#8A7A6F"
                      />

                      <Text style={styles.fieldLabel}>Email</Text>
                      <TextInput
                        style={styles.input}
                        value={userEmail}
                        onChangeText={setUserEmail}
                        placeholderTextColor="#8A7A6F"
                      />

                      <Text style={styles.fieldLabel}>Loyalty Points</Text>
                      <TextInput
                        style={styles.input}
                        value={userPoints}
                        onChangeText={setUserPoints}
                        keyboardType="numeric"
                        placeholderTextColor="#8A7A6F"
                      />

                      <Text style={styles.fieldLabel}>Tier</Text>
                      <TextInput
                        style={styles.input}
                        value={userTier}
                        onChangeText={setUserTier}
                        placeholderTextColor="#8A7A6F"
                      />

                      <Text style={styles.fieldLabel}>Role</Text>
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 8,
                          marginBottom: 15,
                        }}
                      >
                        {["client", "cashier", "admin"].map((r) => (
                          <PressScale
                            key={r}
                            style={[
                              styles.button,
                              { flex: 1, paddingVertical: 12 },
                              userRole === r ? {} : styles.cancelButton,
                            ]}
                            onPress={() => setUserRole(r)}
                          >
                            <Text style={styles.buttonText}>
                              {r.toUpperCase()}
                            </Text>
                          </PressScale>
                        ))}
                      </View>

                      <PressScale style={styles.button} onPress={saveUser}>
                        <Text style={styles.buttonText}>SAVE USER</Text>
                      </PressScale>
                      <PressScale
                        style={[styles.button, styles.cancelButton]}
                        onPress={() => setEditingUserId(null)}
                      >
                        <Text style={styles.buttonText}>CANCEL</Text>
                      </PressScale>
                    </FadeInView>
                  )}
                </FadeInView>
              ))}
          </FadeInView>
        )}
        {/* ================= COMPLAINTS ================= */}

        {section === "complaints" && (
          <FadeInView key="complaints-section">
            <Text style={styles.sectionTitle}>CUSTOMER COMPLAINTS</Text>

            {Array.isArray(threads) &&
              threads.map((t, idx) => (
                <FadeInView
                  key={t._id}
                  delay={Math.min(idx * 40, 300)}
                  style={styles.productRow}
                >
                  <View style={styles.cardHeaderRow}>
                    <Ionicons
                      name="person-circle-outline"
                      size={18}
                      color={colors.ORANGE}
                    />
                    <Text style={styles.productName}>
                      {t.user?.name || "Unknown"}
                    </Text>
                    <View
                      style={[
                        styles.statusChip,
                        t.status === "resolved" && styles.statusChipDone,
                      ]}
                    >
                      <Text style={styles.statusChipText}>
                        {t.status || "Open"}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.productCat}>
                    Email: {t.user?.email || "No email"}
                  </Text>

                  <View style={styles.messagesBox}>
                    {t.messages?.map((m: any, index: number) => (
                      <View
                        key={index}
                        style={[
                          styles.messageBubble,
                          m.sender === "admin"
                            ? styles.messageBubbleAdmin
                            : styles.messageBubbleCustomer,
                        ]}
                      >
                        <Text style={styles.messageSender}>
                          {m.sender === "admin" ? "Admin" : "Customer"}
                        </Text>
                        <Text style={styles.productCat}>{m.text}</Text>
                      </View>
                    ))}
                  </View>

                  <TextInput
                    placeholder="Reply..."
                    placeholderTextColor="#8A7A6F"
                    value={replyText[t._id] || ""}
                    onChangeText={(v) =>
                      setReplyText((prev) => ({
                        ...prev,
                        [t._id]: v,
                      }))
                    }
                    style={styles.input}
                  />

                  <PressScale
                    style={styles.button}
                    onPress={() => reply(t._id)}
                  >
                    <Text style={styles.buttonText}>SEND REPLY</Text>
                  </PressScale>
                </FadeInView>
              ))}
          </FadeInView>
        )}

        {/* ================= TABLES ================= */}

        {section === "tables" && (
          <FadeInView key="tables-section">
            <Text style={styles.sectionTitle}>TABLE MANAGEMENT</Text>

            <View style={styles.card}>
              <Text style={styles.fieldLabel}>Table Number</Text>
              <TextInput
                placeholder="Table Number"
                placeholderTextColor="#8A7A6F"
                value={tableNumber}
                onChangeText={setTableNumber}
                style={styles.input}
              />

              <PressScale style={styles.button} onPress={addTable}>
                <Text style={styles.buttonText}>ADD TABLE</Text>
              </PressScale>
            </View>

            {Array.isArray(tables) &&
              tables.map((t, idx) => (
                <FadeInView
                  key={t._id}
                  delay={Math.min(idx * 40, 300)}
                  style={styles.productRow}
                >
                  <View style={styles.cardHeaderRow}>
                    <Ionicons name="grid" size={18} color={colors.ORANGE} />
                    <Text style={styles.productName}>
                      Table {t.tableNumber}
                    </Text>
                  </View>

                  <View style={styles.chipRow}>
                    <View
                      style={[
                        styles.statusChip,
                        !t.occupied && styles.statusChipDone,
                      ]}
                    >
                      <Text style={styles.statusChipText}>
                        {t.occupied ? "Occupied" : "Available"}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusChip,
                        t.active && styles.statusChipDone,
                      ]}
                    >
                      <Text style={styles.statusChipText}>
                        {t.active ? "Active" : "Hidden"}
                      </Text>
                    </View>
                  </View>

                  {t.qrCode && (
                    <View style={{ alignItems: "center", marginTop: 15 }}>
                      <Text style={styles.productCat}>QR Code</Text>

                      <Image
                        source={{
                          uri: t.qrCode,
                        }}
                        style={{
                          width: 160,
                          height: 160,
                          marginTop: 10,
                          borderRadius: 10,
                        }}
                      />
                    </View>
                  )}

                  <View style={styles.actions}>
                    <TouchableOpacity onPress={() => toggleActive(t)}>
                      <Ionicons
                        name={t.active ? "eye-outline" : "eye-off-outline"}
                        size={22}
                        color={colors.ORANGE}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => deleteTable(t._id)}>
                      <Ionicons
                        name="trash-outline"
                        size={22}
                        color="#FF5A5F"
                      />
                    </TouchableOpacity>
                  </View>
                </FadeInView>
              ))}
          </FadeInView>
        )}
        {/* ================= TOPPINGS ================= */}
        {section === "toppings" && (
          <FadeInView key="toppings-section">
            <Text style={styles.sectionTitle}>TOPPINGS MANAGEMENT</Text>

            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="add-circle" size={18} color={colors.ORANGE} />
                <Text style={styles.productName}>ADD NEW TOPPING</Text>
              </View>
              <Text style={styles.fieldLabel}>Name</Text>
              <TextInput
                placeholder="Topping Name"
                placeholderTextColor="#8A7A6F"
                value={editingToppingId ? "" : toppingName}
                onChangeText={setToppingName}
                style={styles.input}
                editable={!editingToppingId}
              />
              <Text style={styles.fieldLabel}>Price</Text>
              <TextInput
                placeholder="Price"
                placeholderTextColor="#8A7A6F"
                keyboardType="numeric"
                value={editingToppingId ? "" : toppingPrice}
                onChangeText={setToppingPrice}
                style={styles.input}
                editable={!editingToppingId}
              />
              <PressScale
                style={styles.button}
                onPress={saveTopping}
                disabled={!!editingToppingId}
              >
                <Text style={styles.buttonText}>ADD TOPPING</Text>
              </PressScale>
            </View>

            {Array.isArray(toppings) &&
              toppings.map((t, idx) => (
                <FadeInView key={t._id} delay={Math.min(idx * 40, 300)}>
                  <View style={styles.productRow}>
                    <InfoRow title="Topping" value={t.name} styles={styles} />
                    <InfoRow
                      title="Price"
                      value={`$${t.price}`}
                      styles={styles}
                    />
                    <View style={styles.actions}>
                      <TouchableOpacity
                        onPress={() =>
                          editingToppingId === t._id
                            ? setEditingToppingId(null)
                            : editTopping(t)
                        }
                      >
                        <Ionicons
                          name="create-outline"
                          size={22}
                          color={colors.ORANGE}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteTopping(t._id)}>
                        <Ionicons
                          name="trash-outline"
                          size={22}
                          color="#FF5A5F"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {editingToppingId === t._id && (
                    <FadeInView style={styles.card}>
                      <View style={styles.cardHeaderRow}>
                        <Ionicons
                          name="create"
                          size={18}
                          color={colors.ORANGE}
                        />
                        <Text style={styles.productName}>
                          EDITING: {t.name}
                        </Text>
                      </View>
                      <Text style={styles.fieldLabel}>Name</Text>
                      <TextInput
                        style={styles.input}
                        value={toppingName}
                        onChangeText={setToppingName}
                        placeholderTextColor="#8A7A6F"
                      />
                      <Text style={styles.fieldLabel}>Price</Text>
                      <TextInput
                        style={styles.input}
                        value={toppingPrice}
                        onChangeText={setToppingPrice}
                        keyboardType="numeric"
                        placeholderTextColor="#8A7A6F"
                      />
                      <PressScale style={styles.button} onPress={saveTopping}>
                        <Text style={styles.buttonText}>UPDATE TOPPING</Text>
                      </PressScale>
                      <PressScale
                        style={[styles.button, styles.cancelButton]}
                        onPress={() => setEditingToppingId(null)}
                      >
                        <Text style={styles.buttonText}>CANCEL</Text>
                      </PressScale>
                    </FadeInView>
                  )}
                </FadeInView>
              ))}
          </FadeInView>
        )}
        {/* ================= WHEEL ================= */}

        {section === "wheel" && (
          <FadeInView key="wheel-section">
            <Text style={styles.sectionTitle}>WHEEL PRIZES MANAGEMENT</Text>

            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="add-circle" size={18} color={colors.ORANGE} />
                <Text style={styles.productName}>ADD NEW PRIZE</Text>
              </View>
              <Text style={styles.fieldLabel}>Label</Text>
              <TextInput
                placeholder="Prize Label"
                placeholderTextColor="#8A7A6F"
                value={editingPrizeId ? "" : prizeLabel}
                onChangeText={setPrizeLabel}
                style={styles.input}
                editable={!editingPrizeId}
              />
              <Text style={styles.fieldLabel}>Type</Text>
              <TextInput
                placeholder="discount / freeItem / points / coupon"
                placeholderTextColor="#8A7A6F"
                value={editingPrizeId ? "" : prizeType}
                onChangeText={setPrizeType}
                style={styles.input}
                editable={!editingPrizeId}
              />
              <Text style={styles.fieldLabel}>Value</Text>
              <TextInput
                placeholder="Prize Value"
                placeholderTextColor="#8A7A6F"
                value={editingPrizeId ? "" : prizeValue}
                onChangeText={setPrizeValue}
                style={styles.input}
                editable={!editingPrizeId}
              />
              <Text style={styles.fieldLabel}>Weight</Text>
              <TextInput
                placeholder="Weight"
                placeholderTextColor="#8A7A6F"
                keyboardType="numeric"
                value={editingPrizeId ? "" : prizeWeight}
                onChangeText={setPrizeWeight}
                style={styles.input}
                editable={!editingPrizeId}
              />
              <PressScale
                style={styles.button}
                onPress={savePrize}
                disabled={!!editingPrizeId}
              >
                <Text style={styles.buttonText}>ADD PRIZE</Text>
              </PressScale>
            </View>

            {Array.isArray(prizes) &&
              prizes.map((p, idx) => (
                <FadeInView key={p._id} delay={Math.min(idx * 40, 300)}>
                  <View style={styles.productRow}>
                    <InfoRow title="Prize" value={p.label} styles={styles} />
                    <InfoRow title="Type" value={p.type} styles={styles} />
                    <InfoRow title="Value" value={p.value} styles={styles} />
                    <InfoRow title="Weight" value={p.weight} styles={styles} />
                    <View style={styles.actions}>
                      <TouchableOpacity
                        onPress={() =>
                          editingPrizeId === p._id
                            ? setEditingPrizeId(null)
                            : editPrize(p)
                        }
                      >
                        <Ionicons
                          name="create-outline"
                          size={22}
                          color={colors.ORANGE}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deletePrize(p._id)}>
                        <Ionicons
                          name="trash-outline"
                          size={22}
                          color="#FF5A5F"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {editingPrizeId === p._id && (
                    <FadeInView style={styles.card}>
                      <View style={styles.cardHeaderRow}>
                        <Ionicons
                          name="create"
                          size={18}
                          color={colors.ORANGE}
                        />
                        <Text style={styles.productName}>
                          EDITING: {p.label}
                        </Text>
                      </View>
                      <Text style={styles.fieldLabel}>Label</Text>
                      <TextInput
                        style={styles.input}
                        value={prizeLabel}
                        onChangeText={setPrizeLabel}
                        placeholderTextColor="#8A7A6F"
                      />
                      <Text style={styles.fieldLabel}>Type</Text>
                      <TextInput
                        style={styles.input}
                        value={prizeType}
                        onChangeText={setPrizeType}
                        placeholderTextColor="#8A7A6F"
                      />
                      <Text style={styles.fieldLabel}>Value</Text>
                      <TextInput
                        style={styles.input}
                        value={prizeValue}
                        onChangeText={setPrizeValue}
                        placeholderTextColor="#8A7A6F"
                      />
                      <Text style={styles.fieldLabel}>Weight</Text>
                      <TextInput
                        style={styles.input}
                        value={prizeWeight}
                        onChangeText={setPrizeWeight}
                        keyboardType="numeric"
                        placeholderTextColor="#8A7A6F"
                      />
                      <PressScale style={styles.button} onPress={savePrize}>
                        <Text style={styles.buttonText}>UPDATE PRIZE</Text>
                      </PressScale>
                      <PressScale
                        style={[styles.button, styles.cancelButton]}
                        onPress={() => setEditingPrizeId(null)}
                      >
                        <Text style={styles.buttonText}>CANCEL</Text>
                      </PressScale>
                    </FadeInView>
                  )}
                </FadeInView>
              ))}
          </FadeInView>
        )}
      </ScrollView>
    </View>
  );
  function InfoRow({ title, value, styles }: any) {
    return (
      <View style={{ marginBottom: 8 }}>
        <Text style={styles.infoTitle}>{title}</Text>

        <Text style={styles.productCat}>{value}</Text>
      </View>
    );
  }
}
function makeStyles(colors: any) {
  return StyleSheet.create({
    infoTitle: {
      color: colors.ORANGE,
      fontSize: 12,
      fontWeight: "900",
      textTransform: "uppercase",
    },
    fieldLabel: {
      color: colors.ORANGE,
      fontSize: 11,
      fontWeight: "900",
      textTransform: "uppercase",
      marginBottom: 4,
      marginTop: 6,
    },
    container: {
      flex: 1,
      backgroundColor: "transparent",
      padding: 20,
      paddingTop: 60,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 24,
    },
    eyebrow: {
      color: colors.ORANGE,
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 1.5,
      marginBottom: 4,
    },
    headerBadge: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.CARD,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "rgba(240,146,64,0.25)",
    },
    sectionTitle: {
      color: colors.ORANGE,
      fontSize: 15,
      fontWeight: "900",
      marginBottom: 15,
      letterSpacing: 1,
    },
    title: {
      color: colors.CREAM,
      fontSize: 26,
      fontWeight: "900",
      letterSpacing: 0.3,
    },
    adminButton: {
      marginBottom: 15,
    },
    tabs: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 24,
    },

    tabButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.CARD,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.06)",
    },

    activeTab: {
      backgroundColor: colors.ORANGE,
      borderColor: colors.ORANGE,
      shadowColor: colors.ORANGE,
      shadowOpacity: 0.4,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 5,
    },

    tabText: {
      color: colors.LIGHT,
      fontWeight: "800",
      fontSize: 11,
      letterSpacing: 0.5,
    },

    buttonText: {
      color: colors.BG,
      fontWeight: "900",
      letterSpacing: 0.3,
    },

    cardHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 10,
    },

    card: {
      backgroundColor: colors.CARD,
      padding: 20,
      borderRadius: 22,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
      shadowColor: "#000",
      shadowOpacity: 0.25,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },

    input: {
      backgroundColor: "#2E201A",
      color: colors.CREAM,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.04)",
    },

    button: {
      backgroundColor: colors.ORANGE,
      padding: 15,
      borderRadius: 16,
      alignItems: "center",
      shadowColor: colors.ORANGE,
      shadowOpacity: 0.35,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },

    cancelButton: {
      backgroundColor: "#2E201A",
      marginTop: 10,
      shadowOpacity: 0,
      elevation: 0,
    },

    productRow: {
      backgroundColor: colors.CARD,
      padding: 16,
      borderRadius: 20,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
      shadowColor: "#000",
      shadowOpacity: 0.18,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },

    thumb: {
      width: "100%",
      height: 150,
      borderRadius: 16,
      marginBottom: 12,
    },

    thumbPlaceholder: {
      backgroundColor: "#2E201A",
      alignItems: "center",
      justifyContent: "center",
    },

    productName: {
      color: colors.CREAM,
      fontWeight: "800",
    },

    productCat: {
      color: colors.LIGHT,
      marginTop: 5,
    },

    actions: {
      flexDirection: "row",
      gap: 18,
      marginTop: 12,
      justifyContent: "flex-end",
    },
    statsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
    statBox: {
      flex: 1,
      backgroundColor: colors.CARD,
      borderRadius: 20,
      padding: 16,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
      shadowColor: "#000",
      shadowOpacity: 0.18,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    statIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(240,146,64,0.12)",
      alignItems: "center",
      justifyContent: "center",
    },
    statValue: {
      color: colors.CREAM,
      fontSize: 18,
      fontWeight: "900",
      marginTop: 8,
    },
    statLabel: { color: colors.LIGHT, fontSize: 11, marginTop: 2 },
    imageBtn: {
      height: 130,
      backgroundColor: "#2E201A",
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: "rgba(255,255,255,0.12)",
      overflow: "hidden",
    },

    imageBtnText: {
      color: colors.LIGHT,
      marginTop: 6,
      fontSize: 12,
    },

    previewImage: {
      width: "100%",
      height: "100%",
      borderRadius: 16,
    },

    avatarRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(240,146,64,0.15)",
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      color: colors.ORANGE,
      fontWeight: "900",
      fontSize: 16,
    },
    roleChip: {
      backgroundColor: "#2E201A",
      paddingVertical: 5,
      paddingHorizontal: 12,
      borderRadius: 20,
    },
    roleChipAdmin: {
      backgroundColor: "rgba(240,146,64,0.18)",
    },
    roleChipText: {
      color: colors.LIGHT,
      fontSize: 10,
      fontWeight: "800",
      textTransform: "uppercase",
    },

    statusChip: {
      backgroundColor: "#2E201A",
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 20,
      marginLeft: "auto",
    },
    statusChipDone: {
      backgroundColor: "rgba(80,200,120,0.18)",
    },
    statusChipText: {
      color: colors.LIGHT,
      fontSize: 10,
      fontWeight: "800",
      textTransform: "capitalize",
    },
    chipRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 6,
    },

    messagesBox: {
      marginTop: 8,
      marginBottom: 10,
      gap: 8,
    },
    messageBubble: {
      padding: 10,
      borderRadius: 14,
    },
    messageBubbleAdmin: {
      backgroundColor: "rgba(240,146,64,0.12)",
    },
    messageBubbleCustomer: {
      backgroundColor: "#2E201A",
    },
    messageSender: {
      color: colors.ORANGE,
      fontSize: 10,
      fontWeight: "900",
      textTransform: "uppercase",
      marginBottom: 2,
    },
  });
}
