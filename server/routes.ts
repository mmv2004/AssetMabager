import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { db } from "./db";
import { services, specialists, reviews, insertMessageSchema } from "@shared/schema";

async function seedDatabase() {
  const existingServices = await storage.getServices();
  if (existingServices.length === 0) {
    await db.insert(services).values([
      {
        title: "Запись вокала",
        description: "Профессиональная запись вокала с использованием топовых микрофонов в акустически подготовленной комнате.",
        price: 2000,
        durationMins: 60,
      },
      {
        title: "Сведение трека",
        description: "Балансировка частот, эквализация, компрессия, добавление эффектов (реверб, дилей) для получения коммерческого звучания.",
        price: 5000,
        durationMins: 180,
      },
      {
        title: "Мастеринг",
        description: "Финальная обработка трека, выравнивание громкости под стандарты стриминговых площадок.",
        price: 3000,
        durationMins: 120,
      },
      {
        title: "Аренда студии",
        description: "Аренда студии с оборудованием без звукорежиссера для самостоятельной работы.",
        price: 1500,
        durationMins: 60,
      }
    ]);
  }

  const existingSpecialists = await storage.getSpecialists();
  if (existingSpecialists.length === 0) {
    await db.insert(specialists).values([
      {
        name: "Алексей Иванов",
        role: "Главный звукорежиссер",
        bio: "Опыт работы более 10 лет. Работал с известными артистами. Эксперт в сведении и мастеринге.",
      },
      {
        name: "Мария Смирнова",
        role: "Звукорежиссер записи",
        bio: "Специалист по записи вокала и живых инструментов. Создает комфортную атмосферу на студии.",
      }
    ]);
  }

  const existingReviews = await storage.getReviews();
  if (existingReviews.length === 0) {
    await db.insert(reviews).values([
      {
        clientName: "Иван П.",
        content: "Отличная студия! Записали вокал за пару часов, качество звука на высоте. Очень уютная атмосфера.",
        rating: 5,
      },
      {
        clientName: "Анна К.",
        content: "Делали сведение и мастеринг альбома. Результат превзошел ожидания, треки звучат круто!",
        rating: 5,
      },
      {
        clientName: "Группа 'Эхо'",
        content: "Арендуем студию для репетиций. Топовое оборудование и хороший акустический зал.",
        rating: 4,
      }
    ]);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Seed the database
  seedDatabase().catch(console.error);

  app.get(api.services.list.path, async (req, res) => {
    const servicesList = await storage.getServices();
    res.json(servicesList);
  });

  app.get(api.specialists.list.path, async (req, res) => {
    const specialistsList = await storage.getSpecialists();
    res.json(specialistsList);
  });

  app.get(api.reviews.list.path, async (req, res) => {
    const reviewsList = await storage.getReviews();
    res.json(reviewsList);
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const input = insertReviewSchema.parse(req.body);
      const newReview = await storage.createReview(input);
      res.status(201).json(newReview);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/reviews/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteReview(id);
    if (!success) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.sendStatus(204);
  });

  app.post("/api/admin/change-password", async (req, res) => {
    const { username, newPassword } = req.body;
    // В упрощенном режиме мы просто обновляем в БД
    // Для полноценной системы нужно хеширование и сессии
    const [updated] = await db.update(services).set({}).returning(); // Заглушка, так как у нас DatabaseStorage
    // Но так как у нас нет метода в IStorage, добавим его или сделаем через db напрямую
    const [user] = await db.select().from(db.getSchema().users).where(eq(db.getSchema().users.username, username));
    if (!user) return res.status(404).json({ message: "User not found" });
    
    await db.update(db.getSchema().users)
      .set({ password: newPassword })
      .where(eq(db.getSchema().users.username, username));
    
    res.json({ message: "Password updated" });
  });

  app.get("/api/booked-slots", async (req, res) => {
    const { date, specialistId } = req.query;
    if (!date || typeof date !== "string") {
      return res.status(400).json({ message: "date is required" });
    }
    if (!specialistId || typeof specialistId !== "string" || isNaN(parseInt(specialistId))) {
      return res.json([]);
    }
    const slots = await storage.getBookedSlots(date, parseInt(specialistId));
    res.json(slots);
  });

  app.get(api.bookings.list.path, async (req, res) => {
    const bookingsList = await storage.getBookings();
    res.json(bookingsList);
  });

  app.post(api.bookings.create.path, async (req, res) => {
    try {
      const input = api.bookings.create.input.parse({
        ...req.body,
        bookingTime: new Date(req.body.bookingTime),
      });
      const newBooking = await storage.createBooking(input);
      res.status(201).json(newBooking);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.bookings.updateStatus.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = api.bookings.updateStatus.input.parse(req.body);
      
      const updated = await storage.updateBookingStatus(id, status);
      if (!updated) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      throw err;
    }
  });

  app.get("/api/messages", async (req, res) => {
    const list = await storage.getMessages();
    res.json(list);
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const input = insertMessageSchema.parse(req.body);
      const msg = await storage.createMessage(input);
      res.status(201).json(msg);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/messages/:id/read", async (req, res) => {
    const id = parseInt(req.params.id);
    const updated = await storage.markMessageRead(id);
    if (!updated) return res.status(404).json({ message: "Message not found" });
    res.json(updated);
  });

  app.delete("/api/messages/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteMessage(id);
    if (!success) return res.status(404).json({ message: "Message not found" });
    res.sendStatus(204);
  });

  return httpServer;
}
