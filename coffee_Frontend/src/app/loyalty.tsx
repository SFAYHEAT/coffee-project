import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { BASE_URL } from "../services/api";

const TIER_COLORS: any = {
  Bronze: "#CD7F32",
  Silver: "#C0C0C0",
  Gold: "#FFD700",
  Platinum: "#B9F2FF",
};

const TIER_NEXT: any = {
  Bronze: 150,
  Silver: 500,
  Gold: 1000,
  Platinum: null,
};

export default function Loyalty() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [status, setStatus] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    checkin();
    loadLeaderboard();
  }, []);

  const checkin = async () => {
    const token = await AsyncStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/loyalty/checkin`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setStatus(data);
  };

  const loadLeaderboard = async () => {
    const res = await fetch(`${BASE_URL}/api/loyalty/leaderboard`);
    setLeaderboard(await res.json());
  };

  if (!status) return null;

  const nextThreshold = TIER_NEXT[status.tier];
  const progress = nextThreshold
    ? Math.min(status.points / nextThreshold, 1)
    : 1;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      <Text style={styles.title}>My Loyalty</Text>

      {!status.alreadyCheckedIn && (
        <View style={styles.rewardBanner}>
          <Ionicons name="gift" size={20} color={colors.BG} />
          <Text style={styles.rewardText}>
            +{status.pointsEarned} points for logging in today!
          </Text>
        </View>
      )}

      <View style={styles.tierCard}>
        <View
          style={[
            styles.tierBadge,
            { backgroundColor: TIER_COLORS[status.tier] },
          ]}
        >
          <Ionicons name="trophy" size={30} color={colors.BG} />
        </View>
        <Text style={styles.tierName}>{status.tier}</Text>
        <Text style={styles.points}>{status.points} points</Text>

        {nextThreshold && (
          <>
            <View style={styles.progressTrack}>
              <View
                style={[styles.progressFill, { width: `${progress * 100}%` }]}
              />
            </View>
            <Text style={styles.progressText}>
              {nextThreshold - status.points} points to next tier
            </Text>
          </>
        )}
      </View>

      <View style={styles.streakCard}>
        <Ionicons name="flame" size={24} color={colors.ORANGE} />
        <Text style={styles.streakText}>{status.streak} day visit streak</Text>
      </View>

      <Text style={styles.sectionTitle}>Badges</Text>
      <View style={styles.badgeRow}>
        {status.badges?.length ? (
          status.badges.map((b: string) => (
            <View key={b} style={styles.badge}>
              <Ionicons name="ribbon" size={16} color={colors.ORANGE} />
              <Text style={styles.badgeText}>{b}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No badges yet — keep visiting!</Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Leaderboard</Text>
      {leaderboard.map((u, i) => (
        <View key={u._id} style={styles.leaderRow}>
          <Text style={styles.leaderRank}>#{i + 1}</Text>
          <Text style={styles.leaderName}>{u.name}</Text>
          <Text style={styles.leaderPoints}>{u.loyaltyPoints} pts</Text>
        </View>
      ))}
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
      fontSize: 26,
      fontWeight: "900",
      marginBottom: 20,
    },
    rewardBanner: {
      backgroundColor: colors.ORANGE,
      borderRadius: 20,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 20,
    },
    rewardText: { color: colors.BG, fontWeight: "800", flex: 1 },
    tierCard: {
      backgroundColor: colors.CARD,
      borderRadius: 30,
      padding: 25,
      alignItems: "center",
      marginBottom: 20,
    },
    tierBadge: {
      width: 70,
      height: 70,
      borderRadius: 35,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    tierName: { color: colors.CREAM, fontSize: 24, fontWeight: "900" },
    points: {
      color: colors.ORANGE,
      fontSize: 16,
      fontWeight: "800",
      marginTop: 5,
    },
    progressTrack: {
      width: "100%",
      height: 8,
      backgroundColor: "#38271F",
      borderRadius: 4,
      marginTop: 20,
      overflow: "hidden",
    },
    progressFill: { height: "100%", backgroundColor: colors.ORANGE },
    progressText: { color: colors.LIGHT, fontSize: 12, marginTop: 8 },
    streakCard: {
      backgroundColor: colors.CARD,
      borderRadius: 20,
      padding: 18,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 20,
    },
    streakText: { color: colors.CREAM, fontWeight: "800" },
    sectionTitle: {
      color: colors.CREAM,
      fontSize: 18,
      fontWeight: "900",
      marginBottom: 12,
      marginTop: 10,
    },
    badgeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 10,
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.CARD,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 15,
    },
    badgeText: { color: colors.CREAM, fontSize: 12, fontWeight: "700" },
    emptyText: { color: colors.LIGHT, fontSize: 13 },
    leaderRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.CARD,
      borderRadius: 15,
      padding: 12,
      marginBottom: 8,
    },
    leaderRank: { color: colors.ORANGE, fontWeight: "900", width: 30 },
    leaderName: { color: colors.CREAM, flex: 1, fontWeight: "700" },
    leaderPoints: { color: colors.LIGHT, fontWeight: "700" },
  });
