import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { apiFetch } from "../api/client";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useSession } from "../state/session";
import { colors } from "../utils/theme";
import { isStrongEnoughPassword, isValidEmail } from "../utils/validation";

export type AuthMode = "login" | "signup";

type LoginProps = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
};

export const Login = ({ mode, onModeChange }: LoginProps) => {
  const { setToken } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!isValidEmail(email)) {
      setError("Enter a valid email.");
      return;
    }
    if (!isStrongEnoughPassword(password)) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setError(null);
      const endpoint = mode === "signup" ? "/auth/signup" : "/auth/login";
      const authData = await apiFetch<{ token: string }>(endpoint, {
        method: "POST",
        body: { email, password }
      });
      setToken(authData.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    }
  };

  const isSignup = mode === "signup";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSignup ? "Create Your Chef Account" : "Chef Login"}</Text>
      <Text style={styles.subtitle}>
        {isSignup ? "Start cooking smarter with Self Serve." : "Welcome back. Let's get cooking."}
      </Text>
      <Input value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" keyboardType="email-address" />
      <Input value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button label={isSignup ? "Create Account" : "Sign In"} onPress={submit} />
      <Button
        label={isSignup ? "Already have an account?" : "Need an account?"}
        onPress={() => onModeChange(isSignup ? "login" : "signup")}
        variant="ghost"
      />
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
