import { StyleSheet, Text, View } from "react-native";
import { Button } from "../components/Button";
import { colors } from "../utils/theme";

type LandingProps = {
  health: string;
  onCreateAccount: () => void;
  onLogin: () => void;
  onGetCooking: () => void;
};

export const Landing = ({ health, onCreateAccount, onLogin, onGetCooking }: LandingProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>WELCOME, CHEFS</Text>
      </View>
      <Text style={styles.title}>Self Serve</Text>
      <Text style={styles.subtitle}>
        Plan meals faster, track your pantry, and turn every ingredient into your next great dish.
      </Text>
      <View style={styles.ctaGroup}>
        <Button label="Create Account" onPress={onCreateAccount} variant="primary" />
        <Button label="Login" onPress={onLogin} variant="secondary" />
        <Button label="Get Cooking" onPress={onGetCooking} variant="ghost" />
      </View>
      <Text style={styles.health}>Backend status: {health}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 14
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.accent2,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5
  },
  badgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1
  },
  title: {
    color: colors.accent1,
    fontSize: 44,
    fontWeight: "800",
    letterSpacing: 0.6
  },
  subtitle: {
    color: colors.accent1,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 620
  },
  ctaGroup: {
    gap: 10,
    marginTop: 6
  },
  health: {
    color: colors.accent2,
    fontSize: 12,
    letterSpacing: 0.5,
    marginTop: 8,
    textTransform: "uppercase"
  }
});
