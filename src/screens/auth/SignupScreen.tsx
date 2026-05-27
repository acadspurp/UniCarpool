import { AuthScreen } from "./AuthScreen";

/** @deprecated Use AuthScreen — kept for compatibility */
export function SignupScreen(props: any) {
  return <AuthScreen {...props} route={{ ...props.route, params: { mode: "signup" } }} />;
}
