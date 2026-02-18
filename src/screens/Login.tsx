import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { supabase } from "../api/supabase";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { ScreenContainer } from "../components/ScreenContainer";
import { colors } from "../utils/theme";
import { isStrongEnoughPassword, isValidEmail } from "../utils/validation";

export type AuthMode = "login" | "signup";

type LoginProps = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onAuthSuccess: (payload: { mode: AuthMode; onboardingCompleted: boolean }) => void;
};

type ProfileRow = {
  onboarding_completed: boolean | null;
};

export const Login = ({ mode, onModeChange, onAuthSuccess }: LoginProps) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getOnboardingCompleted = async (userId: string) => {
    const { data, error: profileError } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("user_id", userId)
      .maybeSingle<ProfileRow>();

    if (profileError && profileError.code !== "PGRST116") {
      throw new Error(profileError.message);
    }

    return Boolean(data?.onboarding_completed);
  };

  const resendSignupEmail = async () => {
    if (!isValidEmail(email)) {
      setError("Enter your account email first.");
      return;
    }

    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email
    });

    if (resendError) {
      setError(resendError.message);
      return;
    }

    setInfo("Verification email resent. Check your inbox.");
  };

  const resendResetEmail = async () => {
    if (!isValidEmail(email)) {
      setError("Enter your account email first.");
      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
    if (resetError) {
      setError(resetError.message);
      return;
    }

    setInfo("Password reset email resent.");
  };

  const submitSignup = async () => {
    const normalizedUsername = username.trim().toLowerCase();

    const { data: existingUser, error: lookupError } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("username", normalizedUsername)
      .maybeSingle();

    if (lookupError && lookupError.code !== "PGRST116") {
      throw new Error(lookupError.message);
    }

    if (existingUser) {
      throw new Error("Username already taken");
    }

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: normalizedUsername
        }
      }
    });

    if (signupError) {
      throw new Error(signupError.message);
    }

    if (!data.session) {
      setInfo("Account created. Check your email and click the verification link, then log in.");
      return;
    }

    onAuthSuccess({ mode: "signup", onboardingCompleted: false });
  };

  const submitLogin = async () => {
    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });

    if (loginError) {
      throw new Error(loginError.message);
    }

    const userId = data.user?.id;
    const onboardingCompleted = userId ? await getOnboardingCompleted(userId) : false;
    onAuthSuccess({ mode: "login", onboardingCompleted });
  };

  const submitForgot = async () => {
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
    if (resetError) {
      throw new Error(resetError.message);
    }

    setInfo("Password reset email sent. Follow the link in your inbox.");
  };

  const submit = async () => {
    if (!isValidEmail(email)) {
      setError("Enter a valid email.");
      return;
    }

    if (!isForgotMode && !isStrongEnoughPassword(password)) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!isForgotMode && mode === "signup" && !username.trim()) {
      setError("Username is required.");
      return;
    }

    try {
      setError(null);
      setInfo(null);

      if (isForgotMode) {
        await submitForgot();
        return;
      }

      if (mode === "signup") {
        await submitSignup();
        return;
      }

      await submitLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    }
  };

  const isSignup = mode === "signup";

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>{isSignup ? "Create Your Chef Account" : "Chef Login"}</Text>
        <Text style={styles.subtitle}>
          {isSignup ? "Start cooking smarter with Self Serve." : "Welcome back. Let's get cooking."}
        </Text>

        <Input
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          returnKeyType="next"
        />

        {!isForgotMode && isSignup ? (
          <Input
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
        ) : null}

        {!isForgotMode ? (
          <Input
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
          />
        ) : null}

        {info ? <Text style={styles.info}>{info}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button label={isForgotMode ? "Send Reset Email" : isSignup ? "Create Account" : "Sign In"} onPress={submit} />

        {isSignup && !isForgotMode ? <Button label="Resend Verification" onPress={resendSignupEmail} variant="ghost" /> : null}
        {isForgotMode ? <Button label="Resend Reset Email" onPress={resendResetEmail} variant="ghost" /> : null}

        {!isForgotMode ? (
          <Button
            label={isSignup ? "Already have an account?" : "Need an account?"}
            onPress={() => onModeChange(isSignup ? "login" : "signup")}
            variant="ghost"
          />
        ) : null}

        <Button
          label={isForgotMode ? "Back to login" : "Forgot my password"}
          onPress={() => {
            setIsForgotMode((current) => !current);
            setInfo(null);
            setError(null);
          }}
          variant="ghost"
        />
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
  info: {
    color: colors.accent2
  },
  error: {
    color: colors.secondary1
  }
});
