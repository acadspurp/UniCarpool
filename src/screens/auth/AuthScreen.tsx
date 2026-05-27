import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Alert,
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CAMPUS_DOMAIN, signIn, signUp } from "../../services/auth";
import { TextField } from "../../components/ui/TextField";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { OutlineButton } from "../../components/ui/OutlineButton";
import { colors } from "../../theme/colors";
import { useResponsive } from "../../hooks/useResponsive";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signupSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email().endsWith(CAMPUS_DOMAIN),
  password: z.string().min(6),
});

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;
type AuthMode = "login" | "signup";

const SLIDE_MS = 380;

export function AuthScreen({ navigation, route }: any) {
  const initialMode: AuthMode = route.params?.mode === "signup" ? "signup" : "login";
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  const { width } = useWindowDimensions();
  const { isWide } = useResponsive();
  const slideAnim = useRef(new Animated.Value(initialMode === "signup" ? 1 : 0)).current;

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  useEffect(() => {
    const target = mode === "signup" ? 1 : 0;
    Animated.timing(slideAnim, {
      toValue: target,
      duration: SLIDE_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [mode, slideAnim]);

  const goToSignup = () => setMode("signup");
  const goToLogin = () => setMode("login");

  const onLogin = async (values: LoginValues) => {
    try {
      setLoginLoading(true);
      await signIn(values.email, values.password);
    } catch (error: any) {
      Alert.alert("Login failed", error.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const onSignup = async (values: SignupValues) => {
    try {
      setSignupLoading(true);
      await signUp(values.email, values.password, values.fullName);
      Alert.alert("Account created", "Check your campus email for verification.");
      goToLogin();
    } catch (error: any) {
      Alert.alert("Signup failed", error.message);
    } finally {
      setSignupLoading(false);
    }
  };

  const panelWidth = isWide ? Math.min(width, 1100) : width;
  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -panelWidth],
  });

  const loginFields = (
    <>
      <Controller
        control={loginForm.control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextField
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Email"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      <Controller
        control={loginForm.control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextField secureTextEntry placeholder="Password" value={value} onChangeText={onChange} />
        )}
      />
    </>
  );

  const signupFields = (
    <>
      <Controller
        control={signupForm.control}
        name="fullName"
        render={({ field: { onChange, value } }) => (
          <TextField placeholder="Full name" value={value} onChangeText={onChange} />
        )}
      />
      <Controller
        control={signupForm.control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextField
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder={`name${CAMPUS_DOMAIN}`}
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      <Controller
        control={signupForm.control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextField secureTextEntry placeholder="Password" value={value} onChangeText={onChange} />
        )}
      />
    </>
  );

  const loginSlide = (
    <View style={[styles.slide, { width: panelWidth }]}>
      {isWide ? (
        <View style={styles.wideRow}>
          <FormSection title="Sign In" subtitle="Welcome back to UniCarpool">
            {loginFields}
            <PrimaryButton label="SIGN IN" onPress={loginForm.handleSubmit(onLogin)} loading={loginLoading} />
          </FormSection>
          <PromoSection
            title="Hello, Friend!"
            text="Register with your PUP institutional email to post rides, find carpools, and chat with your campus community."
            switchLabel="SIGN UP"
            onSwitch={goToSignup}
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.mobileSlide} keyboardShouldPersistTaps="handled">
          <FormSection title="Sign In" subtitle="Welcome back to UniCarpool">
            {loginFields}
            <PrimaryButton label="SIGN IN" onPress={loginForm.handleSubmit(onLogin)} loading={loginLoading} />
          </FormSection>
          <PromoSection
            title="Hello, Friend!"
            text="Register with your PUP institutional email to post rides, find carpools, and chat with your campus community."
            switchLabel="SIGN UP"
            onSwitch={goToSignup}
          />
        </ScrollView>
      )}
    </View>
  );

  const signupSlide = (
    <View style={[styles.slide, { width: panelWidth }]}>
      {isWide ? (
        <View style={styles.wideRow}>
          <PromoSection
            title="Welcome Back!"
            text="Already have an account? Sign in to continue posting rides, booking seats, and messaging drivers or riders."
            switchLabel="SIGN IN"
            onSwitch={goToLogin}
          />
          <FormSection title="Create Account" subtitle="Join the PUP carpool community">
            {signupFields}
            <PrimaryButton label="SIGN UP" onPress={signupForm.handleSubmit(onSignup)} loading={signupLoading} />
          </FormSection>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.mobileSlide} keyboardShouldPersistTaps="handled">
          <PromoSection
            title="Welcome Back!"
            text="Already have an account? Sign in to continue posting rides, booking seats, and messaging drivers or riders."
            switchLabel="SIGN IN"
            onSwitch={goToLogin}
          />
          <FormSection title="Create Account" subtitle="Join the PUP carpool community">
            {signupFields}
            <PrimaryButton label="SIGN UP" onPress={signupForm.handleSubmit(onSignup)} loading={signupLoading} />
          </FormSection>
        </ScrollView>
      )}
    </View>
  );

  return (
    <View style={styles.root}>
      <Pressable onPress={() => navigation.navigate("Welcome")} style={styles.backToWelcome}>
        <Text style={styles.backToWelcomeText}>← Back to overview</Text>
      </Pressable>

      <View style={[styles.sliderViewport, { width: panelWidth }]}>
        <Animated.View
          style={[
            styles.sliderTrack,
            {
              width: panelWidth * 2,
              transform: [{ translateX }],
            },
          ]}
        >
          {loginSlide}
          {signupSlide}
        </Animated.View>
      </View>
    </View>
  );
}

function FormSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.formPanel}>
      <Text style={styles.formTitle}>{title}</Text>
      <Text style={styles.formSubtitle}>{subtitle}</Text>
      <Text style={styles.hint}>Use your @iskolarngbayan.pup.edu.ph email</Text>
      {children}
    </View>
  );
}

