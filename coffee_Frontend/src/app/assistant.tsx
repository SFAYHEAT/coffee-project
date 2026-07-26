import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { BASE_URL } from "../services/api";

export default function Assistant() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [messages, setMessages] = useState<any[]>([
    {
      id: "0",
      from: "bot",
      text: 'Hi! Ask me things like "I like sweet coffee" or "something under $5".',
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now().toString(), from: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/assistant/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text }),
      });
      const data = await res.json();

      const botMsg = {
        id: Date.now().toString() + "b",
        from: "bot",
        text: data.reply,
        suggestions: data.suggestions,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "e",
          from: "bot",
          text: "Something went wrong, try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.CREAM} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Coffee Assistant 🤖</Text>
        <View style={{ width: 22 }} />
      </View>

      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.from === "user" ? styles.userBubble : styles.botBubble,
            ]}
          >
            <Text
              style={item.from === "user" ? styles.userText : styles.botText}
            >
              {item.text}
            </Text>

            {item.suggestions?.map((s: any, index: number) => (
              <TouchableOpacity
                key={s._id || s.id || `${s.name}-${index}`}
                style={styles.suggestionRow}
                onPress={() => router.push(`/product/${s._id}`)}
              >
                {s.imageUrl && (
                  <Image
                    source={{ uri: `${BASE_URL}${s.imageUrl}` }}
                    style={styles.suggestionImg}
                  />
                )}

                <View>
                  <Text style={styles.suggestionName}>{s.name}</Text>

                  <Text style={styles.suggestionPrice}>
                    ${Number(s.price).toFixed(2)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />

      <View style={styles.inputBar}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask about coffee..."
          placeholderTextColor="#8A7A6F"
          style={styles.input}
          onSubmitEditing={send}
        />
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={send}
          disabled={loading}
        >
          <Ionicons name="send" size={18} color={colors.BG} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.BG },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 55,
      paddingHorizontal: 20,
      paddingBottom: 15,
    },
    headerTitle: { color: colors.CREAM, fontSize: 18, fontWeight: "900" },
    bubble: {
      maxWidth: "85%",
      borderRadius: 20,
      padding: 14,
      marginBottom: 12,
    },
    userBubble: { backgroundColor: colors.ORANGE, alignSelf: "flex-end" },
    botBubble: { backgroundColor: colors.CARD, alignSelf: "flex-start" },
    userText: { color: colors.BG, fontWeight: "700" },
    botText: { color: colors.CREAM },
    suggestionRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: colors.BG,
      borderRadius: 15,
      padding: 10,
      marginTop: 10,
    },
    suggestionImg: { width: 40, height: 40, borderRadius: 10 },
    suggestionName: { color: colors.CREAM, fontWeight: "800", fontSize: 13 },
    suggestionPrice: { color: colors.ORANGE, fontWeight: "700", fontSize: 12 },
    inputBar: {
      position: "absolute",
      bottom: 20,
      left: 20,
      right: 20,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.CARD,
      borderRadius: 25,
      paddingLeft: 18,
      paddingRight: 6,
      height: 55,
      gap: 10,
    },
    input: { flex: 1, color: colors.CREAM },
    sendBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.ORANGE,
      alignItems: "center",
      justifyContent: "center",
    },
  });
