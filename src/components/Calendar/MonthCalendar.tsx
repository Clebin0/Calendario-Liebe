
import { useState, useEffect } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, BellRing, Bell, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import CalendarHeader from "./CalendarHeader";
import DateCell from "./DateCell";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  companion_email: string | null;
  notification_enabled: boolean;
  notification_days_before: number;
  image_url: string | null;
}

const MonthCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [companionEmail, setCompanionEmail] = useState("");
  const [description, setDescription] = useState("");
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [notificationDaysBefore, setNotificationDaysBefore] = useState(1);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*");

      if (error) throw error;

      setEvents(data as CalendarEvent[]);
    } catch (error) {
      toast({
        title: "Erro ao carregar eventos",
        description: "Não foi possível carregar os eventos do calendário.",
        variant: "destructive",
      });
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      isSameDay(parseISO(event.date), date)
    );
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    
    const eventsOnDate = getEventsForDate(date);
    if (eventsOnDate.length > 0) {
      // Edit existing event
      const event = eventsOnDate[0]; // For now, just edit the first one if multiple
      setSelectedEvent(event);
      setTitle(event.title);
      setCompanionEmail(event.companion_email || "");
      setNotificationEnabled(event.notification_enabled);
      setNotificationDaysBefore(event.notification_days_before);
      setIsEditMode(true);
    } else {
      // Create new event
      setSelectedEvent(null);
      setTitle("");
      setCompanionEmail("");
      setNotificationEnabled(false);
      setNotificationDaysBefore(1);
      setIsEditMode(false);
    }
    
    setIsDialogOpen(true);
  };

  const handleSaveEvent = async () => {
    if (!selectedDate || !title) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o título do evento.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (isEditMode && selectedEvent) {
        // Update existing event
        const { error } = await supabase
          .from("calendar_events")
          .update({
            title,
            companion_email: companionEmail || null,
            notification_enabled: notificationEnabled,
            notification_days_before: notificationDaysBefore,
          })
          .eq("id", selectedEvent.id);

        if (error) throw error;

        toast({
          title: "Evento atualizado! ❤️",
          description: "Seu momento especial foi atualizado com sucesso!",
          className: "bg-pink-50 border-pink-200",
        });
      } else {
        // Create new event
        const { error } = await supabase
          .from("calendar_events")
          .insert({
            title,
            date: format(selectedDate, "yyyy-MM-dd"),
            companion_email: companionEmail || null,
            notification_enabled: notificationEnabled,
            notification_days_before: notificationDaysBefore,
          });

        if (error) throw error;

        toast({
          title: "Evento salvo! ❤️",
          description: "Seu momento especial foi registrado com sucesso!",
          className: "bg-pink-50 border-pink-200",
        });
      }

      setIsDialogOpen(false);
      setTitle("");
      setCompanionEmail("");
      setNotificationEnabled(false);
      setNotificationDaysBefore(1);
      fetchEvents();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o evento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from("calendar_events")
        .delete()
        .eq("id", selectedEvent.id);

      if (error) throw error;

      toast({
        title: "Evento removido",
        description: "O evento foi removido com sucesso.",
        className: "bg-pink-50 border-pink-200",
      });

      setIsDialogOpen(false);
      fetchEvents();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o evento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full mx-auto space-y-4">
      <CalendarHeader
        currentDate={currentDate}
        onPrevMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
        onToday={goToToday}
      />
      
      <div className="grid grid-cols-7 gap-2 mt-2">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-rose-600/70 py-2"
          >
            {day}
          </div>
        ))}
        
        {monthDays.map((date) => {
          const dateEvents = getEventsForDate(date);
          const hasEvents = dateEvents.length > 0;
          
          return (
            <DateCell
              key={date.toISOString()}
              date={date}
              isSelected={selectedDate ? isSameDay(date, selectedDate) : false}
              isToday={isToday(date)}
              isCurrentMonth={isSameMonth(date, currentDate)}
              hasEvents={hasEvents}
              onSelect={() => handleDateSelect(date)}
            />
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white/95 border-pink-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-pink-800 flex items-center gap-2">
              {isEditMode ? (
                <span className="flex items-center gap-2">
                  Editar Momento Especial
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Adicionar Momento Especial
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-2">
            <div className="space-y-2">
              <Label htmlFor="title">Título do evento</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Jantar romântico"
                className="border-pink-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companion">Email do companheiro(a) (opcional)</Label>
              <Input
                id="companion"
                type="email"
                value={companionEmail}
                onChange={(e) => setCompanionEmail(e.target.value)}
                placeholder="email@exemplo.com"
                className="border-pink-200"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="notification" className="flex items-center gap-2">
                  <BellRing className="h-4 w-4 text-pink-500" />
                  Ativar notificações
                </Label>
                <Switch 
                  id="notification" 
                  checked={notificationEnabled}
                  onCheckedChange={setNotificationEnabled}
                />
              </div>
              {notificationEnabled && (
                <div className="pt-2">
                  <Label htmlFor="days" className="text-sm text-gray-500 block mb-2">
                    Quantos dias antes deseja ser notificado?
                  </Label>
                  <Select 
                    value={notificationDaysBefore.toString()} 
                    onValueChange={(value) => setNotificationDaysBefore(parseInt(value))}
                  >
                    <SelectTrigger className="w-full border-pink-200">
                      <SelectValue placeholder="Selecione o número de dias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 dia antes</SelectItem>
                      <SelectItem value="2">2 dias antes</SelectItem>
                      <SelectItem value="3">3 dias antes</SelectItem>
                      <SelectItem value="5">5 dias antes</SelectItem>
                      <SelectItem value="7">1 semana antes</SelectItem>
                      <SelectItem value="14">2 semanas antes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              {isEditMode && (
                <Button
                  onClick={handleDeleteEvent}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  disabled={isSubmitting}
                >
                  Excluir
                </Button>
              )}
              <Button
                onClick={handleSaveEvent}
                className="bg-pink-500 hover:bg-pink-600"
                disabled={isSubmitting}
              >
                {isEditMode ? "Atualizar" : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MonthCalendar;
