import type { CampusRole } from "../types/models";

export const CAMPUS_ROLE_OPTIONS: { value: CampusRole; label: string }[] = [
  { value: "student", label: "Student" },
  { value: "faculty", label: "Professor" },
  { value: "staff", label: "Staff" },
];

export function formatCampusRole(role: CampusRole | string | undefined): string {
  const match = CAMPUS_ROLE_OPTIONS.find((o) => o.value === role);
  return match?.label ?? "Student";
}
