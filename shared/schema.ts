import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  durationMins: integer("duration_mins").notNull(),
  imageUrl: text("image_url"),
});

export const specialists = pgTable("specialists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  bio: text("bio").notNull(),
  imageUrl: text("image_url"),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").references(() => services.id).notNull(),
  specialistId: integer("specialist_id").references(() => specialists.id),
  bookingTime: timestamp("booking_time").notNull(),
  clientName: text("client_name").notNull(),
  clientPhone: text("client_phone").notNull(),
  clientEmail: text("client_email").notNull(),
  clientComment: text("client_comment"),
  status: text("status").default("new").notNull(), // new, confirmed, rejected
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  content: text("content").notNull(),
  rating: integer("rating").notNull(),
});

export const insertServiceSchema = createInsertSchema(services).omit({ id: true });
export const insertSpecialistSchema = createInsertSchema(specialists).omit({ id: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, status: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true });

export type Service = typeof services.$inferSelect;
export type Specialist = typeof specialists.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Review = typeof reviews.$inferSelect;
