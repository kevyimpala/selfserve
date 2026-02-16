import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { apiFetch } from "../api/client";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useSession } from "../state/session";
import { colors } from "../utils/theme";

type PhotoResponse = {
  ingredients: string[];
};

export const Photo = () => {
  const { token } = useSession();
  const [imageBase64, setImageBase64] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!token) {
      setError("Login first");
      return;
    }
    if (!imageBase64.trim()) {
      setError("Provide base64 image text");
      return;
    }

    try {
      setError(null);
      const data = await apiFetch<PhotoResponse>("/uploads", {
        token,
        method: "POST",
        body: { imageBase64: imageBase64.trim() }
      });
      setIngredients(data.ingredients);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Photo Upload</Text>
      <Text style={styles.subtitle}>Stubbed vision parsing for ingredient detection.</Text>
      <Input value={imageBase64} onChangeText={setImageBase64} placeholder="Base64 image content" multiline />
      <Button label="Parse Ingredients" onPress={submit} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {ingredients.length > 0 ? <Text style={styles.result}>{ingredients.join(", ")}</Text> : null}
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
  },
  result: {
    backgroundColor: colors.accent1,
    borderRadius: 14,
    color: colors.primary,
    fontWeight: "600",
    padding: 12
  }
});
