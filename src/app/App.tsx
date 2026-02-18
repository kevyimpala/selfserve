import { useEffect, useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet, View } from "react-native";
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
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
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
    flex: 1
  },
  surface: {
    flex: 1
  }
});
