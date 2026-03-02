import { db } from "./db";
import {
  services, specialists, bookings, reviews,
  type Service, type Specialist, type Booking, type Review,
  type insertBookingSchema
} from "@shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export interface IStorage {
  getServices(): Promise<Service[]>;
  getSpecialists(): Promise<Specialist[]>;
  getReviews(): Promise<Review[]>;
  getBookings(): Promise<Booking[]>;
  createBooking(booking: z.infer<typeof insertBookingSchema>): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getServices(): Promise<Service[]> {
    return await db.select().from(services);
  }

  async getSpecialists(): Promise<Specialist[]> {
    return await db.select().from(specialists);
  }

  async getReviews(): Promise<Review[]> {
    return await db.select().from(reviews);
  }

  async getBookings(): Promise<Booking[]> {
    return await db.select().from(bookings);
  }

  async createBooking(booking: z.infer<typeof insertBookingSchema>): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const [updated] = await db.update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
