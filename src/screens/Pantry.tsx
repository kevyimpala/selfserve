import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { apiFetch } from "../api/client";
import { Button } from "../components/Button";
import { IngredientList, type Ingredient } from "../components/IngredientList";
import { Input } from "../components/Input";
import { useSession } from "../state/session";
import { colors } from "../utils/theme";
import { isNonEmpty } from "../utils/validation";

type PantryResponse = {
  items: Ingredient[];
};

export const Pantry = () => {
  const { token } = useSession();
  const [items, setItems] = useState<Ingredient[]>([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [error, setError] = useState<string | null>(null);

  const loadItems = async () => {
    if (!token) {
      setItems([]);
      return;
    }

    try {
      const data = await apiFetch<PantryResponse>("/pantry", { token });
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load pantry");
    }
  };

  useEffect(() => {
    void loadItems();
  }, [token]);

  const addItem = async () => {
    if (!token) {
      setError("Login first");
      return;
    }
    if (!isNonEmpty(name)) {
      setError("Ingredient name is required");
      return;
    }

    try {
      setError(null);
      await apiFetch("/pantry", {
        token,
        method: "POST",
        body: {
          name: name.trim(),
          quantity: Number(quantity) || 1
        }
      });
      setName("");
      setQuantity("1");
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add item");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pantry</Text>
      <Text style={styles.subtitle}>Track your ingredients and keep prep fast.</Text>
      <Input value={name} onChangeText={setName} placeholder="Ingredient name" />
      <Input value={quantity} onChangeText={setQuantity} placeholder="Quantity" keyboardType="numeric" />
      <Button label="Add Ingredient" onPress={addItem} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <IngredientList items={items} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10
  },
  title: {
    color: colors.accent1,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0.4
  },
  subtitle: {
    color: colors.accent2,
    marginBottom: 4
  },
  error: {
    color: colors.secondary1
  }
});
