import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";

import { useEffect, useRef } from "react";

import {
  Alert,
  Animated,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import FloatingBeans from "../../components/FloatingBeans";
import { useAuth } from "../../context/AuthContext";
import { useTable } from "../../context/TableContext";
import { useTheme } from "../../context/ThemeContext";
import { BASE_URL } from "../../services/api";

function MenuRow({
  index,
  style,
  onPress,
  icon,
  text,
  textColor,
  colors,
}: any) {
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
      style={{
        opacity: anim,
        transform: [
          {
            translateX: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [30, 0],
            }),
          },
        ],
      }}
    >
      <TouchableOpacity style={style} onPress={onPress} activeOpacity={0.85}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            flex: 1,
          }}
        >
          <Ionicons
            name={icon}
            size={22}
            color={textColor === colors.BG ? colors.BG : colors.ORANGE}
          />
          <Text
            style={[
              { flex: 1, marginLeft: 3, fontSize: 15, fontWeight: "800" },
              { color: textColor },
            ]}
          >
            {text}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={textColor} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function Profile() {
  const { user, logout: authLogout } = useAuth();
  const isAdmin = !!user && (user as any).isAdmin;

  const { colors, isDark, toggleTheme } = useTheme();

  const { table, clearTable } = useTable();

  const styles = makeStyles(colors, isDark);

  const headerAnim = useRef(new Animated.Value(0)).current;

  const avatarScale = useRef(new Animated.Value(1)).current;
  const logoutScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.spring(avatarScale, {
          toValue: 1.05,
          useNativeDriver: true,
        }),

        Animated.spring(avatarScale, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const logoutPressIn = () =>
    Animated.spring(logoutScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  const logoutPressOut = () =>
    Animated.spring(logoutScale, { toValue: 1, useNativeDriver: true }).start();

  const logout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },

      {
        text: "Logout",

        onPress: async () => {
          await authLogout();

          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  let rowIndex = 0;

  return (
    <ImageBackground
      source={require("../../../assets/images/beans-bg.jpg")}
      style={styles.container}
      resizeMode="cover"
    >
      <View
        style={[
          styles.overlay,

          {
            backgroundColor: isDark
              ? "rgba(18,11,8,.78)"
              : "rgba(255,255,255,.65)",
          },
        ]}
      />

      <FloatingBeans color={colors.ORANGE} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            styles.profileCard,

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
          <BlurView
            intensity={35}
            tint={isDark ? "dark" : "light"}
            style={styles.blur}
          >
            <Animated.View
              style={[
                styles.avatarBorder,

                {
                  transform: [
                    {
                      scale: avatarScale,
                    },
                  ],
                },
              ]}
            >
              <Image
                source={
                  user?.avatar
                    ? {
                        uri: user.avatar,
                      }
                    : require("../../../assets/images/avatar.jpg")
                }
                style={styles.avatar}
              />
            </Animated.View>

            <Text style={styles.name}>{user?.name || "Coffee Lover"}</Text>

            <Text style={styles.email}>
              {user?.email || "welcome@coffee.com"}
            </Text>

            <View style={styles.badge}>
              <Ionicons name="cafe" size={15} color={colors.ORANGE} />

              <Text style={styles.badgeText}>Coffee Member</Text>
            </View>
          </BlurView>
        </Animated.View>

        <View style={styles.card}>
          {/* ADMIN */}
          {isAdmin && (
            <>
              <Text style={styles.sectionTitle}>Admin</Text>

              <MenuRow
                index={rowIndex++}
                style={styles.helpButton}
                onPress={() => router.push("/admin" as any)}
                icon="shield-checkmark-outline"
                text="Admin Dashboard"
                textColor={colors.CREAM}
                colors={colors}
              />
            </>
          )}

          {/* MY ORDERS */}
          <Text style={styles.sectionTitle}>My Orders</Text>

          <MenuRow
            index={rowIndex++}
            style={styles.helpButton}
            onPress={() => router.push("/order" as any)}
            icon="cafe-outline"
            text="Track Current Order"
            textColor={colors.CREAM}
            colors={colors}
          />

          <MenuRow
            index={rowIndex++}
            style={styles.helpButton}
            onPress={() => router.push("/historyorders" as any)}
            icon="time-outline"
            text="Order History"
            textColor={colors.CREAM}
            colors={colors}
          />

          {/* SETTINGS */}
          <Text style={styles.sectionTitle}>Settings</Text>

          <MenuRow
            index={rowIndex++}
            style={styles.helpButton}
            onPress={() => router.push("/settings" as any)}
            icon="settings-outline"
            text="Account settings"
            textColor={colors.CREAM}
            colors={colors}
          />

          {/* HELP */}
          {!isAdmin && (
            <>
              <Text style={styles.sectionTitle}>Help</Text>

              <MenuRow
                index={rowIndex++}
                style={styles.helpButton}
                onPress={() => router.push("/help" as any)}
                icon="help-circle-outline"
                text="Contact staff / Send complaint"
                textColor={colors.CREAM}
                colors={colors}
              />
            </>
          )}

          {/* LEAVE */}
          {table && (
            <>
              <Text style={styles.sectionTitle}>Leave</Text>

              <MenuRow
                index={rowIndex++}
                style={[
                  styles.helpButton,
                  {
                    marginTop: 12,
                    backgroundColor: colors.ORANGE,
                  },
                ]}
                onPress={async () => {
                  try {
                    const token = await AsyncStorage.getItem("token");

                    await fetch(`${BASE_URL}/api/tables/release`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                    });
                  } catch (e) {
                    console.log(e);
                  }

                  await clearTable();

                  router.push("/review");
                }}
                icon="exit-outline"
                text="I'm Done — Leave Table"
                textColor={colors.BG}
                colors={colors}
              />
            </>
          )}
        </View>
        {/* LOGOUT */}

        <Animated.View style={{ transform: [{ scale: logoutScale }] }}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={logout}
            onPressIn={logoutPressIn}
            onPressOut={logoutPressOut}
          >
            <Ionicons name="log-out-outline" size={22} color="#fff" />

            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </ImageBackground>
  );
}

const makeStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },

    overlay: {
      ...StyleSheet.absoluteFillObject,

      backgroundColor: "rgba(18,11,8,.78)",
    },

    content: {
      paddingBottom: 40,
    },

    sectionTitle: {
      color: colors.CREAM,
      fontSize: 16,
      fontWeight: "900",
      marginBottom: 15,
    },

    card: {
      marginHorizontal: 20,
      marginTop: 25,
      backgroundColor: colors.CARD,
      borderRadius: 30,
      padding: 20,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
    },

    helpButton: {
      height: 60,
      borderRadius: 20,
      backgroundColor: colors.BG,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 18,
      marginBottom: 15,
    },
    helpText: {
      flex: 1,
      marginLeft: 15,
      color: colors.CREAM,
      fontSize: 15,
      fontWeight: "800",
    },

    logoutButton: {
      marginHorizontal: 20,
      marginTop: 25,
      marginBottom: 60,
      height: 60,
      borderRadius: 25,
      backgroundColor: "#C1272D",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      shadowColor: "#C1272D",
      shadowOpacity: 0.35,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 5 },
      elevation: 6,
    },

    logoutText: {
      color: "#fff",
      fontWeight: "900",
      fontSize: 16,
    },
    profileCard: {
      marginTop: 65,

      marginHorizontal: 20,

      borderRadius: 35,

      overflow: "hidden",
    },

    blur: {
      paddingVertical: 35,

      alignItems: "center",
    },

    avatarBorder: {
      padding: 4,

      borderRadius: 60,

      borderWidth: 3,

      borderColor: colors.ORANGE,
    },

    avatar: {
      width: 100,

      height: 100,

      borderRadius: 50,
    },

    name: {
      marginTop: 18,
      fontSize: 25,
      fontWeight: "900",
      color: isDark ? "#FFFFFF" : "#000000",
    },

    email: {
      marginTop: 5,
      fontSize: 13,
      color: isDark ? "#D0D0D0" : "#555555",
    },

    badge: {
      marginTop: 18,

      backgroundColor: colors.CARD,

      paddingHorizontal: 18,

      paddingVertical: 8,

      borderRadius: 20,

      flexDirection: "row",

      alignItems: "center",

      gap: 8,
    },

    badgeText: {
      color: colors.CREAM,

      fontWeight: "800",

      fontSize: 12,
    },

    leftAction: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
    },
  });
