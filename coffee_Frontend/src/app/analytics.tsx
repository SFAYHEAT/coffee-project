import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { BASE_URL } from "../services/api";

function StatCard({ icon, label, value, index, colors, styles }: any) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      delay: index * 100,
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
                outputRange: [30, 0],
              }),
            },
            {
              scale: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={22} color={colors.ORANGE} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </Animated.View>
  );
}

export default function Analytics() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const heroAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadStats();
    Animated.timing(heroAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadStats = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/analytics/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(await res.json());
    } catch (e) {
      console.log("ANALYTICS LOAD ERROR", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  if (!stats || stats.message) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={colors.CREAM} />
          </TouchableOpacity>
          <Text style={styles.title}>My Coffee Stats</Text>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="cafe-outline" size={60} color={colors.ORANGE} />
          <Text style={styles.emptyText}>
            No orders yet — place one to see your stats!
          </Text>
        </View>
      </View>
    );
  }

  const cards = [
    { icon: "cafe", label: "Total Coffees", value: stats.totalCoffees ?? 0 },
    {
      icon: "cash",
      label: "Total Spent",
      value: `$${(stats.totalSpent ?? 0).toFixed(2)}`,
    },
    {
      icon: "heart",
      label: "Favorite Drink",
      value: stats.favoriteDrink || "—",
    },
    {
      icon: "calendar",
      label: "Visits This Month",
      value: stats.visitsThisMonth ?? 0,
    },
    {
      icon: "sunny",
      label: "Most Visited Day",
      value: stats.mostVisitedDay || "—",
    },
    {
      icon: "restaurant",
      label: "Favorite Table",
      value: stats.favoriteTable || "—",
    },
    { icon: "receipt", label: "Total Orders", value: stats.totalOrders ?? 0 },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.CREAM} />
        </TouchableOpacity>
        <Text style={styles.title}>My Coffee Stats</Text>
      </View>

      <Animated.View
        style={[
          styles.hero,
          {
            opacity: heroAnim,
            transform: [
              {
                translateY: heroAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[colors.ORANGE, "#B96A2E"]}
          style={styles.heroGradient}
        >
          <Ionicons name="trophy" size={32} color="#fff" />
          <Text style={styles.heroValue}>
            ${(stats.totalSpent ?? 0).toFixed(2)}
          </Text>
          <Text style={styles.heroLabel}>Lifetime coffee investment ☕</Text>
        </LinearGradient>
      </Animated.View>

      <View style={styles.grid}>
        {cards.map((c, i) => (
          <StatCard
            key={c.label}
            icon={c.icon}
            label={c.label}
            value={c.value}
            index={i}
            colors={colors}
            styles={styles}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.BG,
      padding: 20,
      paddingTop: 55,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 15,
      marginBottom: 20,
    },
    title: { color: colors.CREAM, fontSize: 22, fontWeight: "900" },
    hero: { marginBottom: 20 },
    heroGradient: { borderRadius: 28, padding: 24, alignItems: "center" },
    heroValue: {
      color: "#fff",
      fontSize: 30,
      fontWeight: "900",
      marginTop: 10,
    },
    heroLabel: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 4 },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    card: {
      width: "48%",
      backgroundColor: colors.CARD,
      borderRadius: 25,
      padding: 20,
      marginBottom: 15,
      alignItems: "flex-start",
    },
    iconCircle: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.BG,
      alignItems: "center",
      justifyContent: "center",
    },
    value: {
      color: colors.CREAM,
      fontSize: 20,
      fontWeight: "900",
      marginTop: 12,
    },
    label: { color: colors.LIGHT, fontSize: 12, marginTop: 4 },
    emptyState: { alignItems: "center", marginTop: 80, gap: 15 },
    emptyText: {
      color: colors.LIGHT,
      fontSize: 14,
      textAlign: "center",
      paddingHorizontal: 40,
    },
  });
