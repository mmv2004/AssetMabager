import { Layout } from "@/components/Layout";
import { useBookings, useUpdateBookingStatus } from "@/hooks/use-bookings";
import { useServices } from "@/hooks/use-services";
import { useSpecialists } from "@/hooks/use-specialists";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Admin() {
  const { data: bookings, isLoading: loadingBookings } = useBookings();
  const { data: services } = useServices();
  const { data: specialists } = useSpecialists();
  
  const updateStatus = useUpdateBookingStatus();

  const [locale, setLocale] = useState<any>(null);
  useEffect(() => {
    import('date-fns/locale/ru').then(m => setLocale(m.default));
  }, []);

  const getServiceName = (id: number) => services?.find(s => s.id === id)?.title || `Услуга #${id}`;

  const getSpecialistName = (id?: number | null) => id ? (specialists?.find(s => s.id === id)?.name || `ID #${id}`) : 'Любой';

  const statusColors = {
    new: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    confirmed: "bg-green-500/10 text-green-500 border-green-500/20",
    rejected: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  const statusLabels = {
    new: "Новая",
    confirmed: "Подтверждена",
    rejected: "Отклонена",
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Панель администратора</h1>
            <p className="text-muted-foreground">Управление заявками и расписанием студии.</p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
          {loadingBookings ? (
            <div className="p-12 text-center text-muted-foreground animate-pulse">Загрузка заявок...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-white">Дата и время</TableHead>
                    <TableHead className="text-white">Клиент</TableHead>
                    <TableHead className="text-white">Услуга</TableHead>
                    <TableHead className="text-white">Специалист</TableHead>
                    <TableHead className="text-white">Статус</TableHead>
                    <TableHead className="text-right text-white">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings?.sort((a,b) => new Date(b.bookingTime).getTime() - new Date(a.bookingTime).getTime()).map(booking => (
                    <TableRow key={booking.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                      <TableCell className="font-medium whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          {locale && format(new Date(booking.bookingTime), "d MMM yyyy, HH:mm", { locale })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold">{booking.clientName}</span>
                          <span className="text-xs text-muted-foreground">{booking.clientEmail}</span>
                          <span className="text-xs text-muted-foreground">{booking.clientPhone}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getServiceName(booking.serviceId)}</TableCell>
                      <TableCell>{getSpecialistName(booking.specialistId)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("px-3 py-1", statusColors[booking.status as keyof typeof statusColors])}>
                          {statusLabels[booking.status as keyof typeof statusLabels]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {booking.status === 'new' && (
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-green-500/30 text-green-500 hover:bg-green-500/10 hover:text-green-400"
                              onClick={() => updateStatus.mutate({ id: booking.id, status: 'confirmed' })}
                              disabled={updateStatus.isPending}
                            >
                              <Check className="w-4 h-4 mr-1" /> Принять
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                              onClick={() => updateStatus.mutate({ id: booking.id, status: 'rejected' })}
                              disabled={updateStatus.isPending}
                            >
                              <X className="w-4 h-4 mr-1" /> Отклонить
                            </Button>
                          </div>
                        )}
                        {booking.status !== 'new' && (
                          <span className="text-xs text-muted-foreground italic">Обработано</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {!bookings?.length && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        Заявок пока нет.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
