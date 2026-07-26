import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, StyleSheet, View } from "react-native";

const { width, height } = Dimensions.get("window");

const BEANS = [
  { x: width * 0.1, size: 16, duration: 22000, delay: 0 },
  { x: width * 0.75, size: 22, duration: 28000, delay: 2000 },
  { x: width * 0.3, size: 14, duration: 25000, delay: 4000 },
  { x: width * 0.55, size: 18, duration: 30000, delay: 1000 },
  { x: width * 0.85, size: 12, duration: 24000, delay: 6000 },
  { x: width * 0.2, size: 20, duration: 27000, delay: 3000 },
];

function Bean({ x, size, duration, delay, color }: any) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [height + 40, -40],
  });

  const rotate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const opacity = anim.interpolate({
    inputRange: [0, 0.1, 0.9, 1],
    outputRange: [0, 0.05, 0.05, 0],
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x,
        transform: [{ translateY }, { rotate }],
        opacity,
      }}
    >
      <Ionicons name="cafe" size={size} color={color} />
    </Animated.View>
  );
}

// Pass the current accent color (colors.ORANGE) so beans match the season
export default function FloatingBeans({
  color = "#F09240",
}: {
  color?: string;
}) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {BEANS.map((b, i) => (
        <Bean key={i} {...b} color={color} />
      ))}
    </View>
  );
}
