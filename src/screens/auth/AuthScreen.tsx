import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
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
import { FirebaseError } from "firebase/app";
import { CAMPUS_DOMAIN, signIn, signUp } from "../../services/auth";
import { createOrUpdateProfile } from "../../services/profile";
import { RoleSelectField } from "../../components/ui/RoleSelectField";
import type { CampusRole } from "../../types/models";
import { TextField } from "../../components/ui/TextField";
import { PasswordField } from "../../components/ui/PasswordField";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { OutlineButton } from "../../components/ui/OutlineButton";
import { PrivacyConsent } from "../../components/ui/PrivacyConsent";
import { colors } from "../../theme/colors";
import { useResponsive } from "../../hooks/useResponsive";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name."),
  campusRole: z.enum(["student", "faculty", "staff"], {
    message: "Select whether you are a student, professor, or staff.",
  }),
  email: z
    .string()
    .trim()
    .email("Enter a valid campus email.")
    .endsWith(CAMPUS_DOMAIN, `Use your institutional email (${CAMPUS_DOMAIN}).`),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;
type AuthMode = "login" | "signup";

const SLIDE_MS = 380;

function firstError(errors: Record<string, { message?: string } | undefined>, key: string) {
  return errors[key]?.message;
}

function alertFormErrors(errors: Record<string, { message?: string } | undefined>) {
  const messages = Object.values(errors)
    .map((e) => e?.message)
    .filter(Boolean) as string[];
  if (messages.length > 0) {
    Alert.alert("Check your entries", messages.join("\n"));
  }
}

function getAuthErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "This PUP email is already registered. Try Sign In instead.";
      case "auth/invalid-email":
        return "Enter a valid @iskolarngbayan.pup.edu.ph email.";
      case "auth/weak-password":
        return "Password is too weak. Use at least 6 characters.";
      case "auth/too-many-requests":
        return "Too many attempts. Please wait a minute and try again.";
      default:
        return error.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Could not continue. Please try again.";
}

