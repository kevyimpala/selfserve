import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { invokeFunction } from "../api/functions";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { colors } from "../utils/theme";

type NutritionData = {
  barcode: string;
  productName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export const Barcode = () => {
  const [barcode, setBarcode] = useState("");
  const [result, setResult] = useState<NutritionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lookup = async () => {
    if (!barcode.trim()) {
      setError("Enter a barcode");
      return;
    }

    try {
      setError(null);
      const data = await invokeFunction<NutritionData>("nutrition-barcode", {
        barcode: barcode.trim()
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Barcode</Text>
      <Text style={styles.subtitle}>Nutrition lookup now uses a Supabase Edge Function.</Text>
      <Input value={barcode} onChangeText={setBarcode} placeholder="Scan or enter barcode" />
      <Button label="Lookup Nutrition" onPress={lookup} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {result ? <Text style={styles.result}>{JSON.stringify(result, null, 2)}</Text> : null}
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
    fontFamily: "monospace",
    padding: 12
  }
});
