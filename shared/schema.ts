import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
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

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isRead: boolean("is_read").default(false).notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true, isRead: true }).extend({
  email: z.string().email("Некорректный email"),
  name: z.string().min(2, "Имя слишком короткое"),
  subject: z.string().min(1, "Укажите тему"),
  content: z.string().min(5, "Сообщение слишком короткое"),
});

export type Message = typeof messages.$inferSelect;

export const insertServiceSchema = createInsertSchema(services).omit({ id: true });
export const insertSpecialistSchema = createInsertSchema(specialists).omit({ id: true });
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type User = typeof users.$inferSelect;

export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, status: true }).extend({
  clientEmail: z.string().email("Некорректный email"),
  clientPhone: z.string().min(10, "Номер телефона слишком короткий"),
  clientName: z.string().min(2, "Имя слишком короткое"),
});
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true });

export type Service = typeof services.$inferSelect;
export type Specialist = typeof specialists.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Review = typeof reviews.$inferSelect;
