import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Barcode } from "../screens/Barcode";
import { Landing } from "../screens/Landing";
import { Login, type AuthMode } from "../screens/Login";
import { Onboarding } from "../screens/Onboarding";
import { Pantry } from "../screens/Pantry";
import { Photo } from "../screens/Photo";
import { useSession } from "../state/session";
import { colors } from "../utils/theme";

const tabs = ["Pantry", "Barcode", "Photo"] as const;
type Tab = (typeof tabs)[number];

type AppRoutesProps = {
  health: string;
};

export const AppRoutes = ({ health }: AppRoutesProps) => {
  const { authReady, isAuthenticated, signOut } = useSession();
  const [tab, setTab] = useState<Tab>("Pantry");
  const [showLanding, setShowLanding] = useState(true);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [showAuth, setShowAuth] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const shouldShowAuth = useMemo(() => showAuth || !isAuthenticated, [isAuthenticated, showAuth]);

  if (!authReady) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={styles.loadingText}>Loading session...</Text>
      </View>
    );
  }

  if (showLanding) {
    return (
      <Landing
        health={health}
        onCreateAccount={() => {
          setAuthMode("signup");
          setShowAuth(true);
          setShowOnboarding(false);
          setShowLanding(false);
        }}
        onLogin={() => {
          setAuthMode("login");
          setShowAuth(true);
          setShowOnboarding(false);
          setShowLanding(false);
        }}
        onGetCooking={() => {
          setShowAuth(false);
          setShowOnboarding(false);
          setShowLanding(false);
          setTab("Pantry");
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Pressable
          style={styles.homeButton}
          onPress={() => {
            setShowLanding(true);
            setShowOnboarding(false);
            setShowAuth(false);
          }}
        >
          <Text style={styles.homeLabel}>Self Serve</Text>
        </Pressable>

        {isAuthenticated ? (
          <Pressable
            style={styles.logoutButton}
            onPress={() => {
              void signOut();
              setShowAuth(true);
              setShowOnboarding(false);
              setAuthMode("login");
            }}
          >
            <Text style={styles.logoutLabel}>Sign Out</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.content}>
        {showOnboarding ? (
          <Onboarding
            onComplete={() => {
              setShowOnboarding(false);
              setShowAuth(false);
              setTab("Pantry");
            }}
          />
        ) : null}

        {!showOnboarding && shouldShowAuth ? (
          <Login
            mode={authMode}
            onModeChange={setAuthMode}
            onAuthSuccess={({ mode, onboardingCompleted }) => {
              setShowAuth(false);
              if (mode === "signup" || !onboardingCompleted) {
                setShowOnboarding(true);
                return;
              }

              setShowOnboarding(false);
              setTab("Pantry");
            }}
          />
        ) : null}

        {!showOnboarding && !shouldShowAuth && tab === "Pantry" ? <Pantry /> : null}
        {!showOnboarding && !shouldShowAuth && tab === "Barcode" ? <Barcode /> : null}
        {!showOnboarding && !shouldShowAuth && tab === "Photo" ? <Photo /> : null}
      </View>

      {!showOnboarding && !shouldShowAuth ? (
        <View style={styles.bottomTabs}>
          {tabs.map((item) => (
            <Pressable key={item} style={[styles.bottomTab, tab === item && styles.bottomTabActive]} onPress={() => setTab(item)}>
              <Text style={[styles.bottomTabLabel, tab === item && styles.bottomTabLabelActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 10
  },
  loadingWrap: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center"
  },
  loadingText: {
    color: colors.accent1,
    fontSize: 16,
    fontWeight: "600"
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  homeButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.accent2,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  homeLabel: {
    color: colors.primary,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  logoutButton: {
    borderColor: colors.accent2,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  logoutLabel: {
    color: colors.accent1,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.7,
    textTransform: "uppercase"
  },
  content: {
    backgroundColor: colors.primary,
    borderColor: colors.accent2,
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    overflow: "hidden",
    padding: 14
  },
  bottomTabs: {
    backgroundColor: colors.primary,
    borderColor: colors.accent2,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    padding: 8
  },
  bottomTab: {
    borderRadius: 10,
    flex: 1,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  bottomTabActive: {
    backgroundColor: colors.secondary2
  },
  bottomTabLabel: {
    color: colors.accent2,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textAlign: "center",
    textTransform: "uppercase"
  },
  bottomTabLabelActive: {
    color: colors.white
  }
});
