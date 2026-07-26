import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useEffect, useRef, useState } from "react";

import FloatingBeans from "../../components/FloatingBeans";
import { useAuth } from "../../context/AuthContext";

const ORANGE = "#FF8A3D";

export default function Login() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(50)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  const logoScale = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 800,
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
          toValue: 1.12,
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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(
        "Missing information",
        "Please enter your email and password",
      );

      return;
    }

    try {
      await login(email, password);

      const stored = await AsyncStorage.getItem("user");
      const parsed = stored ? JSON.parse(stored) : null;

      if (parsed?.role === "cashier" || parsed?.role === "admin") {
        router.replace("/cashier" as any);
      } else {
        router.replace("/(tabs)/home");
      }
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Invalid credentials");
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
        }}
        contentFit="cover"
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.overlay} />

      <FloatingBeans color={ORANGE} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.content}
      >
        <Animated.View
          style={[
            styles.header,

            {
              opacity: fade,
              transform: [{ translateY: slide }, { scale }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.logoCircle,
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
            Welcome back, let's brew something amazing
          </Text>
        </Animated.View>
        <Animated.View
          style={[
            styles.cardWrapper,
            {
              opacity: fade,
              transform: [
                {
                  translateY: slide,
                },
              ],
            },
          ]}
        >
          <BlurView intensity={55} tint="dark" style={styles.card}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={22} color="#C08A5A" />

              <TextInput
                placeholder="Email address"
                placeholderTextColor="#B8B8B8"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={22} color="#C08A5A" />

              <TextInput
                placeholder="Password"
                placeholderTextColor="#B8B8B8"
                style={styles.input}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/(auth)/forgot-password")}
            >
              <Text style={styles.forgot}>Forgot password?</Text>
            </TouchableOpacity>

            <Animated.View
              style={{
                transform: [
                  {
                    scale: buttonScale,
                  },
                ],
              }}
            >
              <TouchableOpacity
                onPress={handleLogin}
                onPressIn={pressIn}
                onPressOut={pressOut}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={["#C08A5A", "#7A4B28"]}
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
                  <Ionicons name="log-in-outline" size={22} color="white" />

                  <Text style={styles.buttonText}>LOGIN</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.divider}>
              <View style={styles.line} />

              <Text style={styles.or}>OR</Text>

              <View style={styles.line} />
            </View>

            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text style={styles.signup}>
                Don't have an account?
                <Text style={styles.signupBold}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A0D07",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor: "rgba(20,10,5,0.58)",
  },

  content: {
    flex: 1,

    justifyContent: "center",

    paddingHorizontal: 25,
  },

  header: {
    alignItems: "center",

    marginBottom: 35,
  },

  logoCircle: {
    width: 95,

    height: 95,

    borderRadius: 50,

    backgroundColor: "rgba(255,255,255,0.18)",

    justifyContent: "center",

    alignItems: "center",

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.35)",

    shadowColor: "#000",

    shadowOpacity: 0.35,

    shadowRadius: 20,

    shadowOffset: {
      width: 0,
      height: 10,
    },

    elevation: 10,
  },

  logo: {
    fontSize: 48,
  },

  title: {
    fontSize: 32,

    fontWeight: "900",

    color: "#FFFFFF",

    letterSpacing: 2,

    marginTop: 18,
  },

  subtitle: {
    fontSize: 14,

    color: "#EFE6DD",

    marginTop: 8,

    textAlign: "center",
  },

  cardWrapper: {
    borderRadius: 32,

    overflow: "hidden",

    shadowColor: "#000",

    shadowOpacity: 0.45,

    shadowRadius: 25,

    shadowOffset: {
      width: 0,
      height: 15,
    },

    elevation: 15,
  },

  card: {
    padding: 25,

    borderRadius: 32,

    backgroundColor: "rgba(255,255,255,0.12)",

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.22)",
  },

  inputContainer: {
    height: 58,

    borderRadius: 20,

    backgroundColor: "rgba(255,255,255,0.92)",

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 18,

    marginBottom: 16,

    shadowColor: "#000",

    shadowOpacity: 0.15,

    shadowRadius: 10,

    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 5,
  },

  input: {
    flex: 1,

    height: "100%",

    marginLeft: 12,

    fontSize: 15,

    color: "#2A160C",
  },

  forgot: {
    textAlign: "right",

    color: "#E6C39A",

    fontSize: 13,

    fontWeight: "700",

    marginBottom: 22,
  },

  button: {
    height: 58,

    borderRadius: 20,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: 10,

    shadowColor: "#C08A5A",

    shadowOpacity: 0.5,

    shadowRadius: 15,

    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 10,
  },

  buttonText: {
    color: "#FFFFFF",

    fontSize: 16,

    fontWeight: "900",

    letterSpacing: 1,
  },

  divider: {
    flexDirection: "row",

    alignItems: "center",

    marginVertical: 25,
  },

  line: {
    height: 1,

    backgroundColor: "rgba(255,255,255,.3)",

    flex: 1,
  },

  or: {
    color: "#DDD",

    fontSize: 12,

    marginHorizontal: 12,

    fontWeight: "700",
  },

  signup: {
    textAlign: "center",

    color: "#F4E9DE",

    fontSize: 14,
  },

  signupBold: {
    fontWeight: "900",

    color: "#D8A46B",
  },
});
