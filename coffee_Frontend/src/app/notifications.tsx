import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import FloatingBeans from "../components/FloatingBeans";
import { useTheme } from "../context/ThemeContext";

const initialNotifications = [
  {
    id: "1",
    icon: "cafe-outline",
    title: "Coffee is ready ☕",
    message: "Your Caramel Latte is being prepared",
    time: "2 min ago",
    unread: true,
  },
  {
    id: "2",
    icon: "gift-outline",
    title: "Special Offer",
    message: "Buy one coffee and get another free",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: "3",
    icon: "star-outline",
    title: "Points Added",
    message: "You earned 25 loyalty points",
    time: "Yesterday",
    unread: false,
  },
  {
    id: "4",
    icon: "bicycle-outline",
    title: "Order Delivered",
    message: "Enjoy your coffee!",
    time: "Yesterday",
    unread: false,
  },
];

function NotificationCard({ item, index, colors, onDismiss }: any) {
  const fade = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(60)).current;
  const iconPulse = useRef(new Animated.Value(1)).current;
  const styles = makeStyles(colors);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 450,
        delay: index * 110,
        useNativeDriver: true,
      }),
      Animated.spring(translateX, {
        toValue: 0,
        delay: index * 110,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    if (item.unread) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(iconPulse, {
            toValue: 1.12,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(iconPulse, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, []);

  const dismiss = () => {
    Animated.timing(translateX, {
      toValue: 400,
      duration: 250,
      useNativeDriver: true,
    }).start(() => onDismiss(item.id));
    Animated.timing(fade, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[styles.card, { opacity: fade, transform: [{ translateX }] }]}
    >
      <Animated.View
        style={[
          styles.iconBox,
          item.unread && styles.iconBoxUnread,
          { transform: [{ scale: iconPulse }] },
        ]}
      >
        <Ionicons
          name={item.icon}
          size={22}
          color={item.unread ? colors.BG : colors.ORANGE}
        />
      </Animated.View>

      <View style={styles.textBox}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>

      <TouchableOpacity onPress={dismiss} hitSlop={10}>
        <Ionicons name="close" size={16} color={colors.LIGHT} />
      </TouchableOpacity>

      {item.unread && <View style={styles.dot} />}
    </Animated.View>
  );
}

export default function Notifications() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [notifications, setNotifications] = useState(initialNotifications);
  const headerAnim = useRef(new Animated.Value(0)).current;
  const bellShake = useRef(new Animated.Value(0)).current;

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    if (unreadCount > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bellShake, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(bellShake, {
            toValue: -1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(bellShake, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.delay(2500),
        ]),
      ).start();
    }
  }, []);

  const dismiss = (id: string) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));

  const rotate = bellShake.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-15deg", "15deg"],
  });

  return (
    <View style={styles.container}>
      <FloatingBeans color={colors.ORANGE} />

      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-30, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View>
          <Text style={styles.heading}>Notifications</Text>
          <Text style={styles.subHeading}>
            Stay updated with your coffee journey
          </Text>
        </View>

        <Animated.View style={{ transform: [{ rotate }] }}>
          <TouchableOpacity style={styles.bell}>
            <Ionicons name="notifications" size={22} color={colors.ORANGE} />
            {unreadCount > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {unreadCount > 0 && (
        <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead}>
          <Ionicons name="checkmark-done" size={14} color={colors.ORANGE} />
          <Text style={styles.markAllText}>Mark all as read</Text>
        </TouchableOpacity>
      )}

      {notifications.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons
            name="notifications-off-outline"
            size={48}
            color={colors.LIGHT}
          />
          <Text style={styles.emptyText}>You're all caught up</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <NotificationCard
              item={item}
              index={index}
              colors={colors}
              onDismiss={dismiss}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
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
      paddingTop: 60,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    heading: { color: colors.CREAM, fontSize: 26, fontWeight: "900" },
    subHeading: { color: colors.LIGHT, fontSize: 12, marginTop: 5 },
    bell: {
      width: 45,
      height: 45,
      borderRadius: 23,
      backgroundColor: colors.CARD,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 8,
    },
    bellBadge: {
      position: "absolute",
      top: -2,
      right: -2,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: "#FF5A5F",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colors.BG,
    },
    bellBadgeText: { color: "#fff", fontSize: 9, fontWeight: "900" },
    markAllBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      alignSelf: "flex-end",
      marginBottom: 16,
    },
    markAllText: { color: colors.ORANGE, fontSize: 12, fontWeight: "800" },
    card: {
      backgroundColor: colors.CARD,
      borderRadius: 24,
      padding: 16,
      marginBottom: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
      shadowColor: "#000",
      shadowOpacity: 0.35,
      shadowRadius: 15,
      shadowOffset: { width: 0, height: 8 },
      elevation: 10,
    },
    iconBox: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "#38271F",
      alignItems: "center",
      justifyContent: "center",
    },
    iconBoxUnread: { backgroundColor: colors.ORANGE },
    textBox: { flex: 1 },
    title: { color: colors.CREAM, fontSize: 15, fontWeight: "900" },
    message: {
      color: colors.LIGHT,
      fontSize: 12,
      marginTop: 5,
      lineHeight: 17,
    },
    time: {
      color: colors.ORANGE,
      fontSize: 11,
      fontWeight: "700",
      marginTop: 8,
    },
    dot: {
      width: 9,
      height: 9,
      borderRadius: 4.5,
      backgroundColor: colors.ORANGE,
      position: "absolute",
      right: 40,
      top: 16,
    },
    emptyWrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 14,
    },
    emptyText: { color: colors.LIGHT, fontSize: 14, fontWeight: "700" },
  });
