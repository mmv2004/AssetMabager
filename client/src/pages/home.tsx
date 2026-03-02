import { Link } from "wouter";
import { ArrowRight, Star, Play, Disc, Headphones } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useServices } from "@/hooks/use-services";
import { useReviews } from "@/hooks/use-reviews";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";

export default function Home() {
  const { data: services, isLoading: loadingServices } = useServices();
  const { data: reviews, isLoading: loadingReviews } = useReviews();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* landing page hero recording studio mixing board */}
          <img 
            src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop" 
            alt="Recording Studio Background" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Now accepting bookings for Q4
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
              Where Your Sound <br/>
              <span className="text-gradient">Finds Its Soul</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Premium analog gear meets modern digital precision. 
              Step into a creative sanctuary designed to bring your musical vision to life.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/book" 
                className={buttonVariants({ size: "lg", className: "w-full sm:w-auto text-lg px-8 h-14 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all" })}
              >
                Book a Session
              </Link>
              <Link 
                href="/services" 
                className={buttonVariants({ variant: "outline", size: "lg", className: "w-full sm:w-auto text-lg px-8 h-14 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 transition-all" })}
              >
                Explore Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-24 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Disc, title: "Industry Standard Gear", desc: "Neve, SSL, and Universal Audio preamps and outboard gear." },
            { icon: Headphones, title: "Acoustically Treated", desc: "Perfectly tuned control and live rooms for pristine captures." },
            { icon: Play, title: "Expert Engineers", desc: "Platinum-awarded staff dedicated to your artistic vision." },
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel p-8 rounded-2xl hover-glow group"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <item.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Popular Services</h2>
            <p className="text-muted-foreground text-lg">Everything you need from tracking to final master.</p>
          </div>
          <Link href="/services" className="hidden sm:flex items-center gap-2 text-primary hover:text-primary/80 font-medium">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingServices ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services?.slice(0, 3).map((service) => (
              <div key={service.id} className="glass-panel p-6 rounded-2xl flex flex-col hover-glow transition-all">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold">{service.title}</h3>
                  <span className="font-display font-bold text-primary text-xl">${service.price}</span>
                </div>
                <p className="text-muted-foreground flex-1 mb-8">{service.description}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                  <span className="text-sm text-muted-foreground">{service.durationMins} mins</span>
                  <Link href={`/book?serviceId=${service.id}`} className={buttonVariants({ variant: "ghost", className: "text-primary hover:text-primary hover:bg-primary/10" })}>
                    Book Session
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Reviews */}
      <section className="py-24 bg-white/[0.02] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Artist Testimonials</h2>
          
          {loadingReviews ? (
             <div className="flex justify-center"><div className="h-40 w-full max-w-2xl bg-white/5 animate-pulse rounded-2xl" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews?.map((review) => (
                <div key={review.id} className="glass-panel p-6 rounded-2xl">
                  <div className="flex gap-1 mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-foreground/90 italic mb-6">"{review.content}"</p>
                  <p className="font-bold text-sm text-muted-foreground">— {review.clientName}</p>
                </div>
              ))}
              {!reviews?.length && (
                <div className="col-span-full text-center text-muted-foreground py-12">
                  No reviews yet. Be the first to record with us!
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
