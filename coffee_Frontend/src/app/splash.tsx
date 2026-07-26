import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import {
  Animated,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useEffect, useRef } from "react";

export default function Splash() {
  const fade = useRef(new Animated.Value(0)).current;

  const slide = useRef(new Animated.Value(60)).current;

  const scale = useRef(new Animated.Value(0.8)).current;

  const logoScale = useRef(new Animated.Value(1)).current;

  const buttonScale = useRef(new Animated.Value(1)).current;

  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),

      Animated.spring(slide, {
        toValue: 0,
        friction: 7,
        useNativeDriver: true,
      }),

      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.spring(logoScale, {
          toValue: 1.15,
          friction: 4,
          useNativeDriver: true,
        }),

        Animated.spring(logoScale, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(rotate, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),

        Animated.timing(rotate, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const pressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.94,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };
  return (
    <ImageBackground
      source={require("../../assets/images/beans-bg.jpg")}
      resizeMode="cover"
      style={styles.bg}
    >
      <View style={styles.darkOverlay} />

      <View style={styles.container}>
        <Animated.View
          style={[
            styles.content,

            {
              opacity: fade,

              transform: [
                {
                  translateY: slide,
                },

                {
                  scale,
                },
              ],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.logoBox,

              {
                transform: [
                  {
                    scale: logoScale,
                  },
                ],
              },
            ]}
          >
            <Text style={styles.logo}>☕</Text>
          </Animated.View>

          <Text style={styles.title}>COFFEE CORNER</Text>

          <Text style={styles.subtitle}>
            Amazing taste{"\n"}
            of coffee
          </Text>

          <Text style={styles.description}>
            Premium coffee experience{"\n"}
            crafted for every moment
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.buttonWrapper,

            {
              opacity: fade,

              transform: [
                {
                  scale: buttonScale,
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push("/(auth)/login")}
            onPressIn={pressIn}
            onPressOut={pressOut}
          >
            <LinearGradient
              colors={["#D4A373", "#8B5E3C"]}
              start={{
                x: 0,
                y: 0,
              }}
              end={{
                x: 1,
                y: 1,
              }}
              style={styles.button}
            >
              <Ionicons name="arrow-forward" size={22} color="white" />

              <Text style={styles.buttonText}>GET STARTED</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  bg: {
    flex: 1,

    backgroundColor: "#1A0D07",
  },

  darkOverlay: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor: "rgba(20,10,5,0.68)",
  },

  blurGlow: {
    position: "absolute",

    width: 350,

    height: 350,

    borderRadius: 175,

    backgroundColor: "rgba(212,163,115,0.18)",

    top: -120,

    right: -100,
  },

  container: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",

    paddingHorizontal: 25,
  },

  content: {
    alignItems: "center",

    marginTop: -50,
  },

  logoBox: {
    width: 125,

    height: 125,

    borderRadius: 65,

    backgroundColor: "rgba(255,255,255,0.16)",

    justifyContent: "center",

    alignItems: "center",

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.3)",

    shadowColor: "#000",

    shadowOpacity: 0.45,

    shadowRadius: 25,

    shadowOffset: {
      width: 0,
      height: 15,
    },

    elevation: 15,
  },

  logo: {
    fontSize: 70,
  },

  title: {
    marginTop: 25,

    fontSize: 34,

    fontWeight: "900",

    letterSpacing: 3,

    color: "#FFFFFF",

    textAlign: "center",
  },

  subtitle: {
    marginTop: 18,

    fontSize: 32,

    lineHeight: 38,

    fontWeight: "900",

    color: "#FFFFFF",

    textAlign: "center",
  },

  description: {
    marginTop: 18,

    fontSize: 15,

    lineHeight: 22,

    color: "#E8D9CC",

    textAlign: "center",

    fontWeight: "500",
  },

  buttonWrapper: {
    position: "absolute",

    bottom: 65,

    width: "100%",

    alignItems: "center",
  },

  button: {
    height: 62,

    width: 260,

    borderRadius: 25,

    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",

    gap: 12,

    shadowColor: "#D4A373",

    shadowOpacity: 0.55,

    shadowRadius: 18,

    shadowOffset: {
      width: 0,
      height: 10,
    },

    elevation: 12,
  },

  buttonText: {
    color: "#FFFFFF",

    fontSize: 16,

    fontWeight: "900",

    letterSpacing: 1.5,
  },
});
