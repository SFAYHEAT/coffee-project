import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

const PARTICLES = 12;

export default function CoffeeSteam() {
  const particles = useRef(
    Array.from({ length: PARTICLES }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      scale: new Animated.Value(0.5),
      rotate: new Animated.Value(0),
    })),
  ).current;

  useEffect(() => {
    particles.forEach((p, index) => {
      const animate = () => {
        p.opacity.setValue(0);
        p.translateY.setValue(0);
        p.translateX.setValue(0);
        p.scale.setValue(0.5);
        p.rotate.setValue(0);

        Animated.parallel([
          Animated.sequence([
            Animated.timing(p.opacity, {
              toValue: 0.35,
              duration: 700,
              useNativeDriver: true,
            }),

            Animated.timing(p.opacity, {
              toValue: 0,
              duration: 2500,
              useNativeDriver: true,
            }),
          ]),

          Animated.timing(p.translateY, {
            toValue: -110,
            duration: 3200,
            useNativeDriver: true,
          }),

          Animated.timing(p.translateX, {
            toValue: index % 2 === 0 ? 35 : -35,
            duration: 3200,
            useNativeDriver: true,
          }),

          Animated.timing(p.scale, {
            toValue: 1.8,
            duration: 3200,
            useNativeDriver: true,
          }),

          Animated.timing(p.rotate, {
            toValue: 1,
            duration: 3200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setTimeout(animate, index * 250);
        });
      };

      setTimeout(animate, index * 300);
    });
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p, index) => (
        <Animated.View
          key={index}
          style={[
            styles.smoke,
            {
              left: 35 + Math.random() * 50,

              opacity: p.opacity,

              transform: [
                {
                  translateY: p.translateY,
                },
                {
                  translateX: p.translateX,
                },
                {
                  scale: p.scale,
                },
                {
                  rotate: p.rotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "180deg"],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 30,
    left: 80,
    width: 120,
    height: 150,
    zIndex: 20,
  },

  smoke: {
    position: "absolute",

    bottom: 0,

    width: 35,
    height: 55,

    borderRadius: 50,

    backgroundColor: "rgba(255,255,255,0.18)",

    // fake blur effect
    shadowColor: "#fff",
    shadowOpacity: 0.6,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },
});
