import type { Booking } from "../types/models";

export type NotificationLogItem = {
  id: string;
  title: string;
  detail: string;
  sortKey: string;
};

function toSortKey(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "seconds" in value) {
    const sec = (value as { seconds: number }).seconds;
    return new Date(sec * 1000).toISOString();
  }
  return String(value);
}

export function bookingToNotificationLog(
  booking: Booking,
  asDriver: boolean,
  riderName?: string,
): NotificationLogItem {
  const statusLabels: Record<Booking["status"], string> = {
    pending: asDriver ? "New seat request" : "Request sent",
    accepted: asDriver ? "You accepted a rider" : "Request accepted",
    rejected: asDriver ? "Request declined" : "Request declined",
    cancelled: "Booking cancelled",
    completed: "Ride completed",
  };
  const detailLabels: Record<Booking["status"], string> = {
    pending: asDriver
      ? `${riderName || "A rider"} requested a seat on your ride.`
      : "Waiting for the driver to respond.",
    accepted: asDriver
      ? `${riderName || "A rider"} is confirmed for your trip.`
      : "You are confirmed for this carpool.",
    rejected: asDriver
      ? `You declined ${riderName || "a rider"}'s request.`
      : "The driver declined your request.",
    cancelled: "This booking was cancelled.",
    completed: "This trip is marked completed.",
  };
  const ts = booking.updatedAt || booking.createdAt;
  return {
    id: `${asDriver ? "d" : "r"}-${booking.id}`,
    title: statusLabels[booking.status],
    detail: detailLabels[booking.status],
    sortKey: toSortKey(ts),
  };
}

export function mergeNotificationLogs(
  rider: Booking[],
  driver: Booking[],
  riderNames: Record<string, string>,
): NotificationLogItem[] {
  const items = [
    ...rider.map((b) => bookingToNotificationLog(b, false)),
    ...driver.map((b) => bookingToNotificationLog(b, true, riderNames[b.riderId])),
  ];
  return items.sort((a, b) => b.sortKey.localeCompare(a.sortKey));
}
