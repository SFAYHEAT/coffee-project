import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { BASE_URL } from "../services/api";

export default function Review() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [ratings, setRatings] = useState<any>({});
  const [comments, setComments] = useState<any>({});

  useEffect(() => {
    loadLastOrder();
  }, []);

  const loadLastOrder = async () => {
    const token = await AsyncStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/orders/last`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setLastOrder(await res.json());
  };

  const submit = async () => {
    const token = await AsyncStorage.getItem("token");
    try {
      for (const item of lastOrder.items) {
        if (!ratings[item.id]) continue;
        await fetch(`${BASE_URL}/api/reviews`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: item.productId || item.id,
            rating: ratings[item.id],
            comment: comments[item.id] || "",
          }),
        });
      }
      Alert.alert("Thanks!", "Your reviews were submitted");
      router.replace("/home");
    } catch (e) {
      Alert.alert("Error", "Could not submit reviews");
      router.replace("/home");
    }
  };

  if (!lastOrder) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No recent order to review</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/home")}
        >
          <Text style={styles.buttonText}>Back Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      <Text style={styles.title}>How was your visit?</Text>

      {lastOrder.items.map((item: any) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.itemName}>{item.name}</Text>
          <View style={{ flexDirection: "row", gap: 6, marginTop: 8 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity
                key={n}
                onPress={() => setRatings({ ...ratings, [item.id]: n })}
              >
                <Ionicons
                  name={n <= (ratings[item.id] || 0) ? "star" : "star-outline"}
                  size={24}
                  color={colors.ORANGE}
                />
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            placeholder="Optional comment..."
            placeholderTextColor="#8A7A6F"
            value={comments[item.id] || ""}
            onChangeText={(v) => setComments({ ...comments, [item.id]: v })}
            style={styles.input}
          />
        </View>
      ))}

      <TouchableOpacity style={styles.button} onPress={submit}>
        <Text style={styles.buttonText}>Submit Reviews</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.replace("/home")}>
        <Text style={styles.skip}>Skip</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.BG,
      padding: 20,
      paddingTop: 60,
    },
    title: {
      color: colors.CREAM,
      fontSize: 22,
      fontWeight: "900",
      marginBottom: 20,
    },
    card: {
      backgroundColor: colors.CARD,
      borderRadius: 20,
      padding: 16,
      marginBottom: 14,
    },
    itemName: { color: colors.CREAM, fontWeight: "800" },
    input: {
      backgroundColor: colors.BG,
      color: colors.CREAM,
      borderRadius: 12,
      padding: 10,
      marginTop: 10,
    },
    button: {
      backgroundColor: colors.ORANGE,
      borderRadius: 20,
      paddingVertical: 16,
      alignItems: "center",
      marginTop: 10,
    },
    buttonText: { color: colors.BG, fontWeight: "900" },
    skip: { color: colors.LIGHT, textAlign: "center", marginTop: 15 },
  });
