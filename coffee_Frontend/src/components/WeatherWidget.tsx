import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

type WeatherState = {
  temp: number;
  code: number;
  isDay: boolean;
} | null;

// Open-Meteo — free, no API key required
async function fetchWeather(lat: number, lon: number) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`,
  );
  const data = await res.json();
  return {
    temp: Math.round(data.current_weather.temperature),
    code: data.current_weather.weathercode,
    isDay: data.current_weather.is_day === 1,
  };
}

function suggestion(w: WeatherState) {
  if (!w) return { icon: "cafe-outline", title: "", drink: "" };

  const isRainy = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95].includes(w.code);
  const isSnowy = [71, 73, 75, 77, 85, 86].includes(w.code);
  const isCloudy = [1, 2, 3, 45, 48].includes(w.code);

  if (isSnowy || w.temp <= 10) {
    return {
      icon: "snow-outline",
      title: "Chilly today",
      drink: "Warm Cappuccino Recommended",
    };
  }
  if (isRainy) {
    return {
      icon: "rainy-outline",
      title: "Rainy today",
      drink: "Warm Cappuccino Recommended",
    };
  }
  if (w.temp >= 24) {
    return {
      icon: "sunny-outline",
      title: "Perfect day for an Iced Latte",
      drink: "Try our Iced Caramel Macchiato",
    };
  }
  if (isCloudy) {
    return {
      icon: "partly-sunny-outline",
      title: "Mild & cloudy",
      drink: "A Flat White hits the spot",
    };
  }
  return {
    icon: "sunny-outline",
    title: "Great coffee weather",
    drink: "Try a Classic Espresso",
  };
}

export default function WeatherWidget({ colors }: { colors: any }) {
  const [weather, setWeather] = useState<WeatherState>(null);
  const [error, setError] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError(true);
          return;
        }
        const pos = await Location.getCurrentPositionAsync({});
        const w = await fetchWeather(pos.coords.latitude, pos.coords.longitude);
        setWeather(w);
      } catch (e) {
        setError(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (weather) {
      Animated.timing(fade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmer, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(shimmer, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [weather]);

  if (error || !weather) return null;

  const s = suggestion(weather);
  const styles = makeStyles(colors);

  return (
    <Animated.View style={[styles.wrap, { opacity: fade }]}>
      <Animated.View
        style={[
          styles.iconWrap,
          {
            shadowOpacity: shimmer.interpolate({
              inputRange: [0, 1],
              outputRange: [0.15, 0.4],
            }),
          },
        ]}
      >
        <Ionicons name={s.icon as any} size={26} color={colors.ORANGE} />
      </Animated.View>

      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={styles.temp}>{weather.temp}°C</Text>
        <Text style={styles.title}>{s.title}</Text>
        <Text style={styles.drink}>{s.drink}</Text>
      </View>
    </Animated.View>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    wrap: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.CARD,
      marginHorizontal: 22,
      marginTop: 16,
      borderRadius: 22,
      padding: 16,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
    },
    iconWrap: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "rgba(240,146,64,0.14)",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.ORANGE,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 0 },
    },
    temp: { color: colors.CREAM, fontSize: 20, fontWeight: "900" },
    title: {
      color: colors.CREAM,
      fontSize: 13,
      fontWeight: "700",
      marginTop: 2,
    },
    drink: {
      color: colors.ORANGE,
      fontSize: 12,
      fontWeight: "800",
      marginTop: 3,
    },
  });
