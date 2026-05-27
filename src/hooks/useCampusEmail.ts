import { CAMPUS_DOMAIN } from "../services/auth";

export function useCampusEmail() {
  const normalize = (value: string) => value.trim().toLowerCase();
  const isValid = (value: string) => normalize(value).endsWith(CAMPUS_DOMAIN);
  return { isValid, domain: CAMPUS_DOMAIN };
}
