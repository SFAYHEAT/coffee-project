import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useRef, useState } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";

import QuickActionsSheet from "../../components/QuickActionsSheet";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

function TabBarIcon({
  name,
  color,
  focused,
}: {
  name: any;
  color: string;
  focused: boolean;
}) {
  const scale = useRef(new Animated.Value(focused ? 1.2 : 1)).current;

  Animated.spring(scale, {
    toValue: focused ? 1.2 : 1,
    friction: 5,
    tension: 80,
    useNativeDriver: true,
  }).start();

  return (
    <Animated.View
      style={{
        transform: [
          {
            scale,
          },
        ],
      }}
    >
      <Ionicons name={name} size={24} color={color} />
    </Animated.View>
  );
}

export default function TabsLayout() {
  const { colors } = useTheme();

  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  // ONLY ADMINS GET ADMIN FEATURES
  const isAdmin = !!user && user.isAdmin === true;

  const [quickOpen, setQuickOpen] = useState(false);

  const fabRotate = useRef(new Animated.Value(0)).current;

  const toggleQuick = () => {
    const value = quickOpen ? 0 : 1;

    Animated.spring(fabRotate, {
      toValue: value,

      friction: 6,

      tension: 70,

      useNativeDriver: true,
    }).start();

    setQuickOpen(!quickOpen);
  };

  const closeQuick = () => {
    setQuickOpen(false);

    Animated.spring(fabRotate, {
      toValue: 0,

      friction: 6,

      tension: 70,

      useNativeDriver: true,
    }).start();
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,

          tabBarStyle: {
            backgroundColor: colors.CARD,

            borderTopWidth: 0,

            height: 72,

            paddingBottom: 10,

            elevation: 20,

            shadowColor: "#000",

            shadowOpacity: 0.35,

            shadowRadius: 20,
          },

          tabBarActiveTintColor: colors.ORANGE,

          tabBarInactiveTintColor: colors.LIGHT,

          tabBarLabelStyle: {
            fontSize: 11,

            fontWeight: "900",
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",

            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "home" : "home-outline"}
                color={color}
                focused={focused}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="cart"
          options={{
            title: "Cart",

            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "bag" : "bag-outline"}
                color={color}
                focused={focused}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="favorites"
          options={{
            title: "Favorites",

            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "heart" : "heart-outline"}
                color={color}
                focused={focused}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",

            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "person" : "person-outline"}
                color={color}
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>

      <View pointerEvents="box-none" style={styles.fabContainer}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={toggleQuick}
          style={[
            styles.fab,
            {
              backgroundColor: colors.ORANGE,
            },
          ]}
        >
          <Animated.View
            style={{
              transform: [
                {
                  rotate: fabRotate.interpolate({
                    inputRange: [0, 1],

                    outputRange: ["0deg", "135deg"],
                  }),
                },
              ],
            }}
          >
            <Ionicons name="add" size={34} color={colors.BG} />
          </Animated.View>
        </TouchableOpacity>
      </View>

      <QuickActionsSheet
        visible={quickOpen}
        isAdmin={isAdmin}
        onClose={closeQuick}
      />
    </>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",

    bottom: 38,

    left: 0,

    right: 0,

    alignItems: "center",

    zIndex: 100,
  },

  fab: {
    width: 68,

    height: 68,

    borderRadius: 34,

    alignItems: "center",

    justifyContent: "center",

    borderWidth: 4,

    borderColor: "#120B08",

    shadowColor: "#000",

    shadowOpacity: 0.5,

    shadowRadius: 15,

    shadowOffset: {
      width: 0,

      height: 8,
    },

    elevation: 15,
  },
});
