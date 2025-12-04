import React, { useMemo } from 'react';
import { Medication, LogEntry, FrequencyType, MoodType, MoodEntry, SnoozeEntry } from '../types';
import MedicationCard from './MedicationCard';
import { format } from 'date-fns';
import { AlertTriangle, Check, Flame, CalendarClock, Sunrise, Sun, Moon, Coffee, Clock, Smile, Meh, Frown, ThumbsUp, Activity, Plus } from 'lucide-react';

interface DashboardProps {
  medications: Medication[];
  logs: LogEntry[];
  moods: MoodEntry[];
  snoozedItems: SnoozeEntry[];
  onDeleteMedication: (id: string) => void;
  onLogMedication: (medId: string, status: 'TAKEN' | 'SKIPPED', time?: string) => void;
  onRefillMedication: (medId: string, newStock: number) => void;
  onEditMedication: (med: Medication) => void;
  onUpdateMedication: (med: Medication) => void;
  onLogMood: (mood: MoodType) => void;
  onSnoozeMedication: (medId: string, time: string, minutes: number) => void;
  userName: string;
}

const Dashboard: React.FC<DashboardProps> = ({ medications, logs, moods, snoozedItems, onDeleteMedication, onLogMedication, onRefillMedication, onEditMedication, onUpdateMedication, onLogMood, onSnoozeMedication, userName }) => {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayLogs = logs.filter(log => log.dateStr === todayStr);
  const todaysMood = moods.find(m => m.dateStr === todayStr);

  const lowStockMeds = useMemo(() => medications.filter(m => m.currentStock <= m.lowStockThreshold), [medications]);

  // Greeting Logic
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Streak Calculation
  const streakDays = useMemo(() => {
    const hasTakenToday = todayLogs.some(l => l.status === 'TAKEN');
    const baseStreak = 12; // Mock base streak for demo
    return hasTakenToday ? baseStreak + 1 : baseStreak;
  }, [todayLogs]);

  // Daily Progress Calculation
  const progressStats = useMemo(() => {
    let totalScheduled = 0;
    medications.forEach(m => {
       if (m.frequency === 'DAILY') totalScheduled += m.times.length;
       // Simplify for other types
    });
    const taken = todayLogs.filter(l => l.status === 'TAKEN').length;
    const skipped = todayLogs.filter(l => l.status === 'SKIPPED').length;
    const progress = totalScheduled > 0 ? Math.round((taken / totalScheduled) * 100) : 0;
    return { taken, totalScheduled, progress, skipped };
  }, [medications, todayLogs]);

  // Determine Next Dose
  const nextDose = useMemo(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    let upcoming: { med: Medication, time: string, diff: number } | null = null;

    medications.forEach(med => {
      if (med.frequency === FrequencyType.AS_NEEDED) return;
      
      med.times.forEach(time => {
        const [h, m] = time.split(':').map(Number);
        const timeMinutes = h * 60 + m;
        
        // Check if already logged
        const isLogged = todayLogs.some(l => l.medicationId === med.id && l.scheduledTime === time);
        
        if (!isLogged) {
          const diff = timeMinutes - currentMinutes;
          // Only look at future or very recent past (within 60 mins overdue)
          if (diff > -60) {
            if (!upcoming || (diff < upcoming.diff && diff >= -60)) { 
               upcoming = { med, time, diff };
            }
          }
        }
      });
    });

    return upcoming;
  }, [medications, todayLogs]);

  // Group Medications
  const groupedMeds = useMemo(() => {
    const groups = {
      morning: [] as Medication[],
      afternoon: [] as Medication[],
      evening: [] as Medication[],
      asNeeded: [] as Medication[]
    };

    medications.forEach(med => {
      if (med.frequency === FrequencyType.AS_NEEDED) {
        groups.asNeeded.push(med);
        return;
      }
      
      if (med.times.length > 0) {
        const firstTime = med.times[0];
        const hour = parseInt(firstTime.split(':')[0]);
        
        if (hour < 12) groups.morning.push(med);
        else if (hour < 17) groups.afternoon.push(med);
        else groups.evening.push(med);
      }
    });

    return groups;
  }, [medications]);

  const renderSection = (title: string, icon: React.ReactNode, meds: Medication[]) => {
    if (meds.length === 0) return null;
    return (
      <div className="mb-6 animate-fadeIn">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2 px-1">
          {icon} {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {meds.map(med => {
            const snoozeEntry = snoozedItems.find(s => s.medicationId === med.id);
            return (
              <MedicationCard 
                key={med.id} 
                medication={med} 
                onDelete={onDeleteMedication}
                onLog={onLogMedication}
                onRefill={onRefillMedication}
                onEdit={onEditMedication}
                onUpdate={onUpdateMedication}
                onSnooze={onSnoozeMedication}
                todayLogs={todayLogs.filter(log => log.medicationId === med.id)}
                snoozeUntil={snoozeEntry ? snoozeEntry.wakeUpTime : undefined}
              />
            );
          })}
        </div>
      </div>
    );
  };

  const allDone = !nextDose && progressStats.totalScheduled > 0 && progressStats.taken >= progressStats.totalScheduled;
  const isEmpty = medications.length === 0;

  const MoodButton = ({ type, icon, color, label }: { type: MoodType, icon: React.ReactNode, color: string, label: string }) => (
    <button
      onClick={() => onLogMood(type)}
      className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${todaysMood?.type === type ? `bg-${color}-100 ring-2 ring-${color}-500 scale-105 shadow-sm` : 'hover:bg-slate-50'}`}
    >
      <div className={`p-2 rounded-full ${todaysMood?.type === type ? `bg-${color}-500 text-white` : `bg-white border border-slate-100 text-slate-400`}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold ${todaysMood?.type === type ? `text-${color}-700` : 'text-slate-400'}`}>{label}</span>
    </button>
  );

  return (
    <div className="pb-10 space-y-6">
      {/* Top Greeting & Stats */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">{getGreeting()},</h1>
          <h2 className="text-xl text-slate-500 font-medium">{userName}</h2>
        </div>
        
        {!isEmpty && (
           <div className="relative w-16 h-16 flex items-center justify-center">
              {/* Circular Progress Ring */}
              <svg className="w-full h-full transform -rotate-90">
                 <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-200" />
                 <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={175} strokeDashoffset={175 - (175 * progressStats.progress) / 100} className="text-blue-500 transition-all duration-1000 ease-out" strokeLinecap="round" />
              </svg>
              <span className="absolute text-xs font-bold text-slate-700">{progressStats.progress}%</span>
           </div>
        )}
      </div>

      {/* Hero Card: Next Dose */}
      {!isEmpty && (
        <div className="animate-slideDown">
          {allDone ? (
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-[2rem] p-8 text-white shadow-xl shadow-emerald-200/50 flex items-center justify-between relative overflow-hidden group hover:scale-[1.01] transition-transform">
               <div className="relative z-10">
                 <h3 className="text-2xl font-bold mb-2">All Caught Up!</h3>
                 <p className="text-emerald-100 font-medium">You've completed your schedule for today.</p>
               </div>
               <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm relative z-10 ring-4 ring-white/10">
                 <Check size={32} strokeWidth={3} />
               </div>
               {/* Decorative Blobs */}
               <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
            </div>
          ) : nextDose ? (
            <div className="bg-white rounded-[2rem] p-1 border border-slate-100 shadow-xl shadow-slate-200/50">
               <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.8rem] p-6 sm:p-8 text-white relative overflow-hidden group">
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                      <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-md ring-1 ring-white/30">
                        <Clock size={12} /> Next Up • {nextDose.time}
                      </div>
                      <h3 className="text-3xl font-bold mb-1 tracking-tight">{nextDose.med.name}</h3>
                      <p className="text-blue-100 text-lg opacity-90 font-medium">{nextDose.med.dosage}</p>
                      
                      {nextDose.med.notes && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-blue-50 bg-black/10 p-2 px-3 rounded-lg inline-block backdrop-blur-sm">
                          <span>📝 {nextDose.med.notes}</span>
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={() => onLogMedication(nextDose!.med.id, 'TAKEN', nextDose!.time)}
                      className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2 group/btn whitespace-nowrap"
                    >
                      <Check size={20} className="group-hover/btn:scale-110 transition-transform" />
                      Take Now
                    </button>
                  </div>
                  
                  <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500 rounded-full opacity-30 blur-3xl group-hover:opacity-40 transition-opacity"></div>
                  <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-blue-400 rounded-full opacity-20 blur-2xl"></div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-[2rem] p-8 text-center border-2 border-dashed border-slate-200">
               <p className="text-slate-400 font-medium">No active medication schedule.</p>
            </div>
          )}
        </div>
      )}

      {/* Mood Tracker Widget */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100/60 p-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
           <Activity size={14} /> Daily Check-in
        </h3>
        <div className="flex justify-between items-center gap-2">
          <MoodButton type="GREAT" icon={<ThumbsUp size={20} />} color="green" label="Great" />
          <MoodButton type="GOOD" icon={<Smile size={20} />} color="blue" label="Good" />
          <MoodButton type="OKAY" icon={<Meh size={20} />} color="yellow" label="Okay" />
          <MoodButton type="LOW" icon={<Frown size={20} />} color="orange" label="Low" />
          <MoodButton type="PAIN" icon={<Activity size={20} />} color="red" label="Pain" />
        </div>
      </div>

      {/* Refill Alert */}
      {lowStockMeds.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-[1.5rem] p-5 flex flex-col gap-3 relative overflow-hidden animate-fadeIn">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-400/10 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none"></div>
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="bg-white p-2.5 rounded-full text-red-500 shadow-sm border border-red-100 animate-pulse">
              <AlertTriangle size={20} />
            </div>
            <div>
               <h3 className="font-bold text-red-900 text-sm leading-tight">Restock Needed</h3>
               <p className="text-red-700/80 text-xs font-medium">You're running low on supplies.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-1 relative z-10 pl-1">
            {lowStockMeds.map(med => (
              <div key={med.id} className="flex items-center justify-between gap-3 text-xs font-bold text-red-700 bg-white p-2 px-3 rounded-lg border border-red-200 shadow-sm">
                <div className="flex items-center gap-2">
                   <span>{med.name}</span>
                   <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">{med.currentStock} Left</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grouped Lists */}
      {isEmpty ? (
        <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-200 p-12 text-center animate-fadeIn">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CalendarClock size={40} className="text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Your Schedule is Empty</h3>
          <p className="text-slate-400 max-w-xs mx-auto mb-6 text-sm">Add your first medication to start building your daily health routine.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {renderSection('Morning', <Sunrise size={16} />, groupedMeds.morning)}
          {renderSection('Afternoon', <Sun size={16} />, groupedMeds.afternoon)}
          {renderSection('Evening', <Moon size={16} />, groupedMeds.evening)}
          {renderSection('As Needed', <Coffee size={16} />, groupedMeds.asNeeded)}
        </div>
      )}
    </div>
  );
};

export default Dashboard;