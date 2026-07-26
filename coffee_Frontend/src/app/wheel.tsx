import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { BASE_URL } from "../services/api";

export default function Wheel() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [canSpin, setCanSpin] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    const token = await AsyncStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/wheel/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setCanSpin(data.canSpin);
  };

  const spin = async () => {
    if (!canSpin || spinning) return;
    setSpinning(true);
    setResult(null);

    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/wheel/spin`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const spins = 5 + Math.random() * 2;
      Animated.timing(rotation, {
        toValue: spins,
        duration: 3000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setSpinning(false);
        setResult(data.prize);
        setCanSpin(false);
      });
    } catch (e: any) {
      setSpinning(false);
      Alert.alert("Can't spin", e.message || "Try again tomorrow");
    }
  };

  const spin_interp = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Coffee Fortune Wheel 🎡</Text>
      <Text style={styles.subtitle}>
        {canSpin
          ? "You have a free spin today!"
          : "Come back tomorrow for another spin"}
      </Text>

      <View style={styles.wheelWrap}>
        <Animated.View
          style={[styles.wheel, { transform: [{ rotate: spin_interp }] }]}
        >
          <Ionicons name="cafe" size={80} color={colors.ORANGE} />
        </Animated.View>
        <View style={styles.pointer} />
      </View>

      <TouchableOpacity
        style={[styles.spinBtn, (!canSpin || spinning) && { opacity: 0.5 }]}
        onPress={spin}
        disabled={!canSpin || spinning}
      >
        <Text style={styles.spinText}>
          {spinning ? "Spinning..." : "Spin the Wheel"}
        </Text>
      </TouchableOpacity>

      {result && (
        <View style={styles.resultCard}>
          <Ionicons name="gift" size={30} color={colors.ORANGE} />
          <Text style={styles.resultTitle}>You won: {result.label}!</Text>
          <Text style={styles.resultValue}>{result.value}</Text>
        </View>
      )}
    </View>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.BG,
      alignItems: "center",
      paddingTop: 80,
      paddingHorizontal: 20,
    },
    title: { color: colors.CREAM, fontSize: 26, fontWeight: "900" },
    subtitle: {
      color: colors.LIGHT,
      fontSize: 13,
      marginTop: 8,
      textAlign: "center",
    },
    wheelWrap: {
      marginTop: 50,
      alignItems: "center",
      justifyContent: "center",
    },
    wheel: {
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: colors.CARD,
      borderWidth: 6,
      borderColor: colors.ORANGE,
      alignItems: "center",
      justifyContent: "center",
    },
    pointer: {
      position: "absolute",
      top: -10,
      width: 0,
      height: 0,
      borderLeftWidth: 12,
      borderRightWidth: 12,
      borderBottomWidth: 20,
      borderLeftColor: "transparent",
      borderRightColor: "transparent",
      borderBottomColor: colors.ORANGE,
    },
    spinBtn: {
      marginTop: 50,
      backgroundColor: colors.ORANGE,
      paddingVertical: 16,
      paddingHorizontal: 40,
      borderRadius: 25,
    },
    spinText: { color: colors.BG, fontWeight: "900", fontSize: 15 },
    resultCard: {
      marginTop: 30,
      backgroundColor: colors.CARD,
      borderRadius: 25,
      padding: 25,
      alignItems: "center",
    },
    resultTitle: {
      color: colors.CREAM,
      fontWeight: "900",
      fontSize: 18,
      marginTop: 10,
    },
    resultValue: { color: colors.ORANGE, fontWeight: "800", marginTop: 5 },
  });
