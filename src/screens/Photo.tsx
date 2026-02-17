import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { invokeFunction } from "../api/functions";
import { supabase } from "../api/supabase";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useSession } from "../state/session";
import { colors } from "../utils/theme";

type VisionResponse = {
  ingredients: string[];
};

type UploadRow = {
  id: number;
  image_base64: string;
  ingredients_json: string[];
  created_at: string;
};

export const Photo = () => {
  const { user } = useSession();
  const [imageBase64, setImageBase64] = useState("");
  const [lookupId, setLookupId] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [lastUploadId, setLastUploadId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!user) {
      setError("Login first");
      return;
    }

    if (!imageBase64.trim()) {
      setError("Provide base64 image text");
      return;
    }

    try {
      setError(null);

      const parsed = await invokeFunction<VisionResponse>("vision-parse", {
        imageBase64: imageBase64.trim()
      });

      const { data, error: insertError } = await supabase
        .from("uploads")
        .insert({
          user_id: user.id,
          image_base64: imageBase64.trim(),
          ingredients_json: parsed.ingredients
        })
        .select("id")
        .single<{ id: number }>();

      if (insertError) {
        throw new Error(insertError.message);
      }

      setIngredients(parsed.ingredients);
      setLastUploadId(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const fetchUpload = async () => {
    if (!user) {
      setError("Login first");
      return;
    }

    const id = Number(lookupId);
    if (!Number.isInteger(id) || id <= 0) {
      setError("Enter a valid upload ID");
      return;
    }

    const { data, error: fetchError } = await supabase
      .from("uploads")
      .select("id, image_base64, ingredients_json, created_at")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle<UploadRow>();

    if (fetchError) {
      setError(fetchError.message);
      return;
    }

    if (!data) {
      setError("Upload not found");
      return;
    }

    setError(null);
    setImageBase64(data.image_base64);
    setIngredients(data.ingredients_json ?? []);
    setLastUploadId(data.id);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Photo Upload</Text>
      <Text style={styles.subtitle}>Supabase Storage/vision migration uses an Edge Function parser.</Text>
      <Input value={imageBase64} onChangeText={setImageBase64} placeholder="Base64 image content" multiline />
      <Button label="Parse Ingredients" onPress={submit} />

      <Input value={lookupId} onChangeText={setLookupId} placeholder="Lookup upload by ID" keyboardType="number-pad" />
      <Button label="Fetch Upload" onPress={fetchUpload} variant="ghost" />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {lastUploadId ? <Text style={styles.meta}>Last upload ID: {lastUploadId}</Text> : null}
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
  meta: {
    color: colors.accent2,
    fontSize: 12,
    textTransform: "uppercase"
  },
  result: {
    backgroundColor: colors.accent1,
    borderRadius: 14,
    color: colors.primary,
    fontWeight: "600",
    padding: 12
  }
});
