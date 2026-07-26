import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import FloatingBeans from "../../components/FloatingBeans";

const BG = "#120B08";
const CARD = "#241713";
const INPUT = "#38271F";
const CREAM = "#F7EFE8";
const ORANGE = "#FF8A3D";
const MUTED = "#B9A89C";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const fade = useRef(new Animated.Value(0)).current;

  const slide = useRef(new Animated.Value(40)).current;

  const buttonScale = useRef(new Animated.Value(1)).current;

  const coffeeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,

        duration: 700,

        useNativeDriver: true,
      }),

      Animated.spring(slide, {
        toValue: 0,

        friction: 7,

        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(coffeeAnim, {
          toValue: 1,

          duration: 1200,

          useNativeDriver: true,
        }),

        Animated.timing(coffeeAnim, {
          toValue: 0,

          duration: 1200,

          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const submit = () => {
    if (!email) {
      Alert.alert("Email required", "Please enter your email");

      return;
    }

    Alert.alert(
      "Reset Email Sent",

      "Check your inbox for password recovery instructions",
    );
  };

  return (
    <View style={styles.container}>
      <FloatingBeans color={ORANGE} />

      <View style={styles.circle} />

      <Animated.View
        style={[
          styles.content,

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
        <Animated.View
          style={{
            transform: [
              {
                translateY: coffeeAnim.interpolate({
                  inputRange: [0, 1],

                  outputRange: [0, -10],
                }),
              },
            ],
          }}
        >
          <Ionicons name="cafe" size={65} color={ORANGE} />
        </Animated.View>

        <Text style={styles.title}>Forgot Password?</Text>

        <Text style={styles.subtitle}>
          Enter your email and we will send you a reset link
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Email Address</Text>

          <TextInput
            placeholder="example@email.com"
            placeholderTextColor={MUTED}
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

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
              style={styles.button}
              onPress={submit}
              onPressIn={() => {
                Animated.spring(buttonScale, {
                  toValue: 0.95,

                  useNativeDriver: true,
                }).start();
              }}
              onPressOut={() => {
                Animated.spring(buttonScale, {
                  toValue: 1,

                  friction: 5,

                  useNativeDriver: true,
                }).start();
              }}
            >
              <Text style={styles.buttonText}>Send Reset Link</Text>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    justifyContent: "center",
    paddingHorizontal: 25,
    overflow: "hidden",
  },

  circle: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: ORANGE,
    opacity: 0.08,
    top: -100,
    right: -100,
  },

  content: {
    alignItems: "center",
  },

  title: {
    color: CREAM,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 18,
    textAlign: "center",
    letterSpacing: 0.5,
  },

  subtitle: {
    color: MUTED,
    fontSize: 13,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
    paddingHorizontal: 20,
  },

  card: {
    width: "100%",
    backgroundColor: CARD,
    borderRadius: 32,
    padding: 24,
    marginTop: 35,

    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 12,
    },

    elevation: 15,
  },

  label: {
    color: CREAM,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 10,
  },

  input: {
    height: 55,
    backgroundColor: INPUT,
    borderRadius: 18,
    paddingHorizontal: 18,
    color: CREAM,
    fontSize: 14,
  },

  button: {
    height: 56,
    backgroundColor: ORANGE,
    borderRadius: 20,
    marginTop: 22,

    alignItems: "center",
    justifyContent: "center",

    shadowColor: ORANGE,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },

  buttonText: {
    color: BG,
    fontSize: 14,
    fontWeight: "900",
  },

  back: {
    color: ORANGE,
    textAlign: "center",
    marginTop: 22,
    fontWeight: "800",
    fontSize: 13,
  },
});
