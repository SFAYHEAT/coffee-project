// app/cashier/orders.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import FloatingBeans from "../../components/FloatingBeans";
import { useTheme } from "../../context/ThemeContext";
import { BASE_URL } from "../../services/api";

const STATUS_FLOW = ["pending", "preparing", "ready", "completed"];
const STATUS_COLORS: Record<string, string> = {
  pending: "#E8B84B",
  preparing: "#E8B84B",
  ready: "#4BA3E8",
  completed: "#4BE87E",
  cancelled: "#E85C5C",
};

function OrderCard({
  order,
  index,
  colors,
  styles,
  onStatusChange,
  onOpenTableChange,
  onPay,
}: any) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      delay: index * 60,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  const status = order.status ?? "pending";
  const nextIdx = STATUS_FLOW.indexOf(status) + 1;
  const nextStatus = nextIdx < STATUS_FLOW.length ? STATUS_FLOW[nextIdx] : null;

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          },
        ],
      }}
    >
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View>
            <Text style={styles.tableTxt}>Table {order.tableNumber}</Text>
            <Text style={styles.userTxt}>{order.user?.name ?? "Guest"}</Text>
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

        <Text style={styles.itemsPreview} numberOfLines={2}>
          {order.items?.map((i: any) => `${i.qty}x ${i.name}`).join(", ")}
        </Text>

        <View style={styles.cardBottom}>
          <Text style={styles.totalText}>${order.total?.toFixed(2)}</Text>
          {order.paid && <Text style={styles.paidBadge}>PAID</Text>}
        </View>

        <View style={styles.actionsRow}>
          {status !== "completed" && status !== "cancelled" && nextStatus && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => onStatusChange(order._id, nextStatus)}
            >
              <Ionicons
                name="arrow-forward-circle-outline"
                size={16}
                color={colors.ORANGE}
              />
              <Text style={styles.actionText}>Mark {nextStatus}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onOpenTableChange(order)}
          >
            <Ionicons
              name="swap-horizontal-outline"
              size={16}
              color={colors.ORANGE}
            />
            <Text style={styles.actionText}>Change Table</Text>
          </TouchableOpacity>

          {!order.paid && status !== "cancelled" && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.ORANGE }]}
              onPress={() => onPay(order._id)}
            >
              <Ionicons name="cash-outline" size={16} color="#fff" />
              <Text style={[styles.actionText, { color: "#fff" }]}>Paid</Text>
            </TouchableOpacity>
          )}

          {status !== "completed" && status !== "cancelled" && (
            <TouchableOpacity
              style={styles.actionBtnDanger}
              onPress={() => onStatusChange(order._id, "cancelled")}
            >
              <Ionicons name="close-circle-outline" size={16} color="#E85C5C" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

export default function CashierOrders() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const params = useLocalSearchParams();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"active" | "all">("active");
  const [tableModal, setTableModal] = useState<any>(null);
  const [newTable, setNewTable] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const url =
        filter === "active"
          ? `${BASE_URL}/api/cashier/orders`
          : `${BASE_URL}/api/cashier/orders`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        const list =
          filter === "active"
            ? data.filter(
                (o: any) =>
                  o.status !== "completed" && o.status !== "cancelled",
              )
            : data;
        setOrders(list);
      }
    } catch (e) {
      console.log("cashier orders fetch error", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const patchOrder = async (id: string, path: string, body: any) => {
    const token = await AsyncStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/cashier/orders/${id}/${path}`, {
      method: path === "pay" ? "POST" : "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  };

  const onStatusChange = async (id: string, status: string) => {
    try {
      await patchOrder(id, "status", { status });
      fetchOrders();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const onPay = async (id: string) => {
    try {
      await patchOrder(id, "pay", null);
      fetchOrders();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const confirmTableChange = async () => {
    if (!newTable || !tableModal) return;
    try {
      await patchOrder(tableModal._id, "table", { tableNumber: newTable });
      setTableModal(null);
      setNewTable("");
      fetchOrders();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <View style={styles.container}>
      <FloatingBeans color={colors.ORANGE} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.CREAM} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Orders</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.filterRow}>
        {(["active", "all"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.filterChip,
              filter === f && { backgroundColor: colors.ORANGE },
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: filter === f ? "#fff" : colors.LIGHT },
              ]}
            >
              {f === "active" ? "Active" : "All"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator
          color={colors.ORANGE}
          size="large"
          style={{ marginTop: 40 }}
        />
      ) : orders.length === 0 ? (
        <View style={styles.centerAll}>
          <Ionicons name="receipt-outline" size={54} color={colors.ORANGE} />
          <Text style={styles.emptyTitle}>No orders</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchOrders();
              }}
              tintColor={colors.ORANGE}
            />
          }
          renderItem={({ item, index }) => (
            <OrderCard
              order={item}
              index={index}
              colors={colors}
              styles={styles}
              onStatusChange={onStatusChange}
              onOpenTableChange={setTableModal}
              onPay={onPay}
            />
          )}
        />
      )}

      <Modal
        visible={!!tableModal}
        transparent
        animationType="fade"
        onRequestClose={() => setTableModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Move Table {tableModal?.tableNumber}
            </Text>
            <TextInput
              placeholder="New table number"
              placeholderTextColor="#999"
              value={newTable}
              onChangeText={setNewTable}
              style={styles.modalInput}
              keyboardType="number-pad"
            />
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={confirmTableChange}
            >
              <Text style={styles.modalBtnText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTableModal(null)}
              style={{ marginTop: 12 }}
            >
              <Text style={{ color: colors.LIGHT, textAlign: "center" }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.BG, paddingTop: 55 },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    headerTitle: { fontSize: 18, fontWeight: "900", color: colors.CREAM },
    filterRow: {
      flexDirection: "row",
      gap: 10,
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    filterChip: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 14,
      backgroundColor: colors.CARD,
    },
    filterChipText: { fontWeight: "800", fontSize: 12 },
    centerAll: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
    },
    emptyTitle: { color: colors.CREAM, fontSize: 16, fontWeight: "900" },
    card: {
      backgroundColor: colors.CARD,
      borderRadius: 20,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
    },
    cardTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    tableTxt: { color: colors.CREAM, fontWeight: "900", fontSize: 15 },
    userTxt: { color: colors.LIGHT, fontSize: 12, marginTop: 2 },
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
    itemsPreview: { color: colors.LIGHT, fontSize: 12, marginTop: 10 },
    cardBottom: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginTop: 10,
    },
    totalText: { color: colors.ORANGE, fontWeight: "900", fontSize: 16 },
    paidBadge: { color: "#4BE87E", fontWeight: "900", fontSize: 11 },
    actionsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 12,
    },
    actionBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: "rgba(255,255,255,0.06)",
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 12,
    },
    actionBtnDanger: {
      backgroundColor: "rgba(232,92,92,0.12)",
      padding: 8,
      borderRadius: 12,
    },
    actionText: { color: colors.CREAM, fontWeight: "800", fontSize: 12 },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center",
      padding: 30,
    },
    modalCard: { backgroundColor: colors.CARD, borderRadius: 24, padding: 24 },
    modalTitle: {
      color: colors.CREAM,
      fontWeight: "900",
      fontSize: 17,
      marginBottom: 14,
    },
    modalInput: {
      backgroundColor: "rgba(255,255,255,0.9)",
      borderRadius: 14,
      paddingHorizontal: 14,
      height: 50,
      color: "#2A160C",
    },
    modalBtn: {
      backgroundColor: colors.ORANGE,
      borderRadius: 16,
      paddingVertical: 12,
      alignItems: "center",
      marginTop: 14,
    },
    modalBtnText: { color: "#fff", fontWeight: "900", fontSize: 14 },
  });
