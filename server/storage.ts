import { db } from "./db";
import {
  services, specialists, bookings, reviews, messages,
  type Service, type Specialist, type Booking, type Review, type Message,
  type insertBookingSchema, type insertMessageSchema
} from "@shared/schema";
import { and, eq, gte, lt } from "drizzle-orm";
import { z } from "zod";

export interface IStorage {
  getServices(): Promise<Service[]>;
  getSpecialists(): Promise<Specialist[]>;
  getReviews(): Promise<Review[]>;
  getBookings(): Promise<Booking[]>;
  createBooking(booking: z.infer<typeof insertBookingSchema>): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
  createReview(review: z.infer<typeof insertReviewSchema>): Promise<Review>;
  deleteReview(id: number): Promise<boolean>;
  getBookedSlots(date: string, specialistId: number): Promise<string[]>;
  getMessages(): Promise<Message[]>;
  createMessage(message: z.infer<typeof insertMessageSchema>): Promise<Message>;
  markMessageRead(id: number): Promise<Message | undefined>;
  deleteMessage(id: number): Promise<boolean>;
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

  async createReview(review: z.infer<typeof insertReviewSchema>): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async deleteReview(id: number): Promise<boolean> {
    const [deleted] = await db.delete(reviews).where(eq(reviews.id, id)).returning();
    return !!deleted;
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

  async getBookedSlots(date: string, specialistId: number): Promise<string[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await db.select({ bookingTime: bookings.bookingTime })
      .from(bookings)
      .where(
        and(
          eq(bookings.status, "confirmed"),
          eq(bookings.specialistId, specialistId),
          gte(bookings.bookingTime, startOfDay),
          lt(bookings.bookingTime, endOfDay)
        )
      );

    return result.map(b => b.bookingTime.toISOString());
  }

  async getMessages(): Promise<Message[]> {
    return await db.select().from(messages).orderBy(messages.createdAt);
  }

  async createMessage(message: z.infer<typeof insertMessageSchema>): Promise<Message> {
    const [newMsg] = await db.insert(messages).values(message).returning();
    return newMsg;
  }

  async markMessageRead(id: number): Promise<Message | undefined> {
    const [updated] = await db.update(messages).set({ isRead: true }).where(eq(messages.id, id)).returning();
    return updated;
  }

  async deleteMessage(id: number): Promise<boolean> {
    const [deleted] = await db.delete(messages).where(eq(messages.id, id)).returning();
    return !!deleted;
  }
}

export const storage = new DatabaseStorage();
