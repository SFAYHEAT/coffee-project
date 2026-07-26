import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";

import {
  Alert,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import FloatingBeans from "../components/FloatingBeans";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useTable } from "../context/TableContext";
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

export default function Settings() {
  const { user, updateUser } = useAuth();

  const { table, clearTable } = useTable();

  const { colors, isDark, toggleTheme } = useTheme();

  const styles = makeStyles(colors);

  const { lang, setLang, t } = useLanguage();

  const [name, setName] = useState(user?.name || "");

  const [email, setEmail] = useState(user?.email || "");

  const [currentPw, setCurrentPw] = useState("");

  const [newPw, setNewPw] = useState("");

  const [complaint, setComplaint] = useState("");

  const avatarScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.spring(avatarScale, { toValue: 1.06, useNativeDriver: true }),
        Animated.spring(avatarScale, { toValue: 1, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  const saveInfo = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/api/user/update-info`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          name,

          email,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      await updateUser({
        ...user,

        name,

        email,
      });

      Alert.alert(t("success"), "Profile info updated");
    } catch (e: any) {
      Alert.alert(t("error"), e.message || "Could not save");
    }
  };
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(t("permissionNeeded"), t("allowGallery"));

      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],

      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      try {
        const avatar = result.assets[0].uri;

        const token = await AsyncStorage.getItem("token");

        const res = await fetch(`${BASE_URL}/api/user/profile`, {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            avatar,
          }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        await updateUser(data.user);

        Alert.alert(t("success"), "Profile picture updated");
      } catch (error: any) {
        Alert.alert(t("error"), error.message || "Could not update avatar");
      }
    }
  };

  const changeTable = () => {
    Alert.alert(
      t("changeTable"),

      t("releaseTable"),

      [
        {
          text: t("cancel"),

          style: "cancel",
        },

        {
          text: t("change"),

          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");

              await fetch(`${BASE_URL}/api/tables/release`, {
                method: "POST",

                headers: {
                  "Content-Type": "application/json",

                  Authorization: `Bearer ${token}`,
                },
              });
            } catch (e) {
              console.log(e);
            }

            await clearTable();

            router.replace("/home");
          },
        },
      ],
    );
  };

  const changePassword = async () => {
    if (!currentPw || !newPw) {
      Alert.alert(t("missingFields"), t("enterPasswords"));

      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/api/user/change-password`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          currentPassword: currentPw,

          newPassword: newPw,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      Alert.alert(t("success"), t("passwordUpdated"));

      setCurrentPw("");

      setNewPw("");
    } catch (e: any) {
      Alert.alert(t("error"), e.message || t("couldNotUpdate"));
    }
  };
  return (
    <View style={{ flex: 1, backgroundColor: colors.BG }}>
      <FloatingBeans color={colors.ORANGE} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={22} color={colors.CREAM} />
          </TouchableOpacity>

          <Text style={styles.title}>{t("settings")}</Text>
        </View>

        {/* PROFILE IMAGE */}

        <AnimatedCard delay={0} style={styles.card}>
          <Text style={styles.label}>{t("profilePicture")}</Text>

          <TouchableOpacity style={styles.photoRow} onPress={pickImage}>
            <Animated.View style={{ transform: [{ scale: avatarScale }] }}>
              <Image
                source={
                  user?.avatar
                    ? { uri: user.avatar }
                    : require("../../assets/images/avatar.jpg")
                }
                style={styles.avatar}
              />
            </Animated.View>

            <Text style={styles.changeText}>{t("changePhoto")}</Text>
          </TouchableOpacity>
        </AnimatedCard>

        {/* NAME EMAIL */}

        <AnimatedCard delay={60} style={styles.card}>
          <Text style={styles.label}>Name</Text>

          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#8A7A6F"
          />

          <Text style={styles.label}>Email</Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#8A7A6F"
          />

          <TouchableOpacity style={styles.button} onPress={saveInfo}>
            <Text style={styles.buttonText}>Save Info</Text>
          </TouchableOpacity>
        </AnimatedCard>

        {/* LANGUAGE */}

        <AnimatedCard delay={120} style={styles.card}>
          <Text style={styles.label}>{t("language")}</Text>

          <View style={styles.languageRow}>
            {(["en", "fr"] as const).map((l) => (
              <TouchableOpacity
                key={l}
                style={[
                  styles.button,
                  {
                    flex: 1,
                    backgroundColor: lang === l ? colors.ORANGE : "#2E201A",
                  },
                ]}
                onPress={() => setLang(l)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    {
                      color: lang === l ? colors.BG : colors.CREAM,
                    },
                  ]}
                >
                  {l.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </AnimatedCard>

        {/* DARK MODE */}

        <AnimatedCard delay={180} style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>{t("darkMode")}</Text>

            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              thumbColor={colors.ORANGE}
            />
          </View>
        </AnimatedCard>

        {/* TABLE */}

        <AnimatedCard delay={240} style={styles.card}>
          <Text style={styles.label}>{t("table")}</Text>

          <Text style={styles.tableValue}>{table ?? t("noTable")}</Text>

          <TouchableOpacity style={styles.button} onPress={changeTable}>
            <Text style={styles.buttonText}>{t("changeTable")}</Text>
          </TouchableOpacity>
        </AnimatedCard>

        {/* PASSWORD */}

        <AnimatedCard delay={300} style={styles.card}>
          <Text style={styles.label}>{t("changePassword")}</Text>

          <TextInput
            placeholder={t("currentPassword")}
            placeholderTextColor="#8A7A6F"
            secureTextEntry
            value={currentPw}
            onChangeText={setCurrentPw}
            style={styles.input}
          />

          <TextInput
            placeholder={t("newPassword")}
            placeholderTextColor="#8A7A6F"
            secureTextEntry
            value={newPw}
            onChangeText={setNewPw}
            style={styles.input}
          />

          <TouchableOpacity style={styles.button} onPress={changePassword}>
            <Text style={styles.buttonText}>{t("updatePassword")}</Text>
          </TouchableOpacity>
        </AnimatedCard>
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,

      paddingTop: 60,

      paddingHorizontal: 20,
    },

    contentContainer: {
      paddingBottom: 80,
    },

    header: {
      flexDirection: "row",

      alignItems: "center",

      gap: 20,

      marginBottom: 30,
    },

    backBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.CARD,
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

    label: {
      color: colors.LIGHT,

      fontSize: 11,

      marginBottom: 12,

      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },

    rowBetween: {
      flexDirection: "row",

      justifyContent: "space-between",

      alignItems: "center",
    },

    photoRow: {
      flexDirection: "row",

      alignItems: "center",

      gap: 15,
    },

    avatar: {
      width: 60,

      height: 60,

      borderRadius: 30,

      borderWidth: 2,

      borderColor: colors.ORANGE,
    },

    changeText: {
      color: colors.ORANGE,

      fontWeight: "800",
    },

    tableValue: {
      color: colors.CREAM,

      fontSize: 16,

      fontWeight: "900",

      marginBottom: 15,
    },

    input: {
      backgroundColor: "#2E201A",

      height: 50,

      borderRadius: 15,

      paddingHorizontal: 15,

      color: colors.CREAM,

      marginBottom: 12,

      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
    },

    button: {
      height: 50,

      backgroundColor: colors.ORANGE,

      borderRadius: 18,

      alignItems: "center",

      justifyContent: "center",

      shadowColor: colors.ORANGE,
      shadowOpacity: 0.3,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },

    buttonText: {
      color: colors.BG,

      fontWeight: "900",

      fontSize: 14,
    },

    languageRow: {
      flexDirection: "row",

      gap: 10,
    },
  });