function PromoSection({
  title,
  text,
  switchLabel,
  onSwitch,
}: {
  title: string;
  text: string;
  switchLabel: string;
  onSwitch: () => void;
}) {
  return (
    <View style={styles.promoPanel}>
      <View style={styles.promoCurve} />
      <View style={styles.promoContent}>
        <Text style={styles.promoTitle}>{title}</Text>
        <Text style={styles.promoText}>{text}</Text>
        <OutlineButton label={switchLabel} onPress={onSwitch} light />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: "center",
    minHeight: "100%" as unknown as number,
  },
  backToWelcome: {
    alignSelf: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
    width: "100%",
    maxWidth: 1100,
  },
  backToWelcomeText: { color: colors.textMuted, fontSize: 13 },
  sliderViewport: {
    flex: 1,
    overflow: "hidden",
    maxWidth: 1100,
  },
  sliderTrack: {
    flex: 1,
    flexDirection: "row",
  },
  slide: { flex: 1 },
  wideRow: { flex: 1, flexDirection: "row" },
  mobileSlide: { flexGrow: 1 },
  formPanel: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 28,
    justifyContent: "center",
    backgroundColor: colors.surface,
    minWidth: 280,
  },
  formTitle: { fontSize: 28, fontWeight: "800", color: colors.text, marginBottom: 8 },
  formSubtitle: { fontSize: 14, color: colors.textMuted, marginBottom: 4 },
  hint: { fontSize: 12, color: colors.primary, marginBottom: 20, fontWeight: "600" },
  promoPanel: {
    flex: 1,
    backgroundColor: colors.primary,
    minHeight: 240,
    overflow: "hidden",
    justifyContent: "center",
  },
  promoCurve: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.primaryLight,
    opacity: 0.35,
    top: -60,
    right: -40,
  },
  promoContent: { paddingHorizontal: 28, paddingVertical: 32 },
  promoTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.textOnPrimary,
    marginBottom: 12,
  },
  promoText: {
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(255,255,255,0.92)",
    marginBottom: 24,
    maxWidth: 320,
  },
});
