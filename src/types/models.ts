export type CampusRole = "student" | "faculty" | "staff";

export type Profile = {
  uid: string;
  fullName: string;
  email: string;
  campusRole: CampusRole;
  department: string;
  phone: string;
  photoURL?: string;
  isVerifiedCampus: boolean;
  vehicle?: {
    make: string;
    model: string;
    color: string;
    plate: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type Ride = {
  id?: string;
  driverId: string;
  origin: { name: string; lat: number; lng: number };
  destination: { name: string; lat: number; lng: number };
  departureTime: string;
  availableSeats: number;
  priceShareNote?: string;
  notes?: string;
  status: "open" | "full" | "cancelled" | "completed";
  routePolyline?: string;
  createdAt: string;
  updatedAt: string;
};

export type Booking = {
  id?: string;
  rideId: string;
  driverId: string;
  riderId: string;
  seatsRequested: number;
  status: "pending" | "accepted" | "rejected" | "cancelled" | "completed";
  pickupNote?: string;
  createdAt: string;
  updatedAt: string;
};

export type ChatMessage = {
  id?: string;
  senderId: string;
  text: string;
  createdAt: string;
  readBy: string[];
};
