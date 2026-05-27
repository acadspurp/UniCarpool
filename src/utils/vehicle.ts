import type { Profile, VehicleInfo } from "../types/models";

export function formatVehicle(vehicle?: VehicleInfo | null): string {
  if (!vehicle) return "";
  const desc = [vehicle.color, vehicle.make, vehicle.model].filter(Boolean).join(" ");
  if (!desc) return "";
  return vehicle.plate?.trim() ? `${desc} · Plate ${vehicle.plate.trim()}` : desc;
}

export function isVehicleComplete(vehicle: {
  make: string;
  model: string;
  color: string;
  plate: string;
}): boolean {
  return Boolean(
    vehicle.make.trim() &&
      vehicle.model.trim() &&
      vehicle.color.trim() &&
      vehicle.plate.trim(),
  );
}

export function profileHasCompleteVehicle(profile: Profile | null | undefined): boolean {
  if (!profile?.vehicle) return false;
  return isVehicleComplete(profile.vehicle);
}

export function toVehicleInfo(fields: {
  make: string;
  model: string;
  color: string;
  plate: string;
}): VehicleInfo {
  return {
    make: fields.make.trim().toUpperCase(),
    model: fields.model.trim().toUpperCase(),
    color: fields.color.trim().toUpperCase(),
    plate: fields.plate.trim().toUpperCase(),
  };
}
