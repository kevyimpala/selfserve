import { ResizeMode, Video } from "expo-av";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Button } from "../components/Button";
import { ScreenContainer } from "../components/ScreenContainer";
import { colors } from "../utils/theme";

type LandingProps = {
  health: string;
  onCreateAccount: () => void;
  onLogin: () => void;
  onGetCooking: () => void;
};

export const Landing = ({ health, onCreateAccount, onLogin, onGetCooking }: LandingProps) => {
  const { width, height } = useWindowDimensions();
  const shortSide = Math.min(width, height);
  const isDesktop = width >= 1024;
  const isSmallPhone = !isDesktop && shortSide <= 360;
  const isLargePhone = !isDesktop && shortSide >= 430;
  const [activeClip, setActiveClip] = useState(0);

  const clips = useMemo(
    () => [
      "https://videos.pexels.com/video-files/4253302/4253302-uhd_2560_1440_30fps.mp4",
      "https://videos.pexels.com/video-files/3195650/3195650-uhd_2560_1440_25fps.mp4",
      "https://videos.pexels.com/video-files/5530954/5530954-hd_1920_1080_25fps.mp4",
      "https://videos.pexels.com/video-files/8472017/8472017-hd_1920_1080_25fps.mp4"
    ],
    []
  );

  useEffect(() => {
    const id = setInterval(() => {
      setActiveClip((current) => (current + 1) % clips.length);
    }, 6500);

    return () => clearInterval(id);
  }, [clips.length]);

  const edgePadding = isDesktop ? 24 : isSmallPhone ? 12 : isLargePhone ? 18 : 14;
  const cardWidth = isDesktop
    ? Math.min(320, Math.max(280, Math.round(width * 0.24)))
    : Math.min(width - edgePadding * 2, isSmallPhone ? 328 : isLargePhone ? 420 : 380);
  const cardTop = isDesktop ? 24 : isSmallPhone ? 12 : 18;
  const cardBottom = isDesktop ? 24 : isSmallPhone ? 14 : 18;

  const headlineMain = isSmallPhone ? 58 : isLargePhone ? 74 : 66;
  const headlineSub = isSmallPhone ? 50 : isLargePhone ? 66 : 58;
  const headlineGap = isSmallPhone ? 12 : 16;
  const buttonGap = isSmallPhone ? 8 : 10;

  const cardStyle = isDesktop
    ? {
        bottom: cardBottom,
        left: edgePadding,
        position: "absolute" as const,
        top: cardTop,
        width: cardWidth
      }
    : {
        marginHorizontal: edgePadding,
        marginTop: cardTop,
        minHeight: Math.max(isSmallPhone ? 500 : 540, Math.round(height * 0.72)),
        width: cardWidth
      };

  return (
    <ScreenContainer contentStyle={styles.screenContent}>
      <View style={[styles.scene, { minHeight: Math.max(height, 640) }]}>
        <View style={styles.videoSurface}>
          <Video
            key={clips[activeClip]}
            source={{ uri: clips[activeClip] }}
            style={styles.video}
            resizeMode={ResizeMode.COVER}
            isMuted
            isLooping
            shouldPlay
          />
          <View style={styles.videoTint} />
        </View>

        <View style={[styles.card, cardStyle]}>
          <Text style={[styles.heroLineBold, { fontSize: headlineMain, lineHeight: headlineMain + 2 }]}>Hey</Text>
          <Text style={[styles.heroLineBoldItalic, { fontSize: headlineMain, lineHeight: headlineMain + 2, marginBottom: headlineGap }]}>Chef</Text>
          <Text style={[styles.heroLineLight, { fontSize: headlineSub, lineHeight: headlineSub + 2 }]}>Let's</Text>
          <Text style={[styles.heroLineLight, { fontSize: headlineSub, lineHeight: headlineSub + 2 }]}>cook.</Text>

          <View style={[styles.ctaGroup, { gap: buttonGap }]}>
            <Button label="Create an account" onPress={onCreateAccount} variant="primary" />
            <Button label="Cook now" onPress={onGetCooking} variant="secondary" />
            <Pressable onPress={onLogin} style={styles.loginLink}>
              <Text style={[styles.loginLinkText, { fontSize: isSmallPhone ? 14 : 15 }]}>Already have an account? Login</Text>
            </Pressable>
          </View>

          <Text style={styles.health}>System: {health}</Text>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  screenContent: {
    backgroundColor: "#080708"
  },
  scene: {
    flex: 1
  },
  videoSurface: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden"
  },
  video: {
    height: "100%",
    width: "100%"
  },
  videoTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#080708",
    opacity: 0.2
  },
  card: {
    backgroundColor: colors.primary,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 24
  },
  heroLineBold: {
    color: colors.secondary2,
    fontFamily: "TT Commons Pro",
    fontWeight: "700"
  },
  heroLineBoldItalic: {
    color: colors.secondary2,
    fontFamily: "TT Commons Pro",
    fontStyle: "italic",
    fontWeight: "700"
  },
  heroLineLight: {
    color: colors.secondary2,
    fontFamily: "TT Commons Pro",
    fontWeight: "300"
  },
  ctaGroup: {
    marginTop: "auto"
  },
  loginLink: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40
  },
  loginLinkText: {
    color: colors.accent1,
    fontFamily: "TT Commons Pro",
    fontWeight: "400"
  },
  health: {
    color: colors.accent2,
    fontFamily: "TT Commons Pro",
    fontSize: 11,
    letterSpacing: 0.5,
    marginTop: 8,
    textTransform: "uppercase"
  }
});
