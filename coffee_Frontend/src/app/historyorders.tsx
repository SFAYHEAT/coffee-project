// app/historyorders.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import FloatingBeans from "../components/FloatingBeans";
import { useTheme } from "../context/ThemeContext";
import { BASE_URL } from "../services/api";

const STATUS_COLORS: Record<string, string> = {
  pending: "#E8B84B",
  preparing: "#E8B84B",
  ready: "#4BA3E8",
  completed: "#4BE87E",
  cancelled: "#E85C5C",
};

function HistoryCard({ order, index, colors, styles }: any) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      delay: index * 70,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  const total =
    order.total ??
    order.items?.reduce((s: number, i: any) => s + i.price * i.qty, 0) ??
    0;
  const status = order.status ?? "completed";
  const date = order.createdAt ? new Date(order.createdAt) : null;
  const dateStr = date
    ? date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";
  const timeStr = date
    ? date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    : "";

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
                outputRange: [24, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() =>
          router.push({
            pathname: "/order",
            params: { id: order._id ?? order.id },
          })
        }
      >
        <View style={styles.cardTop}>
          <View>
            <Text style={styles.orderId}>
              #{(order._id ?? order.id)?.toString().slice(-6).toUpperCase()}
            </Text>
            <Text style={styles.dateText}>
              {dateStr} • {timeStr}
            </Text>
          </View>
          <View
            style={[
              styles.statusPill,
              { backgroundColor: `${STATUS_COLORS[status]}22` },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: STATUS_COLORS[status] },
              ]}
            />
            <Text style={[styles.statusText, { color: STATUS_COLORS[status] }]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardBottom}>
          <Text style={styles.itemsPreview} numberOfLines={1}>
            {order.items?.map((i: any) => `${i.qty}x ${i.name}`).join(", ")}
          </Text>
          <Text style={styles.totalText}>${Number(total).toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HistoryOrders() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "completed" | "cancelled">(
    "all",
  );
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/orders/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setOrders(Array.isArray(data) ? data : (data.orders ?? []));
    } catch (e) {
      console.log("history fetch error", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const filtered =
    filter === "all"
      ? orders
      : orders.filter((o) => (o.status ?? "completed") === filter);

  const FILTERS: { key: typeof filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <View style={styles.container}>
      <FloatingBeans color={colors.ORANGE} />

      <Animated.View style={[styles.header, { opacity: fade }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.CREAM} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
        <View style={{ width: 22 }} />
      </Animated.View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[
              styles.filterChip,
              filter === f.key && { backgroundColor: colors.ORANGE },
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: filter === f.key ? "#fff" : colors.LIGHT },
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centerAll}>
          <ActivityIndicator color={colors.ORANGE} size="large" />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centerAll}>
          <Ionicons name="receipt-outline" size={54} color={colors.ORANGE} />
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySub}>Your past orders will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, i) => (item._id ?? item.id ?? i).toString()}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.ORANGE}
            />
          }
          renderItem={({ item, index }) => (
            <HistoryCard
              order={item}
              index={index}
              colors={colors}
              styles={styles}
            />
          )}
        />
      )}
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
    centerAll: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    headerTitle: { fontSize: 18, fontWeight: "900", color: colors.CREAM },
    filterRow: { flexDirection: "row", gap: 10, marginBottom: 18 },
    filterChip: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 14,
      backgroundColor: colors.CARD,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
    },
    filterChipText: { fontWeight: "800", fontSize: 12 },
    emptyTitle: {
      color: colors.CREAM,
      fontSize: 18,
      fontWeight: "900",
      marginTop: 14,
    },
    emptySub: { color: colors.LIGHT, fontSize: 13, marginTop: 4 },
    card: {
      backgroundColor: colors.CARD,
      borderRadius: 20,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
    },
    cardTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    orderId: { color: colors.CREAM, fontWeight: "900", fontSize: 15 },
    dateText: { color: colors.LIGHT, fontSize: 12, marginTop: 3 },
    statusPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 12,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontWeight: "800", fontSize: 11 },
    divider: {
      height: 1,
      backgroundColor: "rgba(255,255,255,0.06)",
      marginVertical: 12,
    },
    cardBottom: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    itemsPreview: {
      color: colors.LIGHT,
      fontSize: 12,
      flex: 1,
      marginRight: 10,
    },
    totalText: { color: colors.ORANGE, fontWeight: "900", fontSize: 15 },
  });
