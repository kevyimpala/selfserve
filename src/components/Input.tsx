import { StyleSheet, TextInput, type TextInputProps } from "react-native";
import { colors } from "../utils/theme";

type InputProps = TextInputProps;

export const Input = ({ style, multiline, ...props }: InputProps) => {
  return (
    <TextInput
      style={[styles.input, multiline && styles.multiline, style]}
      placeholderTextColor={colors.primary}
      multiline={multiline}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.accent1,
    borderColor: colors.accent2,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 12
  },
  multiline: {
    minHeight: 110,
    textAlignVertical: "top"
  }
});
