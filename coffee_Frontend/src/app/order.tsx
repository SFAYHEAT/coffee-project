// app/order.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Easing,
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

const STATUS_STEPS = ["pending", "preparing", "ready", "completed"];

const STATUS_META: Record<string, { label: string; icon: string }> = {
  pending: { label: "Order Received", icon: "receipt-outline" },
  preparing: { label: "Preparing", icon: "cafe-outline" },
  ready: { label: "Ready for Pickup", icon: "checkmark-done-outline" },
  completed: { label: "Completed", icon: "trophy-outline" },
  cancelled: { label: "Cancelled", icon: "close-circle-outline" },
};

function StatusTracker({ status, colors, styles }: any) {
  const idx = STATUS_STEPS.indexOf(status);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === "completed" || status === "cancelled") return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.25,
          duration: 700,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [status]);

  if (status === "cancelled") {
    return (
      <View style={styles.cancelledBox}>
        <Ionicons name="close-circle" size={22} color="#E85C5C" />
        <Text style={styles.cancelledText}>This order was cancelled</Text>
      </View>
    );
  }

  return (
    <View style={styles.tracker}>
      {STATUS_STEPS.map((step, i) => {
        const done = i <= idx;
        const active = i === idx;
        const meta = STATUS_META[step];
        return (
          <View key={step} style={styles.trackerStep}>
            <View style={styles.trackerRow}>
              <Animated.View
                style={[
                  styles.dot,
                  {
                    backgroundColor: done
                      ? colors.ORANGE
                      : "rgba(255,255,255,0.12)",
                    transform: [{ scale: active ? pulse : 1 }],
                  },
                ]}
              >
                <Ionicons
                  name={meta.icon as any}
                  size={16}
                  color={done ? "#fff" : "rgba(255,255,255,0.4)"}
                />
              </Animated.View>
              {i < STATUS_STEPS.length - 1 && (
                <View
                  style={[
                    styles.connector,
                    {
                      backgroundColor:
                        i < idx ? colors.ORANGE : "rgba(255,255,255,0.12)",
                    },
                  ]}
                />
              )}
            </View>
            <Text
              style={[
                styles.stepLabel,
                {
                  color: done ? colors.CREAM : colors.LIGHT,
                  fontWeight: active ? "900" : "600",
                },
              ]}
            >
              {meta.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default function OrderScreen() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const params = useLocalSearchParams();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchOrder = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const url = params?.id
        ? `${BASE_URL}/api/orders/${params.id}`
        : `${BASE_URL}/api/orders/active`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setOrder(data);
    } catch (e) {
      console.log("order fetch error", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [params?.id]);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 8000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrder();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerAll]}>
        <ActivityIndicator color={colors.ORANGE} size="large" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, styles.centerAll]}>
        <FloatingBeans color={colors.ORANGE} />
        <Ionicons name="cafe-outline" size={54} color={colors.ORANGE} />
        <Text style={styles.emptyTitle}>No active order</Text>
        <Text style={styles.emptySub}>Your live order will show up here</Text>
        <TouchableOpacity
          style={styles.emptyBtn}
          onPress={() => router.push("/historyorders")}
        >
          <Text style={styles.emptyBtnText}>View Order History</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  const total =
    order.total ??
    order.items?.reduce((s: number, i: any) => s + i.price * i.qty, 0);

  return (
    <View style={styles.container}>
      <FloatingBeans color={colors.ORANGE} />

      <Animated.View style={[styles.header, { opacity: fade }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.CREAM} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Order</Text>
        <TouchableOpacity onPress={() => router.push("/historyorders")}>
          <Ionicons name="time-outline" size={22} color={colors.CREAM} />
        </TouchableOpacity>
      </Animated.View>

      <FlatList
        data={order.items ?? []}
        keyExtractor={(item, i) => item.id?.toString() ?? i.toString()}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.ORANGE}
          />
        }
        ListHeaderComponent={
          <Animated.View style={{ opacity: fade }}>
            <View style={styles.orderMetaBox}>
              <View>
                <Text style={styles.orderIdLabel}>Order</Text>
                <Text style={styles.orderId}>
                  #{order._id?.slice(-6).toUpperCase() ?? order.id}
                </Text>
              </View>
              <View style={styles.tableBadge}>
                <Ionicons
                  name="restaurant-outline"
                  size={14}
                  color={colors.ORANGE}
                />
                <Text style={styles.tableBadgeText}>
                  Table {order.tableNumber ?? "-"}
                </Text>
              </View>
            </View>

            <StatusTracker
              status={order.status ?? "pending"}
              colors={colors}
              styles={styles}
            />

            <Text style={styles.sectionLabel}>Items</Text>
          </Animated.View>
        }
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <View style={styles.itemQtyBadge}>
              <Text style={styles.itemQtyText}>{item.qty}x</Text>
            </View>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>
              ${(item.price * item.qty).toFixed(2)}
            </Text>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.summaryValue}>${Number(total).toFixed(2)}</Text>
          </View>
        }
      />
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
    centerAll: { justifyContent: "center", alignItems: "center", gap: 8 },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    headerTitle: { fontSize: 18, fontWeight: "900", color: colors.CREAM },
    emptyTitle: {
      color: colors.CREAM,
      fontSize: 18,
      fontWeight: "900",
      marginTop: 14,
    },
    emptySub: {
      color: colors.LIGHT,
      fontSize: 13,
      marginTop: 4,
      marginBottom: 20,
    },
    emptyBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.ORANGE,
      paddingVertical: 14,
      paddingHorizontal: 22,
      borderRadius: 18,
    },
    emptyBtnText: { color: "#fff", fontWeight: "900", fontSize: 14 },
    orderMetaBox: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.CARD,
      borderRadius: 20,
      padding: 16,
      marginBottom: 22,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
    },
    orderIdLabel: { color: colors.LIGHT, fontSize: 11, fontWeight: "700" },
    orderId: {
      color: colors.CREAM,
      fontSize: 18,
      fontWeight: "900",
      marginTop: 2,
    },
    tableBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: "rgba(255,255,255,0.06)",
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 14,
    },
    tableBadgeText: { color: colors.CREAM, fontSize: 12, fontWeight: "700" },
    tracker: { marginBottom: 28, paddingHorizontal: 4 },
    trackerStep: { marginBottom: 2 },
    trackerRow: { flexDirection: "row", alignItems: "center" },
    dot: {
      width: 34,
      height: 34,
      borderRadius: 17,
      justifyContent: "center",
      alignItems: "center",
    },
    connector: { flex: 1, height: 3, marginHorizontal: 2, borderRadius: 2 },
    stepLabel: { fontSize: 12, marginTop: 6, marginBottom: 14, marginLeft: 4 },
    cancelledBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: "rgba(232,92,92,0.12)",
      padding: 16,
      borderRadius: 16,
      marginBottom: 22,
    },
    cancelledText: { color: "#E85C5C", fontWeight: "800", fontSize: 13 },
    sectionLabel: {
      color: colors.LIGHT,
      fontSize: 12,
      fontWeight: "800",
      marginBottom: 10,
      letterSpacing: 0.5,
    },
    itemRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.CARD,
      borderRadius: 16,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
    },
    itemQtyBadge: {
      backgroundColor: "rgba(255,255,255,0.08)",
      borderRadius: 10,
      paddingVertical: 4,
      paddingHorizontal: 8,
      marginRight: 12,
    },
    itemQtyText: { color: colors.ORANGE, fontWeight: "900", fontSize: 12 },
    itemName: { flex: 1, color: colors.CREAM, fontWeight: "700", fontSize: 14 },
    itemPrice: { color: colors.ORANGE, fontWeight: "800", fontSize: 13 },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.CARD,
      borderRadius: 18,
      padding: 18,
      marginTop: 8,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
    },
    summaryLabel: { color: colors.LIGHT, fontSize: 13, fontWeight: "700" },
    summaryValue: { color: colors.CREAM, fontWeight: "900", fontSize: 20 },
  });
