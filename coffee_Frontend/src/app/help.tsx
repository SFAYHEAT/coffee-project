import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import FloatingBeans from "../components/FloatingBeans";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { BASE_URL } from "../services/api";

function AnimatedCard({ delay = 0, style, children }: any) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      delay,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export default function Help() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [thread, setThread] = useState<any>(null);
  const sendScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadThread();
  }, []);

  const loadThread = async () => {
    const token = await AsyncStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/reclamation/mine`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setThread(await res.json());
  };
  const styles = makeStyles(colors);

  const [complaint, setComplaint] = useState("");

  const STAFF_PHONE = "+216XXXXXXXX";
  const STAFF_EMAIL = "staff@coffeecorner.com";

  const pressIn = () =>
    Animated.spring(sendScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  const pressOut = () =>
    Animated.spring(sendScale, { toValue: 1, useNativeDriver: true }).start();

  const sendReclamation = async () => {
    if (!complaint.trim()) {
      Alert.alert(t("empty"), t("writeComplaint"));
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/api/reclamation`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          message: complaint,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      Alert.alert(t("sent"), t("complaintSent"));
      loadThread();
      setComplaint("");
    } catch (e: any) {
      Alert.alert(t("error"), e.message || t("couldNotSend"));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.BG }}>
      <FloatingBeans color={colors.ORANGE} />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 50,
        }}
      >
        <AnimatedCard delay={0}>
          <View style={styles.titleRow}>
            <View style={styles.titleIconWrap}>
              <Ionicons
                name="help-buoy-outline"
                size={20}
                color={colors.ORANGE}
              />
            </View>
            <Text style={styles.title}>Help & Support</Text>
          </View>
        </AnimatedCard>

        {/* STAFF CONTACT */}

        <AnimatedCard delay={80} style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="call-outline" size={16} color={colors.ORANGE} />
            <Text style={styles.label}>Staff Contact</Text>
          </View>

          <View style={styles.contactRow}>
            <Ionicons name="call" size={14} color={colors.LIGHT} />
            <Text style={styles.info}>{STAFF_PHONE}</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="mail" size={14} color={colors.LIGHT} />
            <Text style={styles.info}>{STAFF_EMAIL}</Text>
          </View>
        </AnimatedCard>

        {/* COMPLAINT */}

        <AnimatedCard delay={160} style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons
              name="chatbox-ellipses-outline"
              size={16}
              color={colors.ORANGE}
            />
            <Text style={styles.label}>Send Complaint</Text>
          </View>

          <TextInput
            placeholder="Describe your problem..."
            placeholderTextColor="#8A7A6F"
            value={complaint}
            onChangeText={setComplaint}
            multiline
            style={styles.input}
          />

          <Animated.View style={{ transform: [{ scale: sendScale }] }}>
            <TouchableOpacity
              style={styles.button}
              onPress={sendReclamation}
              onPressIn={pressIn}
              onPressOut={pressOut}
            >
              <Ionicons name="send" size={15} color={colors.BG} />
              <Text style={styles.buttonText}>Send To Staff</Text>
            </TouchableOpacity>
          </Animated.View>
        </AnimatedCard>

        {thread && (
          <AnimatedCard delay={240} style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Ionicons
                name="chatbubbles-outline"
                size={16}
                color={colors.ORANGE}
              />
              <Text style={styles.label}>Conversation</Text>
            </View>
            {thread.messages.map((m: any, i: number) => (
              <View
                key={i}
                style={[
                  styles.bubble,
                  m.sender === "admin" ? styles.bubbleAdmin : styles.bubbleUser,
                ]}
              >
                <Text style={styles.bubbleSender}>
                  {m.sender === "admin" ? "Staff" : "You"}
                </Text>
                <Text style={styles.bubbleText}>{m.text}</Text>
              </View>
            ))}
          </AnimatedCard>
        )}
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      paddingTop: 60,
    },

    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 25,
    },
    titleIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(240,146,64,0.14)",
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      color: colors.CREAM,
      fontSize: 26,
      fontWeight: "900",
    },

    card: {
      backgroundColor: colors.CARD,
      borderRadius: 26,
      padding: 22,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 5 },
      elevation: 3,
    },

    cardHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 14,
    },

    label: {
      color: colors.CREAM,
      fontWeight: "900",
      fontSize: 14,
    },

    contactRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 10,
    },

    info: {
      color: colors.CREAM,
      fontSize: 15,
      fontWeight: "700",
    },

    input: {
      backgroundColor: "#2E201A",
      color: colors.CREAM,
      borderRadius: 18,
      padding: 15,
      height: 120,
      textAlignVertical: "top",
      marginBottom: 15,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
    },

    button: {
      height: 50,
      backgroundColor: colors.ORANGE,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
      shadowColor: colors.ORANGE,
      shadowOpacity: 0.35,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },

    buttonText: {
      color: colors.BG,
      fontWeight: "900",
    },

    bubble: {
      padding: 12,
      borderRadius: 16,
      marginBottom: 8,
    },
    bubbleAdmin: { backgroundColor: "rgba(240,146,64,0.12)" },
    bubbleUser: { backgroundColor: "#2E201A" },
    bubbleSender: {
      color: colors.ORANGE,
      fontSize: 10,
      fontWeight: "900",
      textTransform: "uppercase",
      marginBottom: 3,
    },
    bubbleText: { color: colors.CREAM, fontSize: 13 },
  });
