import { StyleSheet, Text, View } from "react-native";

type HomeProps = {
  health: string;
};

export const Home = ({ health }: HomeProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>HomeCook</Text>
      <Text>Backend status: {health}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8
  },
  title: {
    fontSize: 28,
    fontWeight: "700"
  }
});
