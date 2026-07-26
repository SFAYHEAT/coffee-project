import Slider from "@react-native-community/slider";
import { useRef, useState } from "react";
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const MOODS = [
  { key: "happy", emoji: "😊", label: "Happy" },
  { key: "tired", emoji: "😴", label: "Tired" },
  { key: "studying", emoji: "📚", label: "Studying" },
  { key: "working", emoji: "💼", label: "Working" },
  { key: "relaxing", emoji: "❤️", label: "Relaxing" },
];

function MoodChip({ mood, active, onPress, colors }: any) {
  const scale = useRef(new Animated.Value(1)).current;

  const press = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.9, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    onPress(mood.key);
  };

  return (
    <TouchableOpacity onPress={press} activeOpacity={0.85}>
      <Animated.View
        style={[
          styles(colors).chip,
          active && styles(colors).chipActive,
          { transform: [{ scale }] },
        ]}
      >
        <Text style={styles(colors).emoji}>{mood.emoji}</Text>
        <Text
          style={[styles(colors).chipLabel, active && { color: colors.BG }]}
        >
          {mood.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function MoodSelector({
  colors,
  onChange,
}: {
  colors: any;
  onChange?: (mood: string, intensity: number) => void;
}) {
  const [mood, setMood] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(0.5);

  const selectMood = (key: string) => {
    setMood(key);
    onChange?.(key, intensity);
  };

  return (
    <View style={styles(colors).wrap}>
      <Text style={styles(colors).title}>How are you feeling today?</Text>

      <View style={styles(colors).chipsRow}>
        {MOODS.map((m) => (
          <MoodChip
            key={m.key}
            mood={m}
            active={mood === m.key}
            onPress={selectMood}
            colors={colors}
          />
        ))}
      </View>

      <View style={styles(colors).sliderLabelRow}>
        <Text style={styles(colors).sliderLabel}>Mild</Text>
        <Text style={styles(colors).sliderLabel}>Strong</Text>
      </View>

      <Slider
        style={{ width: "100%", height: 32 }}
        minimumValue={0}
        maximumValue={1}
        value={intensity}
        minimumTrackTintColor={colors.ORANGE}
        maximumTrackTintColor="#3A2A22"
        thumbTintColor={colors.ORANGE}
        onValueChange={(v) => {
          setIntensity(v);
          if (mood) onChange?.(mood, v);
        }}
      />
    </View>
  );
}

const styles = (colors: any) =>
  StyleSheet.create({
    wrap: {
      backgroundColor: colors.CARD,
      marginHorizontal: 22,
      marginTop: 16,
      borderRadius: 24,
      padding: 18,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
    },
    title: {
      color: colors.CREAM,
      fontSize: 15,
      fontWeight: "900",
      marginBottom: 14,
    },
    chipsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 10,
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: "#2E201A",
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 20,
    },
    chipActive: { backgroundColor: colors.ORANGE },
    emoji: { fontSize: 16 },
    chipLabel: { color: colors.LIGHT, fontWeight: "700", fontSize: 12 },
    sliderLabelRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 6,
    },
    sliderLabel: {
      color: colors.LIGHT,
      fontSize: 10,
      fontWeight: "800",
      textTransform: "uppercase",
    },
  });
