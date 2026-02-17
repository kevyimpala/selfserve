import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Barcode } from "../screens/Barcode";
import { Landing } from "../screens/Landing";
import { Login, type AuthMode } from "../screens/Login";
import { Onboarding } from "../screens/Onboarding";
import { Pantry } from "../screens/Pantry";
import { Photo } from "../screens/Photo";
import { colors } from "../utils/theme";

const tabs = ["Pantry", "Barcode", "Photo"] as const;
type Tab = (typeof tabs)[number];

type AppRoutesProps = {
  health: string;
};

export const AppRoutes = ({ health }: AppRoutesProps) => {
  const [tab, setTab] = useState<Tab>("Pantry");
  const [showLanding, setShowLanding] = useState(true);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [showAuth, setShowAuth] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

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
            setShowAuth(false);
            setShowOnboarding(false);
          }}
        >
          <Text style={styles.homeLabel}>Self Serve</Text>
        </Pressable>
        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, showAuth && styles.activeTab]}
            onPress={() => {
              setShowAuth(true);
              setShowOnboarding(false);
            }}
          >
            <Text style={[styles.tabLabel, showAuth && styles.activeTabLabel]}>
              {authMode === "signup" ? "Signup" : "Login"}
            </Text>
          </Pressable>
          {tabs.map((item) => (
            <Pressable
              key={item}
              style={[styles.tab, !showAuth && !showOnboarding && tab === item && styles.activeTab]}
              onPress={() => {
                setShowAuth(false);
                setShowOnboarding(false);
                setTab(item);
              }}
            >
              <Text style={[styles.tabLabel, !showAuth && !showOnboarding && tab === item && styles.activeTabLabel]}>
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
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

        {!showOnboarding && showAuth ? (
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

        {!showOnboarding && !showAuth && tab === "Pantry" ? <Pantry /> : null}
        {!showOnboarding && !showAuth && tab === "Barcode" ? <Barcode /> : null}
        {!showOnboarding && !showAuth && tab === "Photo" ? <Photo /> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 14
  },
  topRow: {
    gap: 10
  },
  homeButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.accent2,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5
  },
  homeLabel: {
    color: colors.primary,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  tabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  tab: {
    backgroundColor: colors.accent1,
    borderColor: colors.accent2,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  activeTab: {
    backgroundColor: colors.secondary2,
    borderColor: colors.secondary2
  },
  tabLabel: {
    color: colors.primary,
    fontWeight: "600"
  },
  activeTabLabel: {
    color: colors.white
  },
  content: {
    backgroundColor: colors.primary,
    borderColor: colors.accent2,
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    padding: 16
  }
});
