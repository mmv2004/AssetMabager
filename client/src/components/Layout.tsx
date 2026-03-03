import { Link, useLocation } from "wouter";
import { Mic2, Calendar as CalendarIcon, MapPin, ShieldCheck, Phone, Mail, Instagram, Twitter } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navLinks = [
    { href: "/services", label: "Услуги", icon: Mic2 },
    { href: "/book", label: "Запись", icon: CalendarIcon },
    { href: "/contacts", label: "Контакты", icon: MapPin },
    { href: "/admin", label: "Админ", icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 glass-panel border-x-0 border-t-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Mic2 className="w-6 h-6 text-primary" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white group-hover:text-primary transition-colors">
              AURA<span className="text-primary">STUDIO</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary flex items-center gap-2",
                  location === link.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex md:hidden">
             {/* Mobile menu could go here, simplified for brevity */}
             <Link href="/book" className={buttonVariants({ variant: "default", size: "sm" })}>
                Записаться
             </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/50 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Mic2 className="w-6 h-6 text-primary" />
              <span className="font-display font-bold text-xl text-white">
                AURA<span className="text-primary">STUDIO</span>
              </span>
            </Link>
            <p className="text-muted-foreground max-w-sm">
              Профессиональная запись, сведение и мастеринг в творческой и уютной атмосфере. Ваш звук на новом уровне.
            </p>
          </div>
          
          <div>
            <h4 className="font-display font-semibold text-white mb-4">Контакты</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> +7 (999) 123-45-67</li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> book@aurastudios.ru</li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> ул. Музыкальная, 123, Москва</li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4">Соцсети</h4>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="rounded-full bg-white/5 border-white/10 hover:bg-primary/20 hover:text-primary hover:border-primary/50">
                <Instagram className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full bg-white/5 border-white/10 hover:bg-primary/20 hover:text-primary hover:border-primary/50">
                <Twitter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
