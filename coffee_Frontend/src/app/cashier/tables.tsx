// app/cashier/tables.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import FloatingBeans from "../../components/FloatingBeans";
import { useTheme } from "../../context/ThemeContext";
import { BASE_URL } from "../../services/api";

function TableCard({ table, index, colors, styles, onPress }: any) {
  const anim = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      delay: index * 60,
      friction: 7,
      useNativeDriver: true,
    }).start();
    if (table.occupied) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, []);

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [{ scale: anim }],
        width: "47%",
      }}
    >
      <TouchableOpacity
        style={styles.tableCard}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <View style={styles.tableTop}>
          <Text style={styles.tableNum}>#{table.tableNumber}</Text>
          <Animated.View
            style={[
              styles.statusDot,
              {
                backgroundColor: table.occupied ? "#E8B84B" : "#4BE87E",
                transform: [{ scale: table.occupied ? pulse : 1 }],
              },
            ]}
          />
        </View>
        <Ionicons
          name="restaurant"
          size={30}
          color={table.occupied ? colors.ORANGE : "rgba(255,255,255,0.15)"}
          style={{ marginVertical: 10 }}
        />
        <Text style={styles.tableStatus}>
          {table.occupied ? "Occupied" : "Free"}
        </Text>
        {table.order && (
          <Text style={styles.tableOrderInfo}>
            {table.order.status} · ${table.order.total.toFixed(2)}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function CashierTables() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const fetchTables = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/cashier/tables`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setTables(data);
    } catch (e) {
      console.log("tables fetch error", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 10000);
    return () => clearInterval(interval);
  }, [fetchTables]);

  return (
    <View style={styles.container}>
      <FloatingBeans color={colors.ORANGE} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.CREAM} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tables</Text>
        <View style={{ width: 22 }} />
      </View>

      {loading ? (
        <ActivityIndicator
          color={colors.ORANGE}
          size="large"
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={tables}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchTables();
              }}
              tintColor={colors.ORANGE}
            />
          }
          renderItem={({ item, index }) => (
            <TableCard
              table={item}
              index={index}
              colors={colors}
              styles={styles}
              onPress={() => setSelected(item)}
            />
          )}
        />
      )}

      <Modal
        visible={!!selected}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Table #{selected?.tableNumber}
            </Text>
            {selected?.order ? (
              <>
                <Text style={styles.modalLine}>
                  Status: {selected.order.status}
                </Text>
                <Text style={styles.modalLine}>
                  Total: ${selected.order.total?.toFixed(2)}
                </Text>
                {selected.order.items?.map((i: any, idx: number) => (
                  <Text key={idx} style={styles.modalItem}>
                    {i.qty}x {i.name}
                  </Text>
                ))}
                <TouchableOpacity
                  style={styles.modalBtn}
                  onPress={() => {
                    setSelected(null);
                    router.push({
                      pathname: "/cashier/orders",
                      params: { orderId: selected.order._id },
                    } as any);
                  }}
                >
                  <Text style={styles.modalBtnText}>Manage Order</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.modalLine}>
                No active order — table is free
              </Text>
            )}
            <TouchableOpacity
              onPress={() => setSelected(null)}
              style={{ marginTop: 14 }}
            >
              <Text style={{ color: colors.LIGHT, textAlign: "center" }}>
                Close
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
      marginBottom: 20,
    },
    headerTitle: { fontSize: 18, fontWeight: "900", color: colors.CREAM },
    tableCard: {
      backgroundColor: colors.CARD,
      borderRadius: 22,
      padding: 18,
      marginBottom: 16,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
    },
    tableTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      alignItems: "center",
    },
    tableNum: { color: colors.CREAM, fontWeight: "900", fontSize: 16 },
    statusDot: { width: 10, height: 10, borderRadius: 5 },
    tableStatus: { color: colors.LIGHT, fontWeight: "700", fontSize: 12 },
    tableOrderInfo: {
      color: colors.ORANGE,
      fontWeight: "800",
      fontSize: 12,
      marginTop: 6,
    },
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
      fontSize: 18,
      marginBottom: 12,
    },
    modalLine: { color: colors.LIGHT, fontSize: 13, marginBottom: 6 },
    modalItem: { color: colors.CREAM, fontSize: 12, marginLeft: 8 },
    modalBtn: {
      backgroundColor: colors.ORANGE,
      borderRadius: 16,
      paddingVertical: 12,
      alignItems: "center",
      marginTop: 14,
    },
    modalBtnText: { color: "#fff", fontWeight: "900", fontSize: 14 },
  });
