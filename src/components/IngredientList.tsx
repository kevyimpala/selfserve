import { StyleSheet, Text, View } from "react-native";
import { formatQuantity } from "../utils/format";
import { colors } from "../utils/theme";

export type Ingredient = {
  id: number;
  name: string;
  quantity: number;
};

type IngredientListProps = {
  items: Ingredient[];
};

export const IngredientList = ({ items }: IngredientListProps) => {
  if (items.length === 0) {
    return <Text style={styles.empty}>No pantry items yet.</Text>;
  }

  return (
    <View style={styles.list}>
      {items.map((item) => (
        <View key={item.id} style={styles.row}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.qty}>{formatQuantity(item.quantity)}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    gap: 8
  },
  row: {
    alignItems: "center",
    backgroundColor: colors.accent1,
    borderColor: colors.accent2,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  name: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700"
  },
  qty: {
    color: colors.secondary1,
    fontWeight: "700"
  },
  empty: {
    color: colors.accent1
  }
});
