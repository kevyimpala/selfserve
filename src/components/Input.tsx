import { StyleSheet, TextInput, type TextInputProps } from "react-native";
import { colors } from "../utils/theme";

type InputProps = TextInputProps;

export const Input = (props: InputProps) => {
  return <TextInput style={styles.input} placeholderTextColor={colors.primary} {...props} />;
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.accent1,
    borderColor: colors.accent2,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 12
  }
});
