"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Enrolment {
  id: number;
  course: string;
  class: string;
  section: string | null;
  start_time: string;
  end_time: string;
  room_id: string;
}

interface TimeSlot {
  hour: number;
  label: string;
}

interface DaySchedule {
  day: string;
  date: Date;
  classes: Enrolment[];
}

export function WeeklyCalendar({ userId }: { userId: string }) {
  const [enrolments, setEnrolments] = useState<Enrolment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(new Date()));
  const supabase = createClient();

  const timeSlots: TimeSlot[] = Array.from({ length: 14 }, (_, i) => ({
    hour: 8 + i,
    label: `${8 + i}:00`,
  }));

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    async function fetchEnrolments() {
      try {
        const { data, error } = await supabase
          .from('enrolment')
          .select('*')
          .eq('user_id', userId);

        if (error) throw error;
        setEnrolments(data || []);
      } catch (error) {
        console.error('Error fetching enrolments:', error);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchEnrolments();
    }
  }, [userId, supabase]);

  function getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  function getWeekDates(): DaySchedule[] {
    return daysOfWeek.map((day, index) => {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + index);
      
      const dayClasses = enrolments.filter(enrolment => {
        const classDate = new Date(enrolment.start_time);
        return classDate.getDay() === index + 1;
      });

      return { day, date, classes: dayClasses };
    });
  }

  function getClassPosition(startTime: string, endTime: string) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    // Use UTC hours since the database stores times in UTC but they represent local times
    const startHour = start.getUTCHours() + start.getUTCMinutes() / 60;
    const endHour = end.getUTCHours() + end.getUTCMinutes() / 60;
    
    const top = ((startHour - 8) / 14) * 100;
    const height = ((endHour - startHour) / 14) * 100;
    
    return { top: `${top}%`, height: `${height}%` };
  }

  function formatTime(dateString: string): string {
    const date = new Date(dateString);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  }

  function changeWeek(direction: 'prev' | 'next') {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newDate);
  }

  function goToCurrentWeek() {
    setCurrentWeekStart(getMonday(new Date()));
  }

  const weekDates = getWeekDates();
  const weekRange = `${weekDates[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDates[4].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 border-r-pink-500 animate-spin"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500/30 blur-sm animate-spin"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Your Weekly Schedule</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToCurrentWeek}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={() => changeWeek('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-4">{weekRange}</span>
            <Button variant="outline" size="icon" onClick={() => changeWeek('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {/* Time column */}
          <div className="flex-shrink-0 w-16 pt-12">
            {timeSlots.map((slot) => (
              <div
                key={slot.hour}
                className="h-20 text-xs text-muted-foreground flex items-start"
              >
                {slot.label}
              </div>
            ))}
          </div>

          {/* Days columns */}
          {weekDates.map((schedule, dayIndex) => {
            const isToday = schedule.date.toDateString() === new Date().toDateString();
            
            return (
              <div key={schedule.day} className="flex-1 min-w-32">
                <div className={`text-center pb-2 mb-2 border-b-2 ${isToday ? 'border-blue-500' : 'border-border'}`}>
                  <div className={`text-sm font-semibold ${isToday ? 'text-blue-500' : ''}`}>
                    {schedule.day}
                  </div>
                  <div className={`text-xs ${isToday ? 'text-blue-500 font-semibold' : 'text-muted-foreground'}`}>
                    {schedule.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>

                <div className="relative h-[1120px] border-l border-border">
                  {/* Hour lines */}
                  {timeSlots.map((slot, index) => (
                    <div
                      key={slot.hour}
                      className="absolute w-full border-t border-border/50"
                      style={{ top: `${(index / 14) * 100}%` }}
                    />
                  ))}

                  {/* Classes */}
                  {schedule.classes.map((cls) => {
                    const position = getClassPosition(cls.start_time, cls.end_time);
                    
                    return (
                      <div
                        key={cls.id}
                        className="absolute left-1 right-1 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg p-2 shadow-lg hover:shadow-xl transition-all cursor-pointer overflow-hidden"
                        style={position}
                      >
                        <div className="flex flex-row items-center font-semibold text-xs truncate gap-1 mt-1">
                          <Badge variant="secondary" className="text-xs bg-white/20 text-white border-0">
                            {cls.class}
                          </Badge>
                            {cls.course}
                        </div>
                        {cls.section && (
                          <div className="text-xs opacity-90 mt-1">
                            {cls.section}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs mt-1 opacity-90">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(cls.start_time)} - {formatTime(cls.end_time)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs mt-1 opacity-90">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{cls.room_id}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {enrolments.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No classes scheduled. Please add your courses to see your timetable.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
