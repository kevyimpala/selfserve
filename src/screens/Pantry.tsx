import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { supabase } from "../api/supabase";
import { Button } from "../components/Button";
import { IngredientList, type Ingredient } from "../components/IngredientList";
import { Input } from "../components/Input";
import { ScreenContainer } from "../components/ScreenContainer";
import { useSession } from "../state/session";
import { colors } from "../utils/theme";
import { isNonEmpty } from "../utils/validation";

type PantryRow = {
  id: number;
  name: string;
  quantity: number;
};

export const Pantry = () => {
  const { user } = useSession();
  const [items, setItems] = useState<Ingredient[]>([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [error, setError] = useState<string | null>(null);

  const loadItems = async () => {
    if (!user) {
      setItems([]);
      return;
    }

    const { data, error: loadError } = await supabase
      .from("pantry_items")
      .select("id, name, quantity")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (loadError) {
      setError(loadError.message);
      return;
    }

    setItems((data ?? []) as Ingredient[]);
  };

  useEffect(() => {
    void loadItems();
  }, [user?.id]);

  const addItem = async () => {
    if (!user) {
      setError("Login first");
      return;
    }
    if (!isNonEmpty(name)) {
      setError("Ingredient name is required");
      return;
    }

    const safeQuantity = Number(quantity) || 1;
    const { error: insertError } = await supabase.from("pantry_items").insert({
      user_id: user.id,
      name: name.trim(),
      quantity: safeQuantity
    });

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setError(null);
    setName("");
    setQuantity("1");
    await loadItems();
  };

  const removeItem = async (item: PantryRow) => {
    const { error: deleteError } = await supabase.from("pantry_items").delete().eq("id", item.id).eq("user_id", user!.id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    await loadItems();
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>Pantry</Text>
        <Text style={styles.subtitle}>Track your ingredients and keep prep fast.</Text>
        <Input value={name} onChangeText={setName} placeholder="Ingredient name" returnKeyType="next" />
        <Input value={quantity} onChangeText={setQuantity} placeholder="Quantity" keyboardType="numeric" returnKeyType="done" />
        <Button label="Add Ingredient" onPress={addItem} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <IngredientList items={items} />
        {items.length > 0 ? (
          <Button label="Remove Last Item" onPress={() => void removeItem(items[0] as PantryRow)} variant="ghost" />
        ) : null}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
    paddingBottom: 8,
    paddingTop: 6
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
