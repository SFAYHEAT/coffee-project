import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
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
import { API_URL } from "../../services/api";

const ORANGE = "#FF8A3D";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);

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

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Allow gallery access to select profile picture",
      );

      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],

      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

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

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert("Missing information", "Please fill all fields");

      return;
    }

    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name,

          email,

          password,

          avatar,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      Alert.alert("Success", "Account created successfully!");

      router.replace("/(auth)/login");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Something went wrong");
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1447933601403-0c6688de566e",
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
            Create your account and start your coffee journey
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
            <TouchableOpacity onPress={pickAvatar} style={styles.avatarPicker}>
              {avatar ? (
                <Image
                  source={{ uri: avatar }}
                  contentFit="cover"
                  style={styles.avatar}
                />
              ) : (
                <Ionicons name="camera-outline" size={35} color="#C08A5A" />
              )}
            </TouchableOpacity>

            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={22} color="#C08A5A" />

              <TextInput
                placeholder="Full name"
                placeholderTextColor="#B8B8B8"
                style={styles.input}
                value={name}
                onChangeText={setName}
              />
            </View>

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
                onPress={handleSignup}
                onPressIn={pressIn}
                onPressOut={pressOut}
              >
                <LinearGradient
                  colors={["#C08A5A", "#7A4B28"]}
                  style={styles.button}
                >
                  <Ionicons name="person-add-outline" size={22} color="white" />

                  <Text style={styles.buttonText}>CREATE ACCOUNT</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.divider}>
              <View style={styles.line} />

              <Text style={styles.or}>OR</Text>

              <View style={styles.line} />
            </View>

            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.loginText}>
                Already have an account?
                <Text style={styles.loginBold}>Login</Text>
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
    backgroundColor: "rgba(20,10,5,.62)",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 25,
  },

  header: {
    alignItems: "center",
    marginBottom: 32,
  },

  logoCircle: {
    width: 95,
    height: 95,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,.18)",
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    fontSize: 48,
  },

  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 2,
    marginTop: 18,
  },

  subtitle: {
    fontSize: 14,
    color: "#EFE6DD",
    textAlign: "center",
    marginTop: 8,
  },

  cardWrapper: {
    borderRadius: 32,
    overflow: "hidden",
  },

  card: {
    padding: 25,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,.12)",
  },

  avatarPicker: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,.15)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 20,
  },

  avatar: {
    width: "100%",
    height: "100%",
  },

  inputContainer: {
    height: 58,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,.92)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    marginBottom: 16,
  },

  input: {
    flex: 1,
    height: "100%",
    marginLeft: 12,
    fontSize: 15,
    color: "#2A160C",
  },

  button: {
    height: 58,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 15,
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
    color: "#ddd",
    marginHorizontal: 12,
  },

  loginText: {
    textAlign: "center",
    color: "#F4E9DE",
  },

  loginBold: {
    fontWeight: "900",
    color: "#D8A46B",
  },
});
