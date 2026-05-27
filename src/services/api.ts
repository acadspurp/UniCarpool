import { createOrUpdateProfile } from "./profile";
import { signIn, signUp } from "./auth";
import { postRide, subscribeOpenRides } from "./rides";
import { requestBooking, updateBookingStatus } from "./bookings";
import { sendMessage, subscribeToChat } from "./chat";

export {
  signUp,
  signIn,
  createOrUpdateProfile,
  postRide,
  requestBooking,
  updateBookingStatus,
  sendMessage,
  subscribeToChat,
};

export function searchRides(
  destinationName: string | undefined,
  callback: Parameters<typeof subscribeOpenRides>[0],
) {
  return subscribeOpenRides(callback, destinationName);
}
