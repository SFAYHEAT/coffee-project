import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useTable } from "../context/TableContext";

export default function ScanTableScreen() {
  const { setTableNumber } = useTable();

  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);

  const scanLine = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLine, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),

        Animated.timing(scanLine, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Camera permission required</Text>

        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleScan = async ({ data }: any) => {
    if (scanned) return;

    setScanned(true);

    console.log("QR DATA:", data);

    let tableNumber = data;

    if (data.includes("/")) {
      tableNumber = data.split("/").pop();
    }

    if (!tableNumber) {
      Alert.alert("Invalid QR", "This QR is not a coffee table");

      setScanned(false);

      return;
    }

    await setTableNumber(tableNumber);

    Alert.alert("Table detected", tableNumber);

    router.replace("/(tabs)/home");
  };

  const linePosition = scanLine.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 250],
  });

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={handleScan}
      />

      <View style={styles.overlay}>
        <Text style={styles.title}>Scan your table QR</Text>

        <View style={styles.scanBox}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />

          <Animated.View
            style={[
              styles.scanLine,
              {
                transform: [
                  {
                    translateY: linePosition,
                  },
                ],
              },
            ]}
          />
        </View>

        <Text style={styles.subtitle}>Place the QR code inside the frame</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  camera: {
    flex: 1,
  },

  overlay: {
    position: "absolute",
    top: 80,
    left: 0,
    right: 0,
    alignItems: "center",
  },

  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 40,
  },

  subtitle: {
    marginTop: 35,
    color: "white",
    fontSize: 15,
    fontWeight: "700",
    opacity: 0.9,
  },

  scanBox: {
    width: 260,
    height: 260,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },

  corner: {
    position: "absolute",
    width: 45,
    height: 45,
    borderColor: "#FF8A3D",
  },

  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 5,
    borderLeftWidth: 5,
    borderTopLeftRadius: 15,
  },

  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 5,
    borderRightWidth: 5,
    borderTopRightRadius: 15,
  },

  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 5,
    borderLeftWidth: 5,
    borderBottomLeftRadius: 15,
  },

  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderBottomRightRadius: 15,
  },

  scanLine: {
    width: "85%",
    height: 3,
    backgroundColor: "#FF8A3D",
    position: "absolute",
    top: 0,
    borderRadius: 5,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#120B08",
  },

  text: {
    color: "white",
    fontSize: 18,
    marginBottom: 20,
  },

  button: {
    backgroundColor: "#D99052",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 20,
  },

  buttonText: {
    color: "white",
    fontWeight: "900",
  },
});
