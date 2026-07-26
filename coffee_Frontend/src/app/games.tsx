import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { BASE_URL } from "../services/api";

const ICONS = ["cafe", "ice-cream", "leaf", "flame", "heart", "star"];

function shuffle(arr: any[]) {
  return [...arr, ...arr]
    .map((v) => ({ v, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ v }, i) => ({ id: i, icon: v, flipped: false, matched: false }));
}

export default function Games() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [cards, setCards] = useState(() => shuffle(ICONS));
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (cards.every((c) => c.matched)) {
      setDone(true);
      claimReward();
    }
  }, [cards]);

  const claimReward = async () => {
    const score = Math.max(50 - moves, 5);
    const token = await AsyncStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/games/reward`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ game: "memory", score }),
    });
    const data = await res.json();
    Alert.alert("Nice!", `You earned ${data.pointsEarned} loyalty points`);
  };

  const flip = (id: number) => {
    if (selected.length === 2) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.flipped || card.matched) return;

    const newCards = cards.map((c) =>
      c.id === id ? { ...c, flipped: true } : c,
    );
    const newSelected = [...selected, id];
    setCards(newCards);
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = newSelected;
      const cardA = newCards.find((c) => c.id === a)!;
      const cardB = newCards.find((c) => c.id === b)!;

      if (cardA.icon === cardB.icon) {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === a || c.id === b ? { ...c, matched: true } : c,
            ),
          );
          setSelected([]);
        }, 400);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === a || c.id === b ? { ...c, flipped: false } : c,
            ),
          );
          setSelected([]);
        }, 700);
      }
    }
  };

  const restart = () => {
    setCards(shuffle(ICONS));
    setSelected([]);
    setMoves(0);
    setDone(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.CREAM} />
        </TouchableOpacity>
        <Text style={styles.title}>Memory Game</Text>
        <Text style={styles.moves}>{moves} moves</Text>
      </View>

      <View style={styles.grid}>
        {cards.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={styles.card}
            onPress={() => flip(c.id)}
            activeOpacity={0.8}
          >
            {c.flipped || c.matched ? (
              <Ionicons name={c.icon as any} size={28} color={colors.ORANGE} />
            ) : (
              <View style={styles.cardBack} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {done && (
        <TouchableOpacity style={styles.restartBtn} onPress={restart}>
          <Text style={styles.restartText}>Play Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.BG,
      paddingTop: 55,
      paddingHorizontal: 20,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 30,
    },
    title: { color: colors.CREAM, fontSize: 18, fontWeight: "900" },
    moves: { color: colors.LIGHT, fontSize: 13 },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    card: {
      width: "30%",
      aspectRatio: 1,
      backgroundColor: colors.CARD,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    cardBack: {
      width: "100%",
      height: "100%",
      borderRadius: 18,
      backgroundColor: "#38271F",
    },
    restartBtn: {
      marginTop: 20,
      backgroundColor: colors.ORANGE,
      borderRadius: 20,
      paddingVertical: 16,
      alignItems: "center",
    },
    restartText: { color: colors.BG, fontWeight: "900" },
  });
