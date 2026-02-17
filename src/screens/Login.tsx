import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { apiFetch } from "../api/client";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useSession } from "../state/session";
import { colors } from "../utils/theme";
import { isStrongEnoughPassword, isValidEmail } from "../utils/validation";

export type AuthMode = "login" | "signup";

type AuthResponse = {
  token: string;
  user: {
    onboardingCompleted?: boolean;
  };
};

type LoginProps = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onAuthSuccess: (payload: { mode: AuthMode; onboardingCompleted: boolean }) => void;
};

export const Login = ({ mode, onModeChange, onAuthSuccess }: LoginProps) => {
  const { setToken } = useSession();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [signupStage, setSignupStage] = useState<"collect" | "verify">("collect");
  const [forgotStage, setForgotStage] = useState<"request" | "reset">("request");
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSignupStage("collect");
    setIsForgotMode(false);
    setForgotStage("request");
    setVerificationCode("");
    setForgotCode("");
    setNewPassword("");
    setInfo(null);
    setError(null);
  }, [mode]);

  const resendVerificationCode = async () => {
    if (!isValidEmail(email)) {
      setError("Enter your account email first.");
      return;
    }

    try {
      setError(null);
      await apiFetch<{ message: string }>("/auth/resend-verification", {
        method: "POST",
        body: { email }
      });
      setInfo("Verification code resent. Check your inbox.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend verification code");
    }
  };

  const resendResetCode = async () => {
    if (!isValidEmail(email)) {
      setError("Enter your account email first.");
      return;
    }

    try {
      setError(null);
      await apiFetch<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: { email }
      });
      setInfo("Reset code resent. Check your inbox.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend reset code");
    }
  };

  const submitLogin = async () => {
    const authData = await apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: { email, password }
    });
    setToken(authData.token);
    onAuthSuccess({
      mode: "login",
      onboardingCompleted: Boolean(authData.user.onboardingCompleted)
    });
  };

  const submitSignup = async () => {
    if (signupStage === "collect") {
      await apiFetch<{ message: string }>("/auth/signup", {
        method: "POST",
        body: { email, username, password }
      });
      setSignupStage("verify");
      setInfo("We emailed a verification code. Enter it to activate your account.");
      return;
    }

    const authData = await apiFetch<AuthResponse>("/auth/verify-email", {
      method: "POST",
      body: { email, code: verificationCode }
    });
    setToken(authData.token);
    onAuthSuccess({
      mode: "signup",
      onboardingCompleted: Boolean(authData.user.onboardingCompleted)
    });
  };

  const submitForgot = async () => {
    if (forgotStage === "request") {
      await apiFetch<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: { email }
      });
      setForgotStage("reset");
      setInfo("If your email exists, we sent a reset code. Enter it with your new password.");
      return;
    }

    await apiFetch<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: {
        email,
        code: forgotCode,
        newPassword
      }
    });

    setIsForgotMode(false);
    setForgotStage("request");
    setForgotCode("");
    setNewPassword("");
    setInfo("Password reset. You can now log in.");
  };

  const submit = async () => {
    if (!isValidEmail(email)) {
      setError("Enter a valid email.");
      return;
    }

    const requiresPassword = !isForgotMode || forgotStage === "reset";
    if (requiresPassword && !isStrongEnoughPassword(isForgotMode ? newPassword : password)) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!isForgotMode && mode === "signup" && signupStage === "collect" && !username.trim()) {
      setError("Username is required.");
      return;
    }

    if (!isForgotMode && mode === "signup" && signupStage === "verify" && !verificationCode.trim()) {
      setError("Enter the verification code sent to your email.");
      return;
    }

    if (isForgotMode && forgotStage === "reset" && !forgotCode.trim()) {
      setError("Enter the reset code from your email.");
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
    <View style={styles.container}>
      <Text style={styles.title}>{isSignup ? "Create Your Chef Account" : "Chef Login"}</Text>
      <Text style={styles.subtitle}>
        {isSignup ? "Start cooking smarter with Self Serve." : "Welcome back. Let's get cooking."}
      </Text>

      <Input value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" keyboardType="email-address" />

      {isForgotMode ? (
        <>
          {forgotStage === "reset" ? (
            <>
              <Input value={forgotCode} onChangeText={setForgotCode} placeholder="Reset code" keyboardType="number-pad" />
              <Input value={newPassword} onChangeText={setNewPassword} placeholder="New password" secureTextEntry />
              <Button label="Resend Code" onPress={resendResetCode} variant="ghost" />
            </>
          ) : null}
        </>
      ) : (
        <>
          {isSignup && signupStage === "collect" ? (
            <Input value={username} onChangeText={setUsername} placeholder="Username" autoCapitalize="none" />
          ) : null}

          {isSignup && signupStage === "verify" ? (
            <>
              <Input
                value={verificationCode}
                onChangeText={setVerificationCode}
                placeholder="Email verification code"
                keyboardType="number-pad"
              />
              <Button label="Resend Code" onPress={resendVerificationCode} variant="ghost" />
            </>
          ) : (
            <Input value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
          )}
        </>
      )}

      {info ? <Text style={styles.info}>{info}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        label={
          isForgotMode
            ? forgotStage === "request"
              ? "Send Reset Code"
              : "Reset Password"
            : isSignup
              ? signupStage === "collect"
                ? "Create Account"
                : "Verify Account"
              : "Sign In"
        }
        onPress={submit}
      />

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
          setForgotStage("request");
          setForgotCode("");
          setNewPassword("");
          setInfo(null);
          setError(null);
        }}
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
  info: {
    color: colors.accent2
  },
  error: {
    color: colors.secondary1
  }
});
