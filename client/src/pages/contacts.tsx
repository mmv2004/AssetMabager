import { Layout } from "@/components/Layout";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Contacts() {
  const { toast } = useToast();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending a message
    toast({
      title: "Сообщение отправлено",
      description: "Спасибо за обращение! Мы ответим вам в течение 24 часов.",
    });
    (e.target as HTMLFormElement).reset();
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Свяжитесь с нами</h1>
          <p className="text-lg text-muted-foreground">
            Есть вопросы по оборудованию, ценам или бронированию? Отправьте нам сообщение или загляните в студию.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Contact Info & Map */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Адрес студии</h3>
                  <p className="text-muted-foreground text-sm">ул. Музыкальная, 123, офис 400<br/>Москва, 100001</p>
                </div>
              </div>
              
              <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Телефон</h3>
                  <p className="text-muted-foreground text-sm">+7 (999) 123-45-67<br/>Пн-Вс, 10:00 - 22:00</p>
                </div>
              </div>
              
              <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Email</h3>
                  <p className="text-muted-foreground text-sm">book@aurastudio.ru<br/>info@aurastudio.ru</p>
                </div>
              </div>
              
              <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Время работы</h3>
                  <p className="text-muted-foreground text-sm">Ежедневно 10:00 - 22:00<br/>24/7 по договоренности</p>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="w-full h-64 rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative group">
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                <span className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-5 h-5" /> Интерактивная карта
                </span>
              </div>
              {/* aesthetic map background representation */}
              <div className="w-full h-full opacity-20 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center" />
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-8 md:p-10 rounded-3xl"
          >
            <h2 className="text-2xl font-bold mb-6">Отправить сообщение</h2>
            <form onSubmit={handleSendMessage} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Имя</Label>
                <Input id="name" required placeholder="Ваше имя" className="h-12 bg-black/20 border-white/10 focus-visible:border-primary" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required placeholder="your@email.ru" className="h-12 bg-black/20 border-white/10 focus-visible:border-primary" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Тема</Label>
                <Input id="subject" required placeholder="Чем мы можем помочь?" className="h-12 bg-black/20 border-white/10 focus-visible:border-primary" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Сообщение</Label>
                <Textarea id="message" required placeholder="Напишите ваше сообщение здесь..." className="min-h-[150px] bg-black/20 border-white/10 focus-visible:border-primary" />
              </div>
              
              <Button type="submit" size="lg" className="w-full h-14 rounded-xl gap-2 text-lg shadow-lg shadow-primary/20">
                Отправить <Send className="w-5 h-5" />
              </Button>
            </form>
          </motion.div>

        </div>
      </div>
    </Layout>

        </div>
      </div>
    </Layout>
  );
}
