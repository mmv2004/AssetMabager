import { Layout } from "@/components/Layout";
import { useBookings, useUpdateBookingStatus } from "@/hooks/use-bookings";
import { useServices } from "@/hooks/use-services";
import { useSpecialists } from "@/hooks/use-specialists";
import { useReviews } from "@/hooks/use-reviews";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Clock, Lock, Star, Trash2, Plus, Mail, MailOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@shared/schema";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const { data: bookings, isLoading: loadingBookings } = useBookings();
  const { data: services } = useServices();
  const { data: specialists } = useSpecialists();
  const { data: reviews, isLoading: loadingReviews } = useReviews();
  
  const updateStatus = useUpdateBookingStatus();

  const [newPasswordValue, setNewPasswordValue] = useState("");
  const [newReview, setNewReview] = useState({ clientName: "", content: "", rating: 5 });
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "confirmed" | "rejected">("all");

  const { data: msgs, isLoading: loadingMessages } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    enabled: isAuthenticated,
  });

  const handleMarkRead = async (id: number) => {
    try {
      await apiRequest("PATCH", `/api/messages/${id}/read`);
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    } catch {
      toast({ variant: "destructive", title: "Ошибка", description: "Не удалось обновить статус" });
    }
  };

  const handleDeleteMessage = async (id: number) => {
    if (!confirm("Удалить это сообщение?")) return;
    try {
      await apiRequest("DELETE", `/api/messages/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      toast({ title: "Удалено", description: "Сообщение удалено" });
    } catch {
      toast({ variant: "destructive", title: "Ошибка", description: "Не удалось удалить сообщение" });
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "admin123") {
      setIsAuthenticated(true);
    } else {
      toast({ variant: "destructive", title: "Ошибка", description: "Неверный логин или пароль" });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest("POST", "/api/admin/change-password", { username: "admin", newPassword: newPasswordValue });
      toast({ title: "Успех", description: "Пароль изменен" });
      setNewPasswordValue("");
    } catch (err) {
      toast({ variant: "destructive", title: "Ошибка", description: "Не удалось изменить пароль" });
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest("POST", "/api/reviews", newReview);
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      setNewReview({ clientName: "", content: "", rating: 5 });
      toast({ title: "Успех", description: "Отзыв добавлен" });
    } catch (err) {
      toast({ variant: "destructive", title: "Ошибка", description: "Не удалось добавить отзыв" });
    }
  };

  const handleDeleteReview = async (id: number) => {
    if (!confirm("Удалить этот отзыв?")) return;
    try {
      await apiRequest("DELETE", `/api/reviews/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      toast({ title: "Успех", description: "Отзыв удален" });
    } catch (err) {
      toast({ variant: "destructive", title: "Ошибка", description: "Не удалось удалить отзыв" });
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="glass-panel p-8 rounded-3xl w-full max-w-md">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-center">Вход для персонала</h1>
            <p className="text-muted-foreground mb-8 text-center">Введите учетные данные для доступа.</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input 
                  placeholder="Логин" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 bg-black/20 border-white/10 focus-visible:border-primary"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Input 
                  type="password" 
                  placeholder="Пароль" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-black/20 border-white/10 focus-visible:border-primary"
                />
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl">
                Войти
              </Button>
            </form>
          </div>
        </div>
      </Layout>
    );
  }

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
            <p className="text-muted-foreground">Управление заявками и контентом студии.</p>
          </div>
        </div>

        <Tabs defaultValue="bookings" className="space-y-8">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl flex-wrap h-auto gap-1">
            <TabsTrigger value="bookings" className="rounded-lg data-[state=active]:bg-primary">Заявки</TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-lg data-[state=active]:bg-primary">Отзывы</TabsTrigger>
            <TabsTrigger value="messages" className="rounded-lg data-[state=active]:bg-primary flex items-center gap-2">
              Сообщения
              {msgs && msgs.filter(m => !m.isRead).length > 0 && (
                <span className="bg-primary text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
                  {msgs.filter(m => !m.isRead).length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-primary">Настройки</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <div className="flex flex-wrap gap-2 mb-4">
              {([
                { key: "all", label: "Все заявки" },
                { key: "new", label: "Новые" },
                { key: "confirmed", label: "Подтверждённые" },
                { key: "rejected", label: "Отклонённые" },
              ] as const).map(({ key, label }) => (
                <Button
                  key={key}
                  size="sm"
                  variant={statusFilter === key ? "default" : "outline"}
                  onClick={() => setStatusFilter(key)}
                  className={cn(
                    "rounded-xl",
                    statusFilter !== key && "bg-transparent border-white/20 hover:border-primary/50"
                  )}
                >
                  {label}
                  {key !== "all" && (
                    <span className="ml-2 text-xs opacity-70">
                      ({bookings?.filter(b => b.status === key).length ?? 0})
                    </span>
                  )}
                  {key === "all" && (
                    <span className="ml-2 text-xs opacity-70">({bookings?.length ?? 0})</span>
                  )}
                </Button>
              ))}
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
                      {bookings?.filter(b => statusFilter === "all" || b.status === statusFilter)
                        .sort((a,b) => new Date(b.bookingTime).getTime() - new Date(a.bookingTime).getTime()).map(booking => (
                        <TableRow key={booking.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                          <TableCell className="font-medium whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-primary" />
                              {format(new Date(booking.bookingTime), "d MMM yyyy, HH:mm", { locale: ru })}
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
                      
                      {bookings?.filter(b => statusFilter === "all" || b.status === statusFilter).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                            {statusFilter === "all" ? "Заявок пока нет." : "Нет заявок с таким статусом."}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="glass-panel p-6 rounded-2xl border border-white/10">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-primary" /> Добавить отзыв
                  </h2>
                  <form onSubmit={handleAddReview} className="space-y-4">
                    <div className="space-y-2">
                      <Input 
                        placeholder="Имя артиста" 
                        value={newReview.clientName}
                        onChange={e => setNewReview(prev => ({ ...prev, clientName: e.target.value }))}
                        className="bg-black/20 border-white/10"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Textarea 
                        placeholder="Текст отзыва" 
                        value={newReview.content}
                        onChange={e => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                        className="bg-black/20 border-white/10 min-h-[100px]"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Input 
                        type="number" 
                        min="1" 
                        max="5" 
                        placeholder="Рейтинг (1-5)" 
                        value={newReview.rating}
                        onChange={e => setNewReview(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                        className="bg-black/20 border-white/10"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full rounded-xl">Опубликовать</Button>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
                  {loadingReviews ? (
                    <div className="p-12 text-center text-muted-foreground animate-pulse">Загрузка отзывов...</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-white/5">
                          <TableRow className="border-white/10">
                            <TableHead className="text-white">Артист</TableHead>
                            <TableHead className="text-white">Отзыв</TableHead>
                            <TableHead className="text-white">Рейтинг</TableHead>
                            <TableHead className="text-right text-white">Действие</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reviews?.map(review => (
                            <TableRow key={review.id} className="border-white/5">
                              <TableCell className="font-bold">{review.clientName}</TableCell>
                              <TableCell className="max-w-md truncate">{review.content}</TableCell>
                              <TableCell>
                                <div className="flex gap-0.5">
                                  {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-muted-foreground hover:text-red-500"
                                  onClick={() => handleDeleteReview(review.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
              {loadingMessages ? (
                <div className="p-12 text-center text-muted-foreground animate-pulse">Загрузка сообщений...</div>
              ) : (
                <div className="divide-y divide-white/5">
                  {!msgs?.length && (
                    <div className="p-12 text-center text-muted-foreground">Сообщений пока нет.</div>
                  )}
                  {msgs?.slice().reverse().map(msg => (
                    <div
                      key={msg.id}
                      className={cn("p-6 flex gap-4 transition-colors", !msg.isRead && "bg-primary/5")}
                    >
                      <div className="mt-1 flex-shrink-0">
                        {msg.isRead
                          ? <MailOpen className="w-5 h-5 text-muted-foreground" />
                          : <Mail className="w-5 h-5 text-primary" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                          <span className="font-bold">{msg.name}</span>
                          <span className="text-sm text-muted-foreground">{msg.email}</span>
                          {!msg.isRead && (
                            <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">Новое</Badge>
                          )}
                          <span className="text-xs text-muted-foreground ml-auto">
                            {format(new Date(msg.createdAt), "d MMM yyyy, HH:mm", { locale: ru })}
                          </span>
                        </div>
                        <p className="font-semibold text-sm mb-2">{msg.subject}</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        {!msg.isRead && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-muted-foreground hover:text-primary"
                            onClick={() => handleMarkRead(msg.id)}
                            title="Отметить прочитанным"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-muted-foreground hover:text-red-500"
                          onClick={() => handleDeleteMessage(msg.id)}
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="max-w-md mx-auto">
              <div className="glass-panel p-8 rounded-2xl border border-white/10">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" /> Изменить пароль
                </h2>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Новый пароль</Label>
                    <Input 
                      type="password" 
                      value={newPasswordValue}
                      onChange={e => setNewPasswordValue(e.target.value)}
                      className="bg-black/20 border-white/10"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full rounded-xl">Обновить пароль</Button>
                </form>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
