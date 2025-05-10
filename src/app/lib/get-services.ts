import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase"; // usa la config de tu proyecto
import type { Service } from "@/types";

export async function getServices(): Promise<Service[]> {
  const snapshot = await getDocs(collection(db, "servicios"));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Omit<Service, "id">),
  }));
}