export function AuthScreen({ navigation, route }: any) {
  const initialMode: AuthMode = route.params?.mode === "signup" ? "signup" : "login";
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [privacyError, setPrivacyError] = useState<string | null>(null);

  const { width } = useWindowDimensions();
  const { isWide, isCompact } = useResponsive();
  const isMobile = !isWide;
  const slideAnim = useRef(new Animated.Value(initialMode === "signup" ? 1 : 0)).current;

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", campusRole: "student" as CampusRole, email: "", password: "" },
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
    } catch (error: unknown) {
      Alert.alert("Login failed", getAuthErrorMessage(error));
    } finally {
      setLoginLoading(false);
    }
  };

  const onSignup = async (values: SignupValues) => {
    if (!privacyAccepted) {
      setPrivacyError("Please agree to the data privacy notice to continue.");
      Alert.alert("Consent required", "Please agree to the data privacy notice to create an account.");
      return;
    }
    setPrivacyError(null);
    try {
      setSignupLoading(true);
      const newUser = await signUp(values.email, values.password, values.fullName);
      await createOrUpdateProfile({
        uid: newUser.uid,
        email: newUser.email ?? values.email.trim().toLowerCase(),
        fullName: values.fullName.trim(),
        campusRole: values.campusRole,
        department: "",
        phone: "",
        isVerifiedCampus: false,
      });
      Alert.alert(
        "Account created",
        "We will send a 6-digit code to your campus email on the next screen.",
      );
    } catch (error: unknown) {
      const message = getAuthErrorMessage(error);
      Alert.alert("Signup failed", message);
      if (error instanceof FirebaseError && error.code === "auth/email-already-in-use") {
        goToLogin();
      }
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
            error={firstError(loginForm.formState.errors, "email")}
          />
        )}
      />
      <Controller
        control={loginForm.control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <PasswordField
            placeholder="Password"
            value={value}
            onChangeText={onChange}
            error={firstError(loginForm.formState.errors, "password")}
          />
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
          <TextField
            label="Full name"
            placeholder="Full name"
            value={value}
            onChangeText={onChange}
            hint="Double-check your name — it cannot be changed after you sign up."
            error={firstError(signupForm.formState.errors, "fullName")}
          />
        )}
      />
      <Controller
        control={signupForm.control}
        name="campusRole"
        render={({ field: { onChange, value } }) => (
          <RoleSelectField
            label="I am a"
            value={value}
            onChange={onChange}
            hint="This cannot be changed after you sign up."
            error={firstError(signupForm.formState.errors, "campusRole")}
          />
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
            error={firstError(signupForm.formState.errors, "email")}
          />
        )}
      />
      <Controller
        control={signupForm.control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <PasswordField
            placeholder="Password"
            value={value}
            onChangeText={onChange}
            error={firstError(signupForm.formState.errors, "password")}
          />
        )}
      />
    </>
  );

  const loginPromo = (
    <PromoSection
      title="Hello, Friend!"
      text="Register with your PUP institutional email to post rides, find carpools, and chat with your campus community."
      switchLabel="SIGN UP"
      onSwitch={goToSignup}
      mobile={isMobile}
    />
  );

  const signupPromo = (
    <PromoSection
      title="Welcome Back!"
      text="Already have an account? Sign in to continue posting rides, booking seats, and messaging drivers or riders."
      switchLabel="SIGN IN"
      onSwitch={goToLogin}
      mobile={isMobile}
    />
  );

  const mobileScrollProps = {
    style: styles.mobileScroll,
    contentContainerStyle: [
      styles.mobileScrollContent,
      isCompact && styles.mobileScrollContentCompact,
    ],
    keyboardShouldPersistTaps: "handled" as const,
    showsVerticalScrollIndicator: true,
    nestedScrollEnabled: true,
    bounces: true,
  };

  const loginSlide = (
    <View style={[styles.slide, { width: panelWidth }]}>
      {isWide ? (
        <View style={styles.wideRow}>
          <FormSection title="Sign In" subtitle="Welcome back to UniCarpool">
            {loginFields}
            <PrimaryButton
              label="SIGN IN"
              onPress={loginForm.handleSubmit(onLogin, alertFormErrors)}
              loading={loginLoading}
            />
          </FormSection>
          {loginPromo}
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.mobileKeyboard}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView {...mobileScrollProps}>
            {loginPromo}
            <FormSection title="Sign In" subtitle="Welcome back to UniCarpool" mobile>
              {loginFields}
              <PrimaryButton
                label="SIGN IN"
                onPress={loginForm.handleSubmit(onLogin, alertFormErrors)}
                loading={loginLoading}
              />
            </FormSection>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );

  const signupSlide = (
    <View style={[styles.slide, { width: panelWidth }]}>
      {isWide ? (
        <View style={styles.wideRow}>
          {signupPromo}
          <FormSection title="Create Account" subtitle="Join the PUP carpool community">
            {signupFields}
            <PrivacyConsent
              checked={privacyAccepted}
              onToggle={() => {
                setPrivacyAccepted((v) => !v);
                setPrivacyError(null);
              }}
              error={privacyError ?? undefined}
            />
            <PrimaryButton
              label="SIGN UP"
              onPress={signupForm.handleSubmit(onSignup, alertFormErrors)}
              loading={signupLoading}
            />
          </FormSection>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.mobileKeyboard}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView {...mobileScrollProps}>
            {signupPromo}
            <FormSection title="Create Account" subtitle="Join the PUP carpool community" mobile>
              {signupFields}
              <PrivacyConsent
                checked={privacyAccepted}
                onToggle={() => {
                  setPrivacyAccepted((v) => !v);
                  setPrivacyError(null);
                }}
                error={privacyError ?? undefined}
              />
              <PrimaryButton
                label="SIGN UP"
                onPress={signupForm.handleSubmit(onSignup, alertFormErrors)}
                loading={signupLoading}
              />
            </FormSection>
          </ScrollView>
        </KeyboardAvoidingView>
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
  mobile = false,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  mobile?: boolean;
}) {
  return (
    <View style={[styles.formPanel, mobile && styles.formPanelMobile]}>
      <Text style={[styles.formTitle, mobile && styles.formTitleMobile]}>{title}</Text>
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
  mobile = false,
}: {
  title: string;
  text: string;
  switchLabel: string;
  onSwitch: () => void;
  mobile?: boolean;
}) {
  return (
    <View style={[styles.promoPanel, mobile && styles.promoPanelMobile]}>
      <View style={styles.promoCurve} />
      <View style={[styles.promoContent, mobile && styles.promoContentMobile]}>
        <Text style={[styles.promoTitle, mobile && styles.promoTitleMobile]}>{title}</Text>
        <Text style={[styles.promoText, mobile && styles.promoTextMobile]}>{text}</Text>
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
    ...(Platform.OS === "web"
      ? { height: "100vh" as unknown as number, maxHeight: "100vh" as unknown as number }
      : {}),
  },
  backToWelcome: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "web" ? 12 : 16,
    paddingBottom: 4,
    width: "100%",
    maxWidth: 1100,
    zIndex: 2,
  },
  backToWelcomeText: { color: colors.textMuted, fontSize: 13 },
  sliderViewport: {
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
    maxWidth: 1100,
    width: "100%",
  },
  sliderTrack: {
    flex: 1,
    flexDirection: "row",
  },
  slide: { flex: 1, height: "100%" as unknown as number },
  wideRow: { flex: 1, flexDirection: "row" },
  mobileKeyboard: { flex: 1, minHeight: 0 },
  mobileScroll: {
    flex: 1,
    minHeight: 0,
    ...(Platform.OS === "web" ? { overflow: "scroll" as "scroll" } : {}),
  },
  mobileScrollContent: { paddingBottom: 32, flexGrow: 1 },
  mobileScrollContentCompact: { paddingBottom: 40 },
  formPanel: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 28,
    justifyContent: "center",
    backgroundColor: colors.surface,
    minWidth: 280,
  },
  formPanelMobile: {
    flex: 0,
    paddingHorizontal: 16,
    paddingVertical: 18,
    justifyContent: "flex-start",
    minWidth: 0,
  },
  formTitle: { fontSize: 28, fontWeight: "800", color: colors.text, marginBottom: 8 },
  formTitleMobile: { fontSize: 22, marginBottom: 6 },
  formSubtitle: { fontSize: 14, color: colors.textMuted, marginBottom: 4 },
  hint: { fontSize: 12, color: colors.primary, marginBottom: 20, fontWeight: "600" },
  promoPanel: {
    flex: 1,
    backgroundColor: colors.primary,
    minHeight: 240,
    overflow: "hidden",
    justifyContent: "center",
  },
  promoPanelMobile: {
    flex: 0,
    minHeight: 0,
    marginBottom: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  promoContentMobile: { paddingHorizontal: 16, paddingVertical: 18 },
  promoTitleMobile: { fontSize: 20, marginBottom: 6 },
  promoTextMobile: { fontSize: 13, lineHeight: 19, marginBottom: 14 },
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
