
import React, { useState } from 'react';
import { Medication, LogEntry, VitalEntry, MoodEntry } from '../types';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Printer, CheckCircle2, FileText, Loader2, Sparkles, Download } from 'lucide-react';
import { generateHealthReport } from '../services/geminiService';

interface HistoryViewProps {
  medications: Medication[];
  logs: LogEntry[];
  vitals?: VitalEntry[];
  moods?: MoodEntry[];
}

const HistoryView: React.FC<HistoryViewProps> = ({ medications, logs, vitals = [], moods = [] }) => {
  const [report, setReport] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Generate last 7 days of data
  const data = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayLogs = logs.filter(l => l.dateStr === dateStr);
    
    const taken = dayLogs.filter(l => l.status === 'TAKEN').length;
    const skipped = dayLogs.filter(l => l.status === 'SKIPPED').length;
    
    let totalScheduled = 0;
    medications.forEach(med => {
        if (med.frequency === 'DAILY') totalScheduled += med.times.length;
    });

    return {
      name: format(date, 'EEE'),
      fullDate: format(date, 'MMM do'),
      taken,
      skipped,
      total: Math.max(taken + skipped, totalScheduled) 
    };
  });

  const totalTaken = logs.filter(l => l.status === 'TAKEN').length;
  const totalLogs = logs.length;
  const adherenceRate = totalLogs > 0 ? Math.round((totalTaken / totalLogs) * 100) : 100;

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const title = "MediMind Health Report";
    const date = new Date().toLocaleDateString();
    
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
            h1 { color: #2563eb; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 10px; }
            .header-meta { color: #64748b; font-size: 0.9em; margin-bottom: 30px; }
            .stat-box { background: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #e2e8f0; }
            h2 { color: #334155; font-size: 1.2em; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 0.9em; }
            th, td { text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0; }
            th { background-color: #f1f5f9; color: #475569; font-weight: 600; }
            .taken { color: #16a34a; font-weight: bold; background-color: #dcfce7; padding: 4px 8px; border-radius: 99px; font-size: 0.8em; display: inline-block; }
            .skipped { color: #dc2626; font-weight: bold; background-color: #fee2e2; padding: 4px 8px; border-radius: 99px; font-size: 0.8em; display: inline-block; }
            .med-name { font-weight: 500; }
            .footer { margin-top: 50px; text-align: center; color: #94a3b8; font-size: 0.8em; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="header-meta">Generated on: ${date}</div>

          <div class="stat-box">
            <h2>Adherence Summary</h2>
            <div style="display: flex; gap: 40px;">
              <div>
                <div style="font-size: 0.8em; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">Overall Score</div>
                <div style="font-size: 2.5em; font-weight: 800; color: #2563eb;">${adherenceRate}%</div>
              </div>
              <div>
                <div style="font-size: 0.8em; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">Total Doses Taken</div>
                <div style="font-size: 2.5em; font-weight: 800; color: #16a34a;">${totalTaken}</div>
              </div>
              <div>
                <div style="font-size: 0.8em; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">Skipped</div>
                <div style="font-size: 2.5em; font-weight: 800; color: #dc2626;">${totalLogs - totalTaken}</div>
              </div>
            </div>
          </div>

          <h2>Detailed Activity Log (Last 30 Days)</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Medication</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${logs.slice().reverse().slice(0, 50).map(log => {
                const med = medications.find(m => m.id === log.medicationId);
                return `
                  <tr>
                    <td>${log.dateStr}</td>
                    <td>${log.scheduledTime}</td>
                    <td class="med-name">${med?.name || 'Unknown'}</td>
                    <td><span class="${log.status === 'TAKEN' ? 'taken' : 'skipped'}">${log.status}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="footer">
            Generated by MediMind AI • Consult your doctor for professional medical advice.
          </div>
          
          <script>
            window.onload = () => { setTimeout(() => window.print(), 500); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    const result = await generateHealthReport(medications, logs, vitals, moods);
    setReport(result);
    setGenerating(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Summary Score Card */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white flex items-center justify-between shadow-lg shadow-blue-200">
        <div>
          <h3 className="text-blue-100 font-medium mb-1">Overall Adherence</h3>
          <div className="text-4xl font-bold">{adherenceRate}%</div>
          <p className="text-sm text-blue-100 mt-2 opacity-80">
            {adherenceRate >= 90 ? 'Excellent work! Keeping it up.' : 'Try to stay more consistent.'}
          </p>
        </div>
        <div className="bg-white/20 p-3 rounded-full">
           <CheckCircle2 size={32} />
        </div>
      </div>

      {/* AI Doctor Report Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-500" /> AI Doctor's Report
          </h3>
          {!report && (
             <button 
              onClick={handleGenerateReport} 
              disabled={generating}
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center gap-1"
             >
               {generating ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />}
               Generate Summary
             </button>
          )}
        </div>
        <div className="p-6">
          {generating ? (
            <div className="py-8 text-center text-slate-400">
              <Loader2 size={32} className="animate-spin mx-auto mb-2 text-indigo-500" />
              <p>Analyzing health data...</p>
            </div>
          ) : report ? (
            <div className="prose prose-sm prose-slate max-w-none">
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-slate-700 leading-relaxed whitespace-pre-wrap">
                {report}
              </div>
              <button onClick={() => setReport(null)} className="text-xs text-slate-400 mt-2 hover:text-indigo-500">
                Clear Report
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-2">
              Generate a professional summary of your adherence and vitals for your next doctor's visit.
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Weekly Progress</h2>
            <p className="text-sm text-slate-500">Last 7 Days</p>
          </div>
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Printer size={18} /> PDF Report
          </button>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="taken" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} barSize={20} />
              <Bar dataKey="skipped" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-50 font-bold text-slate-700">Detailed Activity Log</div>
        <div className="divide-y divide-slate-50">
          {logs.slice().reverse().slice(0, 10).map(log => {
             const med = medications.find(m => m.id === log.medicationId);
             return (
               <div key={log.id} className="p-4 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className={`w-2 h-2 rounded-full ${log.status === 'TAKEN' ? 'bg-green-500' : 'bg-red-500'}`} />
                   <div>
                     <p className="font-medium text-slate-800">{med?.name || 'Unknown Med'}</p>
                     <p className="text-xs text-slate-400">{log.dateStr} at {log.scheduledTime}</p>
                   </div>
                 </div>
                 <span className={`text-xs font-bold px-2 py-1 rounded-full ${log.status === 'TAKEN' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                   {log.status}
                 </span>
               </div>
             );
          })}
          {logs.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm">No activity recorded yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryView;
