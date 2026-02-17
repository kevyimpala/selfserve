import { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { supabase } from "../api/supabase";
import { SessionProvider } from "../state/session";
import { colors } from "../utils/theme";
import { AppRoutes } from "./routes";

export default function App() {
  const [health, setHealth] = useState("checking...");

  useEffect(() => {
    const run = async () => {
      const hasEnv = Boolean(process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
      if (!hasEnv) {
        setHealth("configure-supabase-env");
        return;
      }

      const { error } = await supabase.auth.getSession();
      setHealth(error ? "supabase-error" : "supabase-ok");
    };

    void run();
  }, []);

  return (
    <SessionProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.blobOne} />
        <View style={styles.blobTwo} />
        <Text style={styles.header}>Self Serve</Text>
        <Text style={styles.kicker}>PANTRY TO PLATE</Text>
        <View style={styles.surface}>
          <AppRoutes health={health} />
        </View>
      </SafeAreaView>
    </SessionProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    flex: 1,
    padding: 16
  },
  blobOne: {
    backgroundColor: colors.secondary2,
    borderRadius: 220,
    height: 220,
    opacity: 0.2,
    position: "absolute",
    right: -40,
    top: -30,
    width: 220
  },
  blobTwo: {
    backgroundColor: colors.secondary1,
    borderRadius: 160,
    bottom: -40,
    height: 160,
    left: -20,
    opacity: 0.25,
    position: "absolute",
    width: 160
  },
  header: {
    color: colors.accent1,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0.8
  },
  kicker: {
    color: colors.accent2,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 12
  },
  surface: {
    flex: 1
  }
});
