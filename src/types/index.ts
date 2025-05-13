import type { Timestamp } from "firebase/firestore";

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface Booking {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  date: Timestamp;
  time: string;
  comments: string;
  status: "pending" | "confirmed" | "paid" | "completed" | "cancelled";
  createdAt: Timestamp;
  paymentIntentId?: string;
}

