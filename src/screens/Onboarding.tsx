import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { supabase } from "../api/supabase";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useSession } from "../state/session";
import { colors } from "../utils/theme";

type OnboardingProps = {
  onComplete: () => void;
};

export const Onboarding = ({ onComplete }: OnboardingProps) => {
  const { user } = useSession();
  const [age, setAge] = useState("");
  const [identity, setIdentity] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!user) {
      setError("Please sign in again.");
      return;
    }

    const parsedAge = Number(age);
    if (!Number.isInteger(parsedAge) || parsedAge < 13 || parsedAge > 120) {
      setError("Enter a valid age between 13 and 120.");
      return;
    }

    if (!identity.trim()) {
      setError("Please share how you identify.");
      return;
    }

    const usernameFromMetadata = (user.user_metadata.username as string | undefined)?.trim().toLowerCase() ?? null;

    const { error: upsertError } = await supabase.from("profiles").upsert(
      {
        user_id: user.id,
        username: usernameFromMetadata,
        age: parsedAge,
        identity: identity.trim(),
        onboarding_completed: true
      },
      { onConflict: "user_id" }
    );

    if (upsertError) {
      setError(upsertError.message);
      return;
    }

    onComplete();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tell Us About You</Text>
      <Text style={styles.subtitle}>Before you start cooking, we just need a quick profile setup.</Text>
      <Input value={age} onChangeText={setAge} placeholder="Age" keyboardType="number-pad" />
      <Input
        value={identity}
        onChangeText={setIdentity}
        placeholder="How do you identify? (gender, pronouns, and however you define yourself)"
        multiline
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button label="Save Profile" onPress={submit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
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
