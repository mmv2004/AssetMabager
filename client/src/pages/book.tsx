import { useState, useEffect } from "react";
import { useLocation } from "wouter";
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

  // If service ID is in URL and valid, we can preselect and move to step 2 visually
  // but let's just pre-fill the form state.
  useEffect(() => {
    if (initialServiceId && formData.serviceId === parseInt(initialServiceId) && step === 1) {
      setStep(2);
    }
  }, [initialServiceId, formData.serviceId, step]);

  const updateForm = (key: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => setStep(s => Math.min(s + 1, 5));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!formData.serviceId || !formData.date || !formData.time || !formData.clientName || !formData.clientPhone || !formData.clientEmail) {
      return; // Basic validation
    }

    // Combine date and time
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
      setStep(5); // Success step
    } catch (err) {
      // Error handled by mutation hook's toast
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return formData.serviceId > 0;
      case 2: return true; // Specialist is optional
      case 3: return !!formData.date && !!formData.time;
      case 4: return formData.clientName.trim() && formData.clientPhone.trim() && formData.clientEmail.includes('@');
      default: return true;
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        
        {/* Progress Bar */}
        {step < 5 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              {['Service', 'Specialist', 'Date & Time', 'Details'].map((label, i) => (
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
          
          {/* STEP 1: Service */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1">
              <h2 className="text-3xl font-bold mb-8">Select a Service</h2>
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
                        <span>{s.durationMins} mins</span>
                        <span className="font-semibold text-primary">${s.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Specialist */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Select a Specialist</h2>
                  <p className="text-muted-foreground">Optional. Choose an engineer or let us assign one.</p>
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
                  <h3 className="text-lg font-bold">Any Available</h3>
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

          {/* STEP 3: Date & Time */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1">
              <h2 className="text-3xl font-bold mb-8">Choose Date & Time</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-center">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(d) => {
                      updateForm("date", d);
                      updateForm("time", ""); // Reset time on date change
                    }}
                    disabled={(date) => date < new Date() || date.getDay() === 0}
                    className="bg-transparent"
                  />
                </div>
                
                <div className="bg-white/5 p-6 rounded-xl border border-white/10 flex flex-col">
                  <h3 className="font-semibold mb-4 text-lg">
                    {formData.date ? format(formData.date, 'EEEE, MMMM d') : "Select a date first"}
                  </h3>
                  
                  {formData.date ? (
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {TIME_SLOTS.map(time => (
                        <Button
                          key={time}
                          variant={formData.time === time ? "default" : "outline"}
                          className={cn(
                            "w-full h-12 text-lg rounded-xl",
                            formData.time !== time && "bg-transparent border-white/20 hover:border-primary/50"
                          )}
                          onClick={() => updateForm("time", time)}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                      Available times will appear here
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Details */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1">
              <h2 className="text-3xl font-bold mb-8">Your Details</h2>
              <div className="space-y-5 max-w-2xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input 
                      placeholder="Rick Rubin" 
                      value={formData.clientName}
                      onChange={e => updateForm("clientName", e.target.value)}
                      className="h-12 bg-black/20 border-white/10 focus-visible:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input 
                      placeholder="(555) 123-4567" 
                      value={formData.clientPhone}
                      onChange={e => updateForm("clientPhone", e.target.value)}
                      className="h-12 bg-black/20 border-white/10 focus-visible:border-primary"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input 
                    type="email"
                    placeholder="rick@example.com" 
                    value={formData.clientEmail}
                    onChange={e => updateForm("clientEmail", e.target.value)}
                    className="h-12 bg-black/20 border-white/10 focus-visible:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Project Comments (Optional)</Label>
                  <Textarea 
                    placeholder="Tell us about the tracks, references, or specific gear you want to use..." 
                    value={formData.clientComment}
                    onChange={e => updateForm("clientComment", e.target.value)}
                    className="min-h-[120px] bg-black/20 border-white/10 focus-visible:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Success */}
          {step === 5 && (
            <div className="animate-in zoom-in-95 duration-500 flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="w-24 h-24 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-4xl font-bold mb-4">Booking Received!</h2>
              <p className="text-xl text-muted-foreground max-w-md mx-auto mb-8">
                Your session request for {formData.date && format(formData.date, 'MMMM d')} at {formData.time} has been sent. We'll be in touch shortly to confirm.
              </p>
              <Button size="lg" onClick={() => setLocation("/")} className="rounded-xl px-8 h-14">
                Return Home
              </Button>
            </div>
          )}

          {/* Form Navigation */}
          {step < 5 && (
            <div className="flex items-center justify-between mt-auto pt-8 border-t border-white/10">
              <Button 
                variant="ghost" 
                onClick={handlePrev}
                disabled={step === 1}
                className="text-muted-foreground hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              
              {step < 4 ? (
                <Button 
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="rounded-xl px-8"
                >
                  Continue <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={!isStepValid() || createBooking.isPending}
                  className="rounded-xl px-8 bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/25"
                >
                  {createBooking.isPending ? "Submitting..." : "Confirm Booking"}
                </Button>
              )}
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}
