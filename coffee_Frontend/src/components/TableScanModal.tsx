import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTable } from "../context/TableContext";
import { BASE_URL } from "../services/api";

const BG = "#120B08";
const CARD = "#241713";
const CREAM = "#F7EFE8";
const ORANGE = "#D99052";

export default function TableScanModal({
  visible,
  onDone,
}: {
  visible: boolean;
  onDone: (success?: boolean) => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [locked, setLocked] = useState(false);
  const { setTableNumber } = useTable();
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: -10,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handleScan = async ({ data }: { data: string }) => {
    if (locked) return;
    setLocked(true);
    try {
      const tableNumber = data.includes("/") ? data.split("/").pop() : data;
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/api/tables/${tableNumber}/claim`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const table = await res.json();
      if (!res.ok) throw new Error(table.message || "Could not claim table");

      await setTableNumber(table.tableNumber);
      setScanning(false);
      onDone();
    } catch (e: any) {
      Alert.alert("Table unavailable", e.message || "Could not verify table");
      setLocked(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        {!scanning ? (
          <View style={styles.card}>
            <Animated.Text
              style={[styles.cup, { transform: [{ translateY: bounce }] }]}
            >
              ☕
            </Animated.Text>
            <Text style={styles.title}>Hello there!</Text>
            <Text style={styles.subtitle}>
              Please scan your table QR code to start ordering
            </Text>

            <TouchableOpacity
              style={styles.scanBtn}
              onPress={async () => {
                if (!permission?.granted) {
                  const perm = await requestPermission();
                  if (!perm.granted) return;
                }
                setLocked(false);
                setScanning(true);
              }}
            >
              <Ionicons name="qr-code-outline" size={18} color={BG} />
              <Text style={styles.scanText}>Scan Table</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelPopupBtn}
              onPress={() => onDone(false)}
            >
              <Text style={styles.cancelPopupText}>Continue browsing</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cameraWrap}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={handleScan}
            />
            <View style={styles.scanFrame} />
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setScanning(false)}
            >
              <Ionicons name="close" size={22} color={CREAM} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  cancelPopupBtn: {
    marginTop: 15,
    paddingVertical: 10,
  },

  cancelPopupText: {
    color: "#B9A89C",
    fontWeight: "700",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(18,11,8,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: CARD,
    borderRadius: 30,
    padding: 30,
    width: "85%",
    alignItems: "center",
  },
  cup: { fontSize: 56, marginBottom: 10 },
  title: { color: CREAM, fontSize: 20, fontWeight: "900" },
  subtitle: {
    color: "#B9A89C",
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  scanBtn: {
    marginTop: 22,
    backgroundColor: ORANGE,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scanText: { color: BG, fontWeight: "900" },
  cameraWrap: { width: "100%", height: "100%" },
  scanFrame: {
    position: "absolute",
    top: "35%",
    left: "20%",
    width: "60%",
    height: "60%",
    maxHeight: 250,
    borderWidth: 3,
    borderColor: ORANGE,
    borderRadius: 20,
  },
  cancelBtn: {
    position: "absolute",
    top: 60,
    right: 24,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
});
