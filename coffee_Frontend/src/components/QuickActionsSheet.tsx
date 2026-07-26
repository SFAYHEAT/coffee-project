import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { useEffect, useRef } from "react";

import {
    Animated,
    Dimensions,
    Modal,
    PanResponder,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useTheme } from "../context/ThemeContext";

const { height, width } = Dimensions.get("window");

const baseActions = [
  {
    icon: "qr-code-outline",
    label: "Scan Table",
    route: "/scan-table",
  },

  {
    icon: "calendar-outline",
    label: "Reserve",
    route: "/reserve",
  },

  {
    icon: "gift-outline",
    label: "Wheel",
    route: "/wheel",
  },

  {
    icon: "trophy-outline",
    label: "Loyalty",
    route: "/loyalty",
  },

  {
    icon: "sparkles-outline",
    label: "AI Assistant",
    route: "/assistant",
  },

  {
    icon: "help-circle-outline",
    label: "Support",
    route: "/help",
  },
];

export default function QuickActionsSheet({
  visible,

  onClose,

  isAdmin,
}: {
  visible: boolean;

  onClose: () => void;

  isAdmin: boolean;
}) {
  const { colors } = useTheme();

  const actions = isAdmin
    ? [
        ...baseActions.slice(0, 5),

        {
          icon: "shield-checkmark-outline",
          label: "Admin",
          route: "/admin",
        },

        {
          icon: "cash-outline",
          label: "Cashier",
          route: "/cashier",
        },

        baseActions[5],
      ]
    : baseActions;

  const slide = useRef(new Animated.Value(height)).current;

  const backdrop = useRef(new Animated.Value(0)).current;

  const scales = useRef<Animated.Value[]>([]).current;

  useEffect(() => {
    scales.length = 0;

    actions.forEach(() => {
      scales.push(new Animated.Value(0));
    });
  }, [isAdmin]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slide, {
          toValue: 0,

          friction: 8,

          tension: 50,

          useNativeDriver: true,
        }),

        Animated.timing(backdrop, {
          toValue: 1,

          duration: 250,

          useNativeDriver: true,
        }),

        Animated.stagger(
          60,

          scales.map((s) =>
            Animated.spring(s, {
              toValue: 1,

              friction: 6,

              tension: 60,

              useNativeDriver: true,
            }),
          ),
        ),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(slide, {
          toValue: height,

          friction: 8,

          useNativeDriver: true,
        }),

        Animated.timing(backdrop, {
          toValue: 0,

          duration: 200,

          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onMoveShouldSetPanResponder: (_, gesture) => {
        return gesture.dy > 5;
      },

      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          slide.setValue(gesture.dy);
        }
      },

      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 100) {
          onClose();
        } else {
          Animated.spring(slide, {
            toValue: 0,

            friction: 8,

            tension: 60,

            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.overlay,

          {
            opacity: backdrop,
          },
        ]}
      >
        <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />

        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.sheet,

            {
              backgroundColor: colors.CARD,

              transform: [
                {
                  translateY: slide,
                },
              ],
            },
          ]}
        >
          <View style={styles.handleContainer}>
            <View
              style={[
                styles.handle,

                {
                  backgroundColor: colors.LIGHT,
                },
              ]}
            />
          </View>

          <Text
            style={[
              styles.title,

              {
                color: colors.CREAM,
              },
            ]}
          >
            Quick Actions
          </Text>

          <View style={styles.grid}>
            {actions.map((item, index) => (
              <Animated.View
                key={item.label}
                style={{
                  transform: [
                    {
                      scale: scales[index] || new Animated.Value(1),
                    },
                  ],
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[
                    styles.actionButton,

                    {
                      backgroundColor: colors.BG,
                    },
                  ]}
                  onPress={() => {
                    onClose();

                    setTimeout(() => {
                      router.push(item.route as any);
                    }, 200);
                  }}
                >
                  <View
                    style={[
                      styles.iconBox,

                      {
                        backgroundColor: colors.ORANGE + "22",
                      },
                    ]}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={26}
                      color={colors.ORANGE}
                    />
                  </View>

                  <Text
                    style={[
                      styles.label,

                      {
                        color: colors.CREAM,
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,

    justifyContent: "flex-end",

    backgroundColor: "rgba(0,0,0,0.45)",
  },

  sheet: {
    borderTopLeftRadius: 40,

    borderTopRightRadius: 40,

    paddingHorizontal: 24,

    paddingTop: 15,

    paddingBottom: 45,

    shadowColor: "#000",

    shadowOpacity: 0.5,

    shadowRadius: 30,

    elevation: 30,
  },

  handleContainer: {
    alignItems: "center",

    marginBottom: 20,
  },

  handle: {
    width: 55,

    height: 6,

    borderRadius: 10,

    opacity: 0.5,
  },

  title: {
    fontSize: 24,

    fontWeight: "900",

    textAlign: "center",

    marginBottom: 25,
  },

  grid: {
    flexDirection: "row",

    flexWrap: "wrap",

    justifyContent: "space-between",
  },

  actionButton: {
    width: (width - 75) / 3,

    height: 110,

    borderRadius: 25,

    alignItems: "center",

    justifyContent: "center",

    marginBottom: 15,
  },

  iconBox: {
    width: 58,

    height: 58,

    borderRadius: 22,

    alignItems: "center",

    justifyContent: "center",

    marginBottom: 8,
  },

  label: {
    fontSize: 12,

    fontWeight: "900",

    textAlign: "center",
  },
});
