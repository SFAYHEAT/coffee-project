// app/cashier/stats.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Print from "expo-print";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Easing,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import FloatingBeans from "../../components/FloatingBeans";
import { useTheme } from "../../context/ThemeContext";
import { BASE_URL } from "../../services/api";

const { width: W } = Dimensions.get("window");

function AnimatedCounter({ value, style, prefix = "$" }: any) {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const id = anim.addListener(({ value: v }) => setDisplay(v));
    Animated.timing(anim, {
      toValue: value,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => anim.removeListener(id);
  }, [value]);
  return (
    <Text style={style}>
      {prefix}
      {display.toFixed(2)}
    </Text>
  );
}

function Bar({ label, value, max, colors }: any) {
  const anim = useRef(new Animated.Value(0)).current;
  const pct = max > 0 ? value / max : 0;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: pct,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pct]);

  return (
    <View style={{ marginBottom: 12 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <Text style={{ color: colors.CREAM, fontSize: 12, fontWeight: "700" }}>
          {label}
        </Text>
        <Text style={{ color: colors.ORANGE, fontSize: 12, fontWeight: "800" }}>
          ${value.toFixed(2)}
        </Text>
      </View>
      <View
        style={{
          height: 8,
          borderRadius: 4,
          backgroundColor: "rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}
      >
        <Animated.View
          style={{
            height: "100%",
            borderRadius: 4,
            backgroundColor: colors.ORANGE,
            width: anim.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
          }}
        />
      </View>
    </View>
  );
}

export default function CashierStats() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/cashier/stats?date=${date}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (e) {
      console.log("stats fetch error", e);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // live tick
    return () => clearInterval(interval);
  }, [fetchStats]);

  const shiftDate = (days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().slice(0, 10));
    setLoading(true);
  };

  const exportPdf = async () => {
    setExporting(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/cashier/export?date=${date}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Export failed");

      const html = `
        <html>
        <head><style>
          body { font-family: -apple-system, sans-serif; padding: 24px; color: #2A160C; }
          h1 { color: #8B5E3C; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; text-align: left; }
          th { background: #F4E9DE; }
          .total { font-size: 18px; font-weight: 900; color: #8B5E3C; margin-top: 16px; }
        </style></head>
        <body>
          <h1>Coffee Corner — Daily Report</h1>
          <p>Date: ${data.date} · Generated: ${new Date(data.generatedAt).toLocaleString()}</p>
          <p class="total">Total Earned: $${data.totalEarned.toFixed(2)}</p>

          <h3>Orders (${data.orders.length})</h3>
          <table>
            <tr><th>Table</th><th>User</th><th>Status</th><th>Paid</th><th>Total</th><th>Time</th></tr>
            ${data.orders
              .map(
                (o: any) => `
              <tr>
                <td>${o.tableNumber}</td>
                <td>${o.user?.name ?? "-"}</td>
                <td>${o.status}</td>
                <td>${o.paid ? "Yes" : "No"}</td>
                <td>$${o.total.toFixed(2)}</td>
                <td>${new Date(o.createdAt).toLocaleTimeString()}</td>
              </tr>`,
              )
              .join("")}
          </table>

          <h3>Tables (${data.tables.length})</h3>
          <table>
            <tr><th>Table #</th><th>Occupied</th><th>Active</th></tr>
            ${data.tables
              .map(
                (t: any) => `
              <tr><td>${t.tableNumber}</td><td>${t.occupied ? "Yes" : "No"}</td><td>${t.active ? "Yes" : "No"}</td></tr>`,
              )
              .join("")}
          </table>

          <h3>Users (${data.users.length})</h3>
          <table>
            <tr><th>Name</th><th>Email</th><th>Loyalty</th><th>Tier</th></tr>
            ${data.users
              .map(
                (u: any) => `
              <tr><td>${u.name}</td><td>${u.email}</td><td>${u.loyaltyPoints}</td><td>${u.tier}</td></tr>`,
              )
              .join("")}
          </table>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: `Report ${data.date}`,
        });
      } else {
        Alert.alert("Saved", `PDF saved at ${uri}`);
      }
    } catch (e: any) {
      Alert.alert("Export failed", e.message);
    } finally {
      setExporting(false);
    }
  };

  const maxTable = stats?.byTable
    ? Math.max(...Object.values(stats.byTable).map(Number), 1)
    : 1;
  const maxHour = stats?.byHour ? Math.max(...stats.byHour, 1) : 1;

  return (
    <View style={styles.container}>
      <FloatingBeans color={colors.ORANGE} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.CREAM} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stats & Export</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.dateRow}>
        <TouchableOpacity onPress={() => shiftDate(-1)}>
          <Ionicons
            name="chevron-back-circle-outline"
            size={26}
            color={colors.ORANGE}
          />
        </TouchableOpacity>
        <Text style={styles.dateText}>{date}</Text>
        <TouchableOpacity onPress={() => shiftDate(1)}>
          <Ionicons
            name="chevron-forward-circle-outline"
            size={26}
            color={colors.ORANGE}
          />
        </TouchableOpacity>
      </View>

      {loading || !stats ? (
        <ActivityIndicator
          color={colors.ORANGE}
          size="large"
          style={{ marginTop: 40 }}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 60 }}
        >
          <Animated.View style={[styles.earnBox, { opacity: fade }]}>
            <Text style={styles.earnLabel}>Total Earned</Text>
            <AnimatedCounter
              value={stats.totalEarned}
              style={styles.earnValue}
            />
            <View style={styles.earnMetaRow}>
              <Text style={styles.earnMeta}>{stats.orderCount} orders</Text>
              <Text style={styles.earnMeta}>
                Avg ${stats.avgOrder.toFixed(2)}
              </Text>
            </View>
          </Animated.View>

          <Text style={styles.sectionTitle}>By Table</Text>
          <View style={styles.card}>
            {Object.keys(stats.byTable).length === 0 ? (
              <Text style={styles.emptyText}>No paid orders yet</Text>
            ) : (
              Object.entries(stats.byTable).map(([table, val]: any) => (
                <Bar
                  key={table}
                  label={`Table ${table}`}
                  value={val}
                  max={maxTable}
                  colors={colors}
                />
              ))
            )}
          </View>

          <Text style={styles.sectionTitle}>By Hour</Text>
          <View style={styles.card}>
            <View style={styles.hourChart}>
              {stats.byHour.map((v: number, h: number) => (
                <View key={h} style={styles.hourBarWrap}>
                  <View
                    style={[
                      styles.hourBar,
                      {
                        height: Math.max((v / maxHour) * 90, 2),
                        backgroundColor:
                          v > 0 ? colors.ORANGE : "rgba(255,255,255,0.06)",
                      },
                    ]}
                  />
                  {h % 4 === 0 && <Text style={styles.hourLabel}>{h}h</Text>}
                </View>
              ))}
            </View>
          </View>

          <Text style={styles.sectionTitle}>Last 7 Days</Text>
          <View style={styles.card}>
            {Object.entries(stats.byDay).length === 0 ? (
              <Text style={styles.emptyText}>No data</Text>
            ) : (
              Object.entries(stats.byDay).map(([d, val]: any) => (
                <View key={d} style={styles.dayRow}>
                  <Text style={styles.dayLabel}>{d}</Text>
                  <Text style={styles.dayValue}>${val.toFixed(2)}</Text>
                </View>
              ))
            )}
          </View>

          <TouchableOpacity
            style={styles.exportBtn}
            onPress={exportPdf}
            disabled={exporting}
          >
            {exporting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="download-outline" size={20} color="#fff" />
                <Text style={styles.exportBtnText}>Export Day as PDF</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
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
    dateRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
      marginBottom: 20,
    },
    dateText: { color: colors.CREAM, fontWeight: "900", fontSize: 15 },
    earnBox: {
      backgroundColor: colors.CARD,
      borderRadius: 26,
      padding: 26,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
      marginBottom: 22,
    },
    earnLabel: { color: colors.LIGHT, fontSize: 13, fontWeight: "700" },
    earnValue: {
      color: colors.ORANGE,
      fontSize: 40,
      fontWeight: "900",
      marginTop: 6,
    },
    earnMetaRow: { flexDirection: "row", gap: 16, marginTop: 8 },
    earnMeta: { color: colors.LIGHT, fontSize: 12, fontWeight: "700" },
    sectionTitle: {
      color: colors.CREAM,
      fontSize: 14,
      fontWeight: "900",
      marginBottom: 10,
    },
    card: {
      backgroundColor: colors.CARD,
      borderRadius: 20,
      padding: 16,
      marginBottom: 22,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
    },
    emptyText: { color: colors.LIGHT, fontSize: 12, textAlign: "center" },
    hourChart: {
      flexDirection: "row",
      alignItems: "flex-end",
      height: 110,
      justifyContent: "space-between",
    },
    hourBarWrap: { alignItems: "center", flex: 1 },
    hourBar: { width: 4, borderRadius: 2 },
    hourLabel: { color: colors.LIGHT, fontSize: 8, marginTop: 4 },
    dayRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255,255,255,0.05)",
    },
    dayLabel: { color: colors.LIGHT, fontSize: 12 },
    dayValue: { color: colors.ORANGE, fontWeight: "800", fontSize: 13 },
    exportBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      backgroundColor: colors.ORANGE,
      borderRadius: 20,
      paddingVertical: 16,
      shadowColor: colors.ORANGE,
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 6,
    },
    exportBtnText: { color: "#fff", fontWeight: "900", fontSize: 15 },
  });
