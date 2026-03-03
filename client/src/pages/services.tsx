import { Layout } from "@/components/Layout";
import { useServices } from "@/hooks/use-services";
import { Button, buttonVariants } from "@/components/ui/button";
import { Link } from "wouter";
import { Clock, DollarSign, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Services() {
  const { data: services, isLoading } = useServices();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Услуги студии</h1>
          <p className="text-lg text-muted-foreground">
            От демо-записей до готовых хитов. Наша студия и опытные инженеры помогут вашему звуку раскрыться на максимум.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-white/5 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services?.map((service, index) => (
              <motion.div 
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-panel p-8 rounded-3xl hover-glow transition-all flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-white">{service.title}</h3>
                  <div className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
                    {service.price} ₽
                  </div>
                </div>
                
                <p className="text-muted-foreground leading-relaxed mb-8 flex-1">
                  {service.description}
                </p>
                
                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-5 h-5" />
                    <span>{service.durationMins} минут</span>
                  </div>
                  
                  <Link 
                    href={`/book?serviceId=${service.id}`}
                    className={buttonVariants({ variant: "default", className: "rounded-xl gap-2" })}
                  >
                    Записаться <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
            
            {!services?.length && (
              <div className="col-span-2 text-center py-20 text-muted-foreground">
                <p>Услуги пока не добавлены.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
