// src/types.ts
import { Timestamp } from "firebase/firestore";

export interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  date: Date;
  time: string;
  comments?: string;
  status: "pending" | "paid" | "done";
  createdAt: Timestamp;
  paymentIntentId?: string;
}
export type Service = {
  id: string;
  name: string;
  price: number;
  active: boolean;
  description: string;
};