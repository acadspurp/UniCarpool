import { AuthScreen } from "./AuthScreen";

/** @deprecated Use AuthScreen — kept for compatibility */
export function LoginScreen(props: any) {
  return <AuthScreen {...props} route={{ ...props.route, params: { mode: "login" } }} />;
}
