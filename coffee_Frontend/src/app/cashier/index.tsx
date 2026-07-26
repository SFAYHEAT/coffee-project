// app/cashier/index.tsx

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";

import {
    Animated,
    BackHandler,
    Easing,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import FloatingBeans from "../../components/FloatingBeans";
import { useTheme } from "../../context/ThemeContext";
import { BASE_URL } from "../../services/api";

function AnimatedCounter({ value, style }: { value: number; style?: any }) {
  const anim = useRef(new Animated.Value(0)).current;

  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const id = anim.addListener(({ value: v }) => {
      setDisplay(v);
    });

    Animated.timing(anim, {
      toValue: value,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    return () => anim.removeListener(id);
  }, [value]);

  return <Text style={style}>${display.toFixed(2)}</Text>;
}

function DashCard({ icon, label, sub, onPress, colors, styles, delay }: any) {
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
      style={{
        opacity: anim,

        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [24, 0],
            }),
          },
        ],
      }}
    >
      <TouchableOpacity
        style={styles.dashCard}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <View style={styles.dashIconBox}>
          <Ionicons name={icon} size={26} color={colors.ORANGE} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.dashCardTitle}>{label}</Text>

          <Text style={styles.dashCardSub}>{sub}</Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color={colors.LIGHT} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function CashierDashboard() {
  const { colors } = useTheme();

  const styles = makeStyles(colors);

  const [stats, setStats] = useState<any>(null);

  const [refreshing, setRefreshing] = useState(false);

  const [user, setUser] = useState<any>(null);

  const fade = useRef(new Animated.Value(0)).current;

  const pulse = useRef(new Animated.Value(1)).current;

  // BLOCK PHONE BACK BUTTON
  useEffect(() => {
    const backAction = () => {
      return true;
    };

    const handler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    return () => handler.remove();
  }, []);

  // LOAD USER
  useEffect(() => {
    const loadUser = async () => {
      const savedUser = await AsyncStorage.getItem("user");

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    };

    loadUser();
  }, []);
  // LOGOUT
  const logout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");

    router.replace("/login");
  };

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.15,
          duration: 900,
          useNativeDriver: true,
        }),

        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/api/cashier/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setStats(data);
      }
    } catch (e) {
      console.log("cashier stats error", e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    const interval = setInterval(fetchStats, 15000);

    return () => clearInterval(interval);
  }, [fetchStats]);

  return (
    <View style={styles.container}>
      <FloatingBeans color={colors.ORANGE} />

      <Animated.View
        style={[
          styles.header,
          {
            opacity: fade,
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Cashier Panel</Text>

          <Text style={styles.welcome}>
            Welcome {user?.name || "Cashier"} 👋
          </Text>
        </View>

        <Animated.View
          style={[
            styles.liveDot,

            {
              transform: [
                {
                  scale: pulse,
                },
              ],
            },
          ]}
        />

        {/* ONLY ADMIN CAN SEE HOME */}

        {user?.isAdmin === true && (
          <TouchableOpacity
            onPress={() => router.replace("/home")}
            style={styles.homeBtn}
          >
            <Ionicons name="home-outline" size={24} color={colors.ORANGE} />
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={24} color={colors.ORANGE} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 60,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);

              fetchStats();
            }}
            tintColor={colors.ORANGE}
          />
        }
      >
        <Animated.View
          style={[
            styles.earnBox,
            {
              opacity: fade,
            },
          ]}
        >
          <Text style={styles.earnLabel}>Earned Today</Text>

          <AnimatedCounter
            value={stats?.totalEarned ?? 0}
            style={styles.earnValue}
          />

          <Text style={styles.earnSub}>
            {stats?.orderCount ?? 0} orders paid
          </Text>
        </Animated.View>

        <View
          style={{
            marginTop: 24,
            paddingHorizontal: 20,
          }}
        >
          <DashCard
            icon="restaurant-outline"
            label="Tables"
            sub="View reserved tables & live orders"
            onPress={() => router.push("/cashier/tables" as any)}
            colors={colors}
            styles={styles}
            delay={0}
          />

          <DashCard
            icon="receipt-outline"
            label="Manage Orders"
            sub="Update status, table, mark paid"
            onPress={() => router.push("/cashier/orders" as any)}
            colors={colors}
            styles={styles}
            delay={80}
          />

          <DashCard
            icon="stats-chart-outline"
            label="Stats & Export"
            sub="Earnings breakdown, export PDF"
            onPress={() => router.push("/cashier/stats" as any)}
            colors={colors}
            styles={styles}
            delay={160}
          />
        </View>
      </ScrollView>
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
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      marginBottom: 20,
      gap: 12,
    },

    headerTitle: {
      fontSize: 22,
      fontWeight: "900",
      color: colors.CREAM,
    },

    welcome: {
      color: colors.LIGHT,
      fontSize: 13,
      marginTop: 3,
      fontWeight: "600",
    },

    liveDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: "#4BE87E",
    },

    // ONLY ADMIN HOME BUTTON
    homeBtn: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor: colors.CARD,
      justifyContent: "center",
      alignItems: "center",
    },

    logoutBtn: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor: colors.CARD,
      justifyContent: "center",
      alignItems: "center",
    },

    earnBox: {
      marginHorizontal: 20,
      backgroundColor: colors.CARD,
      borderRadius: 26,
      padding: 26,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
    },

    earnLabel: {
      color: colors.LIGHT,
      fontSize: 13,
      fontWeight: "700",
    },

    earnValue: {
      color: colors.ORANGE,
      fontSize: 42,
      fontWeight: "900",
      marginTop: 6,
    },

    earnSub: {
      color: colors.LIGHT,
      fontSize: 12,
      marginTop: 6,
    },

    dashCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      backgroundColor: colors.CARD,
      borderRadius: 20,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
    },

    dashIconBox: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: "rgba(255,255,255,0.06)",
      justifyContent: "center",
      alignItems: "center",
    },

    dashCardTitle: {
      color: colors.CREAM,
      fontWeight: "900",
      fontSize: 15,
    },

    dashCardSub: {
      color: colors.LIGHT,
      fontSize: 12,
      marginTop: 2,
    },
  });
