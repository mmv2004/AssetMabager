import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { useServices } from "@/hooks/use-services";
import { useSpecialists } from "@/hooks/use-specialists";
import { useCreateBooking } from "@/hooks/use-bookings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { CheckCircle2, ChevronRight, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";

const TIME_SLOTS = ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];

export default function Book() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialServiceId = searchParams.get("serviceId");

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    serviceId: initialServiceId ? parseInt(initialServiceId) : 0,
    specialistId: undefined as number | undefined,
    date: undefined as Date | undefined,
    time: "",
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    clientComment: "",
  });

  const { data: services, isLoading: loadingServices } = useServices();
  const { data: specialists, isLoading: loadingSpecialists } = useSpecialists();
  const createBooking = useCreateBooking();

  const dateStr = formData.date ? format(formData.date, "yyyy-MM-dd") : null;

  const { data: bookedSlots = [] } = useQuery<string[]>({
    queryKey: ["/api/booked-slots", dateStr, formData.specialistId ?? null],
    enabled: !!dateStr && !!formData.specialistId,
    staleTime: 0,
    queryFn: async () => {
      const res = await fetch(
        `/api/booked-slots?date=${dateStr}&specialistId=${formData.specialistId}`,
        { credentials: "include" }
      );
      if (!res.ok) return [];
      return res.json();
    },
  });

  useEffect(() => {
    if (initialServiceId && formData.serviceId === parseInt(initialServiceId) && step === 1) {
      setStep(2);
    }
  }, [initialServiceId, formData.serviceId, step]);

  const updateForm = (key: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (step === 4) {
      if (formData.clientName.trim().length < 2) newErrors.clientName = "Имя слишком короткое";
      if (!/^\+?[0-9\s-]{10,}$/.test(formData.clientPhone)) newErrors.clientPhone = "Некорректный номер телефона";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail)) newErrors.clientEmail = "Некорректный email";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(s => Math.min(s + 1, 5));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    if (!formData.serviceId || !formData.date || !formData.time || !formData.clientName || !formData.clientPhone || !formData.clientEmail) {
      return;
    }

    const [hours, minutes] = formData.time.split(':').map(Number);
    const bookingTime = new Date(formData.date);
    bookingTime.setHours(hours, minutes, 0, 0);

    try {
      await createBooking.mutateAsync({
        serviceId: formData.serviceId,
        specialistId: formData.specialistId || undefined,
        bookingTime,
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        clientEmail: formData.clientEmail,
        clientComment: formData.clientComment || undefined,
      });
      setStep(5);
    } catch (err: any) {
      if (err.message) {
        setErrors({ submit: err.message });
      }
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return formData.serviceId > 0;
      case 2: return true;
      case 3: return !!formData.date && !!formData.time;
      case 4: return true; // Разрешаем нажать "Подтвердить", чтобы сработала валидация с ошибками
      default: return true;
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        
        {step < 5 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              {['Услуга', 'Специалист', 'Дата и время', 'Детали'].map((label, i) => (
                <div key={label} className={cn(
                  "text-sm font-medium transition-colors",
                  step > i + 1 ? "text-primary" : step === i + 1 ? "text-white" : "text-muted-foreground"
                )}>
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{i + 1}</span>
                </div>
              ))}
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="glass-panel p-6 sm:p-10 rounded-3xl min-h-[500px] flex flex-col">
          
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1">
              <h2 className="text-3xl font-bold mb-8">Выберите услугу</h2>
              {loadingServices ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse"/>)}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {services?.map(s => (
                    <div 
                      key={s.id}
                      onClick={() => updateForm("serviceId", s.id)}
                      className={cn(
                        "p-6 rounded-xl border cursor-pointer transition-all hover:-translate-y-1",
                        formData.serviceId === s.id 
                          ? "bg-primary/10 border-primary" 
                          : "bg-white/5 border-white/10 hover:border-white/30"
                      )}
                    >
                      <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{s.durationMins} мин</span>
                        <span className="font-semibold text-primary">{s.price} ₽</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Выберите специалиста</h2>
                  <p className="text-muted-foreground">Опционально. Выберите инженера или мы назначим свободного.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div 
                  onClick={() => updateForm("specialistId", undefined)}
                  className={cn(
                    "p-6 rounded-xl border cursor-pointer transition-all flex items-center justify-center min-h-[120px]",
                    !formData.specialistId 
                      ? "bg-primary/10 border-primary" 
                      : "bg-white/5 border-white/10 hover:border-white/30"
                  )}
                >
                  <h3 className="text-lg font-bold">Любой свободный</h3>
                </div>
                
                {specialists?.map(s => (
                  <div 
                    key={s.id}
                    onClick={() => updateForm("specialistId", s.id)}
                    className={cn(
                      "p-6 rounded-xl border cursor-pointer transition-all flex items-center gap-4",
                      formData.specialistId === s.id 
                        ? "bg-primary/10 border-primary" 
                        : "bg-white/5 border-white/10 hover:border-white/30"
                    )}
                  >
                    <div className="w-16 h-16 rounded-full bg-white/10 overflow-hidden flex-shrink-0 border border-white/10">
                      {s.imageUrl ? (
                        <img src={s.imageUrl} alt={s.name} className="w-full h-full object-cover" />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center bg-black/40 text-xl font-bold">{s.name.charAt(0)}</div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{s.name}</h3>
                      <p className="text-sm text-primary">{s.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1">
              <h2 className="text-3xl font-bold mb-8">Выберите дату и время</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-center">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(d) => {
                      updateForm("date", d);
                      updateForm("time", "");
                    }}
                    disabled={(date) => date < new Date() || date.getDay() === 0}
                    className="bg-transparent"
                  />
                </div>
                
                <div className="bg-white/5 p-6 rounded-xl border border-white/10 flex flex-col">
                  <h3 className="font-semibold mb-4 text-lg">
                    {formData.date ? format(formData.date, 'EEEE, d MMMM', { locale: ru }) : "Сначала выберите дату"}
                  </h3>
                  
                  {formData.date ? (
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {TIME_SLOTS.map(time => {
                        const isBooked = bookedSlots.includes(time);
                        return (
                          <Button
                            key={time}
                            variant={formData.time === time ? "default" : "outline"}
                            disabled={isBooked}
                            className={cn(
                              "w-full h-12 text-lg rounded-xl",
                              formData.time !== time && !isBooked && "bg-transparent border-white/20 hover:border-primary/50",
                              isBooked && "opacity-30 cursor-not-allowed line-through"
                            )}
                            onClick={() => !isBooked && updateForm("time", time)}
                          >
                            {time}
                          </Button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                      Доступное время появится здесь
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1">
              <h2 className="text-3xl font-bold mb-8">Ваши данные</h2>
              <div className="space-y-5 max-w-2xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className={cn(errors.clientName && "text-destructive")}>ФИО</Label>
                    <Input 
                      placeholder="Иван Иванов" 
                      value={formData.clientName}
                      onChange={e => {
                        updateForm("clientName", e.target.value);
                        if (errors.clientName) setErrors(prev => ({ ...prev, clientName: "" }));
                      }}
                      className={cn("h-12 bg-black/20 border-white/10 focus-visible:border-primary", errors.clientName && "border-destructive")}
                    />
                    {errors.clientName && <p className="text-xs text-destructive">{errors.clientName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className={cn(errors.clientPhone && "text-destructive")}>Номер телефона</Label>
                    <Input 
                      placeholder="+7 (999) 123-45-67" 
                      value={formData.clientPhone}
                      onChange={e => {
                        updateForm("clientPhone", e.target.value);
                        if (errors.clientPhone) setErrors(prev => ({ ...prev, clientPhone: "" }));
                      }}
                      className={cn("h-12 bg-black/20 border-white/10 focus-visible:border-primary", errors.clientPhone && "border-destructive")}
                    />
                    {errors.clientPhone && <p className="text-xs text-destructive">{errors.clientPhone}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className={cn(errors.clientEmail && "text-destructive")}>Email</Label>
                  <Input 
                    type="email"
                    placeholder="ivan@example.ru" 
                    value={formData.clientEmail}
                    onChange={e => {
                      updateForm("clientEmail", e.target.value);
                      if (errors.clientEmail) setErrors(prev => ({ ...prev, clientEmail: "" }));
                    }}
                    className={cn("h-12 bg-black/20 border-white/10 focus-visible:border-primary", errors.clientEmail && "border-destructive")}
                  />
                  {errors.clientEmail && <p className="text-xs text-destructive">{errors.clientEmail}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Комментарий к проекту (опционально)</Label>
                  <Textarea 
                    placeholder="Расскажите о треке, референсах или оборудовании, которое хотите использовать..." 
                    value={formData.clientComment}
                    onChange={e => updateForm("clientComment", e.target.value)}
                    className="min-h-[120px] bg-black/20 border-white/10 focus-visible:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="animate-in zoom-in-95 duration-500 flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="w-24 h-24 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-4xl font-bold mb-4">Заявка принята!</h2>
              <p className="text-xl text-muted-foreground max-w-md mx-auto mb-8">
                Ваш запрос на сессию {formData.date && format(formData.date, 'd MMMM', { locale: ru })} в {formData.time} отправлен. Мы свяжемся с вами в ближайшее время для подтверждения.
              </p>
              <Button size="lg" onClick={() => setLocation("/")} className="rounded-xl px-8 h-14">
                Вернуться на главную
              </Button>
            </div>
          )}

          {step < 5 && (
            <div className="flex items-center justify-between mt-auto pt-8 border-t border-white/10">
              <Button 
                variant="ghost" 
                onClick={handlePrev}
                disabled={step === 1}
                className="text-muted-foreground hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Назад
              </Button>
              
              {step < 4 ? (
                <Button 
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="rounded-xl px-8"
                >
                  Далее <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={!isStepValid() || createBooking.isPending}
                  className="rounded-xl px-8 bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/25"
                >
                  {createBooking.isPending ? "Отправка..." : "Подтвердить запись"}
                </Button>
              )}
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}
