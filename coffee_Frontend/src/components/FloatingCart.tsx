import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity } from "react-native";

export default function FloatingCart({
  count,
  colors,
}: {
  count: number;
  colors: any;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const badgeScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (count > 0) {
      Animated.sequence([
        Animated.spring(badgeScale, { toValue: 1.3, useNativeDriver: true }),
        Animated.spring(badgeScale, { toValue: 1, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.timing(badgeScale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [count]);

  const press = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.9, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    router.push("/cart");
  };

  if (count === 0) return null;

  return (
    <TouchableOpacity style={styles.wrap} onPress={press} activeOpacity={0.9}>
      <Animated.View
        style={[
          styles.button,
          { backgroundColor: colors.ORANGE, transform: [{ scale }] },
        ]}
      >
        <Ionicons name="bag-outline" size={24} color={colors.BG} />
        <Animated.View
          style={[styles.badge, { transform: [{ scale: badgeScale }] }]}
        >
          <Text style={styles.badgeText}>{count}</Text>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    right: 22,
    bottom: 100,
    zIndex: 50,
  },
  button: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FF5A5F",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: "#120B08",
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "900" },
});
