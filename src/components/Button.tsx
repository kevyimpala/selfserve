import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../utils/theme";

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
};

export const Button = ({ label, onPress, disabled = false, variant = "primary" }: ButtonProps) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        variant === "secondary" && styles.secondary,
        variant === "ghost" && styles.ghost,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.label, variant === "ghost" && styles.ghostLabel]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.secondary1,
    borderRadius: 12,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  secondary: {
    backgroundColor: colors.accent2
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: colors.accent2,
    borderWidth: 1
  },
  pressed: {
    opacity: 0.85
  },
  disabled: {
    opacity: 0.45
  },
  label: {
    color: colors.white,
    fontFamily: "TT Commons Pro",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
    textAlign: "center"
  },
  ghostLabel: {
    color: colors.primary
  }
});
