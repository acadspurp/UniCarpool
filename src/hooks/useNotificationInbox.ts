import { useCallback, useEffect, useMemo, useState } from "react";
import { getProfileOnce } from "../services/profile";
import {
  loadNotificationInbox,
  saveNotificationInbox,
} from "../services/notificationInboxStorage";
import { mergeNotificationLogs } from "../utils/notificationLogs";
import type { Booking } from "../types/models";

export function useNotificationInbox(
  uid: string | undefined,
  riderBookings: Booking[],
  driverBookings: Booking[],
) {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [riderNames, setRiderNames] = useState<Record<string, string>>({});
  const [inboxReady, setInboxReady] = useState(false);

  useEffect(() => {
    if (!uid) {
      setReadIds(new Set());
      setDeletedIds(new Set());
      setInboxReady(false);
      return;
    }
    let cancelled = false;
    loadNotificationInbox(uid).then((state) => {
      if (cancelled) return;
      setReadIds(new Set(state.readIds));
      setDeletedIds(new Set(state.deletedIds));
      setInboxReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [uid]);

  useEffect(() => {
    const riderIds = [...new Set(driverBookings.map((b) => b.riderId))];
    if (riderIds.length === 0) {
      setRiderNames({});
      return;
    }
    let cancelled = false;
    (async () => {
      const names: Record<string, string> = {};
      await Promise.all(
        riderIds.map(async (id) => {
          const profile = await getProfileOnce(id);
          names[id] = profile?.fullName?.trim() || "Rider";
        }),
      );
      if (!cancelled) setRiderNames(names);
    })();
    return () => {
      cancelled = true;
    };
  }, [driverBookings]);

  const persist = useCallback(
    async (nextRead: Set<string>, nextDeleted: Set<string>) => {
      if (!uid) return;
      await saveNotificationInbox(uid, {
        readIds: [...nextRead],
        deletedIds: [...nextDeleted],
      });
    },
    [uid],
  );

  const allLogs = useMemo(
    () => mergeNotificationLogs(riderBookings, driverBookings, riderNames),
    [riderBookings, driverBookings, riderNames],
  );

  const visibleLogs = useMemo(
    () => allLogs.filter((item) => !deletedIds.has(item.id)),
    [allLogs, deletedIds],
  );

  const unreadCount = useMemo(
    () => visibleLogs.filter((item) => !readIds.has(item.id)).length,
    [visibleLogs, readIds],
  );

  const markAsRead = useCallback(
    async (ids: string[]) => {
      if (!ids.length) return;
      const nextRead = new Set(readIds);
      ids.forEach((id) => nextRead.add(id));
      setReadIds(nextRead);
      await persist(nextRead, deletedIds);
    },
    [readIds, deletedIds, persist],
  );

  const markAllVisibleAsRead = useCallback(async () => {
    if (!visibleLogs.length) return;
    const nextRead = new Set(readIds);
    visibleLogs.forEach((item) => nextRead.add(item.id));
    setReadIds(nextRead);
    await persist(nextRead, deletedIds);
  }, [visibleLogs, readIds, deletedIds, persist]);

  const deleteNotification = useCallback(
    async (id: string) => {
      const nextDeleted = new Set(deletedIds);
      nextDeleted.add(id);
      const nextRead = new Set(readIds);
      nextRead.add(id);
      setDeletedIds(nextDeleted);
      setReadIds(nextRead);
      await persist(nextRead, nextDeleted);
    },
    [deletedIds, readIds, persist],
  );

  const isUnread = useCallback((id: string) => !readIds.has(id), [readIds]);

  return {
    visibleLogs,
    unreadCount,
    inboxReady,
    markAsRead,
    markAllVisibleAsRead,
    deleteNotification,
    isUnread,
  };
}
