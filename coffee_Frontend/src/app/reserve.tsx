import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";

import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useTheme } from "../context/ThemeContext";
import { BASE_URL } from "../services/api";

// helpers
const pad = (n: number) => String(n).padStart(2, "0");
const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toTimeStr = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const toDisplayDate = (d: Date) =>
  d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
const toDisplayTime = (d: Date) =>
  d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

export default function Reserve() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [dateObj, setDateObj] = useState(new Date());
  const [timeObj, setTimeObj] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [partySize, setPartySize] = useState(2);

  const [tables, setTables] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  // MY RESERVATIONS

  const [myReservations, setMyReservations] = useState<any[]>([]);

  useEffect(() => {
    loadMine();
  }, []);

  const loadMine = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/api/reservations/mine`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setMyReservations(data.filter((r: any) => r.status === "confirmed"));
    } catch (e) {
      console.log(e);
    }
  };

  const cancelReservation = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem("token");

      await fetch(
        `${BASE_URL}/api/reservations/${id}`,

        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      loadMine();
    } catch (e) {
      console.log(e);
    }
  };

  const search = async () => {
    setLoading(true);

    try {
      const date = toDateStr(dateObj);
      const time = toTimeStr(timeObj);

      const res = await fetch(
        `${BASE_URL}/api/reservations/available?date=${date}&time=${time}`,
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setTables(data);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Could not fetch tables");
    } finally {
      setLoading(false);
    }
  };

  const reserve = async (tableNumber: string) => {
    try {
      const token = await AsyncStorage.getItem("token");

      const date = toDateStr(dateObj);
      const time = toTimeStr(timeObj);

      const res = await fetch(`${BASE_URL}/api/reservations`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          tableNumber,

          date,

          time,

          partySize: Number(partySize),
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      Alert.alert(
        "Reserved",
        `Table ${tableNumber} booked for ${date} at ${time}`,
      );

      setTables((prev) => prev.filter((t) => t.tableNumber !== tableNumber));

      loadMine();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Could not reserve");
    }
  };

  const onChangeDate = (event: any, selected?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (event.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }
    if (selected) setDateObj(selected);
    if (Platform.OS === "android") setShowDatePicker(false);
  };

  const onChangeTime = (event: any, selected?: Date) => {
    setShowTimePicker(Platform.OS === "ios");
    if (event.type === "dismissed") {
      setShowTimePicker(false);
      return;
    }
    if (selected) setTimeObj(selected);
    if (Platform.OS === "android") setShowTimePicker(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>THE HOOD · DINE IN</Text>
      <Text style={styles.header}>Reserve a Table</Text>

      {/* MY RESERVATIONS */}

      {myReservations.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="bookmark" size={16} color={colors.ORANGE} />
            <Text style={styles.label}>My Reservations</Text>
          </View>

          {myReservations.map((r) => (
            <View key={r._id} style={styles.tableRow}>
              <View style={styles.rowIconWrap}>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={colors.ORANGE}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.tableText}>Table {r.tableNumber}</Text>
                <Text style={styles.tableSubText}>
                  {r.date} · {r.time}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => cancelReservation(r._id)}
              >
                <Text style={styles.reserveText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* SEARCH */}

      <View style={styles.card}>
        <Text style={styles.label}>Date</Text>

        <TouchableOpacity
          style={styles.pickerField}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar-outline" size={18} color={colors.ORANGE} />
          <Text style={styles.pickerFieldText}>{toDisplayDate(dateObj)}</Text>
          <Ionicons name="chevron-down" size={16} color={colors.LIGHT} />
        </TouchableOpacity>

        <Text style={styles.label}>Time</Text>

        <TouchableOpacity
          style={styles.pickerField}
          onPress={() => setShowTimePicker(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="time-outline" size={18} color={colors.ORANGE} />
          <Text style={styles.pickerFieldText}>{toDisplayTime(timeObj)}</Text>
          <Ionicons name="chevron-down" size={16} color={colors.LIGHT} />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={dateObj}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            minimumDate={new Date()}
            onChange={onChangeDate}
            themeVariant="dark"
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={timeObj}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onChangeTime}
            themeVariant="dark"
            minuteInterval={15}
          />
        )}

        {Platform.OS === "ios" && (showDatePicker || showTimePicker) && (
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => {
              setShowDatePicker(false);
              setShowTimePicker(false);
            }}
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.label}>Party Size</Text>

        <View style={styles.stepperRow}>
          <TouchableOpacity
            style={styles.stepperBtn}
            onPress={() => setPartySize((p) => Math.max(1, p - 1))}
          >
            <Ionicons name="remove" size={20} color={colors.ORANGE} />
          </TouchableOpacity>

          <View style={styles.stepperValueWrap}>
            <Ionicons name="people-outline" size={16} color={colors.LIGHT} />
            <Text style={styles.stepperValue}>{partySize}</Text>
          </View>

          <TouchableOpacity
            style={styles.stepperBtn}
            onPress={() => setPartySize((p) => Math.min(20, p + 1))}
          >
            <Ionicons name="add" size={20} color={colors.ORANGE} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={search}
          disabled={loading}
        >
          <Ionicons
            name="search-outline"
            size={18}
            color={colors.BG}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.buttonText}>
            {loading ? "Searching..." : "Find Tables"}
          </Text>
        </TouchableOpacity>
      </View>

      {tables.length > 0 && (
        <Text style={styles.resultsLabel}>
          {tables.length} table{tables.length > 1 ? "s" : ""} available
        </Text>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {tables.map((t) => (
          <View key={t._id} style={styles.tableRow}>
            <View style={styles.rowIconWrap}>
              <Ionicons
                name="restaurant-outline"
                size={18}
                color={colors.ORANGE}
              />
            </View>

            <Text style={styles.tableText}>Table {t.tableNumber}</Text>

            <TouchableOpacity
              style={styles.reserveBtn}
              onPress={() => reserve(t.tableNumber)}
            >
              <Text style={styles.reserveText}>Reserve</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.BG,
      paddingTop: 60,
      paddingHorizontal: 20,
    },
    eyebrow: {
      color: colors.ORANGE,
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 1.5,
      marginBottom: 4,
    },
    header: {
      color: colors.CREAM,
      fontSize: 26,
      fontWeight: "900",
      marginBottom: 20,
    },
    card: {
      backgroundColor: colors.CARD,
      borderRadius: 26,
      padding: 20,
      marginBottom: 20,
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
      color: colors.LIGHT,
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    pickerField: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: "#2E201A",
      height: 52,
      borderRadius: 15,
      paddingHorizontal: 15,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
    },
    pickerFieldText: {
      flex: 1,
      color: colors.CREAM,
      fontWeight: "700",
      fontSize: 15,
    },
    doneBtn: {
      alignSelf: "flex-end",
      paddingVertical: 6,
      paddingHorizontal: 16,
      marginBottom: 10,
    },
    doneBtnText: {
      color: colors.ORANGE,
      fontWeight: "900",
      fontSize: 13,
    },
    stepperRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 20,
      backgroundColor: "#2E201A",
      borderRadius: 15,
      paddingVertical: 10,
      marginBottom: 18,
    },
    stepperBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(240,146,64,0.15)",
      alignItems: "center",
      justifyContent: "center",
    },
    stepperValueWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      minWidth: 60,
      justifyContent: "center",
    },
    stepperValue: {
      color: colors.CREAM,
      fontWeight: "900",
      fontSize: 18,
    },
    button: {
      height: 52,
      flexDirection: "row",
      backgroundColor: colors.ORANGE,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.ORANGE,
      shadowOpacity: 0.35,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    buttonText: { color: colors.BG, fontWeight: "900" },
    resultsLabel: {
      color: colors.LIGHT,
      fontSize: 12,
      fontWeight: "700",
      marginBottom: 10,
    },
    tableRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.CARD,
      borderRadius: 18,
      padding: 14,
      marginBottom: 12,
      gap: 12,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
    },
    rowIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(240,146,64,0.12)",
      alignItems: "center",
      justifyContent: "center",
    },
    tableText: { flex: 1, color: colors.CREAM, fontWeight: "800" },
    tableSubText: { color: colors.LIGHT, fontSize: 12, marginTop: 2 },
    reserveBtn: {
      backgroundColor: colors.ORANGE,
      paddingHorizontal: 16,
      paddingVertical: 9,
      borderRadius: 14,
    },
    cancelBtn: {
      backgroundColor: "#FF5A5F",
      paddingHorizontal: 16,
      paddingVertical: 9,
      borderRadius: 14,
    },
    reserveText: { color: colors.BG, fontWeight: "900", fontSize: 12 },
  });
