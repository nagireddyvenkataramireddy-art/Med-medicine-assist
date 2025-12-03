import React, { useState, useEffect } from 'react';
import { X, Smartphone, Activity, Check, Settings, Moon, Bell, Users, Plus, Watch, User, Heart, ShieldAlert, CreditCard, ChevronRight, Music, Volume2, Vibrate, ArrowLeft, HelpCircle } from 'lucide-react';
import { Profile, SoundType } from '../types';
import { playNotificationSound } from '../services/audioService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles?: Profile[];
  activeProfileId?: string;
  onAddProfile?: (name: string) => void;
  onUpdateProfile?: (profile: Profile) => void;
  fireBolttConnected?: boolean;
  toggleFireBoltt?: (enabled: boolean) => void;
  onTestNotification?: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, profiles = [], activeProfileId, onAddProfile, onUpdateProfile, fireBolttConnected = false, toggleFireBoltt, onTestNotification 
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'devices' | 'general'>('profile');
  const [googleFitConnected, setGoogleFitConnected] = useState(false);
  const [appleHealthConnected, setAppleHealthConnected] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Sub-menu states
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Profile Management State
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

  // Active Profile Edit State
  const [currentProfileData, setCurrentProfileData] = useState<Profile | null>(null);

  useEffect(() => {
    if (profiles && activeProfileId) {
      const active = profiles.find(p => p.id === activeProfileId);
      if (active) setCurrentProfileData(active);
    }
  }, [profiles, activeProfileId, isOpen]);

  if (!isOpen) return null;

  const handleAddProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProfileName && onAddProfile) {
      onAddProfile(newProfileName);
      setNewProfileName('');
      setShowAddProfile(false);
    }
  };

  const handleProfileChange = (field: keyof Profile, value: any) => {
    if (!currentProfileData) return;
    setCurrentProfileData({ ...currentProfileData, [field]: value });
  };

  const handleEmergencyChange = (field: string, value: string) => {
    if (!currentProfileData) return;
    const emergencyContact = {
      name: currentProfileData.emergencyContact?.name || '',
      relation: currentProfileData.emergencyContact?.relation || '',
      phone: currentProfileData.emergencyContact?.phone || '',
      [field]: value
    };
    setCurrentProfileData({ ...currentProfileData, emergencyContact });
  };

  const saveProfile = () => {
    if (currentProfileData && onUpdateProfile) {
      onUpdateProfile(currentProfileData);
      alert('Profile updated successfully!');
    }
  };

  const testSound = (sound: SoundType) => {
    playNotificationSound(sound);
  }
  
  const testVibration = () => {
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 400]);
    } else {
      alert("Vibration not supported on this device/browser.");
    }
  }

  // Render Sub-menus overlay
  if (showSoundSettings) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <div className="bg-white p-4 border-b border-slate-100 flex items-center gap-3">
             <button onClick={() => setShowSoundSettings(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
               <ArrowLeft size={20} />
             </button>
             <h2 className="text-xl font-bold text-slate-800">Sounds & Haptics</h2>
          </div>
          <div className="p-6 space-y-6 overflow-y-auto">
             <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-indigo-800 text-sm">
               <p>Here you can test if your phone is receiving alerts correctly. Make sure your volume is up!</p>
             </div>

             <div className="bg-white border border-slate-200 rounded-xl p-4">
               <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                 <Bell size={18} className="text-blue-500" /> Test Notification
               </h3>
               <p className="text-xs text-slate-500 mb-4">
                 Click below to send a real notification to your phone. If you don't see it, check your Android System Settings for this app.
               </p>
               <button 
                 onClick={onTestNotification}
                 className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2"
               >
                 <Bell size={18} /> Send Test Alert
               </button>
             </div>

             <div className="bg-white border border-slate-200 rounded-xl p-4">
               <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                 <Volume2 size={18} className="text-teal-500" /> Sound Preview
               </h3>
               <div className="grid grid-cols-2 gap-3">
                  {['chime', 'alert', 'soft', 'harp', 'nature', 'arcade', 'glass', 'shimmer', 'echo'].map((sound) => (
                    <button 
                      key={sound}
                      onClick={() => testSound(sound as SoundType)}
                      className="p-3 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:border-blue-300 transition-all flex items-center justify-between"
                    >
                      <span className="capitalize">{sound}</span>
                      <Volume2 size={14} className="text-slate-400" />
                    </button>
                  ))}
               </div>
             </div>

             <div className="bg-white border border-slate-200 rounded-xl p-4">
               <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                 <Vibrate size={18} className="text-orange-500" /> Haptics
               </h3>
               <button 
                 onClick={testVibration}
                 className="w-full py-3 border border-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
               >
                 <Activity size={18} /> Test Vibration
               </button>
             </div>
          </div>
        </div>
      </div>
    );
  }

  if (showHelp) {
     return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <div className="bg-white p-4 border-b border-slate-100 flex items-center gap-3">
             <button onClick={() => setShowHelp(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
               <ArrowLeft size={20} />
             </button>
             <h2 className="text-xl font-bold text-slate-800">How to use MediMind</h2>
          </div>
          <div className="p-6 space-y-6 overflow-y-auto bg-slate-50">
             <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">1</span>
                    <h3 className="font-bold text-slate-800">Add Medication</h3>
                  </div>
                  <p className="text-sm text-slate-600 pl-11">Click the black <span className="font-bold">+</span> button. You can type "Take Aspirin daily at 9am" or scan your pill bottle.</p>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">2</span>
                    <h3 className="font-bold text-slate-800">Get Notified</h3>
                  </div>
                  <p className="text-sm text-slate-600 pl-11">When it's time, your phone will ring/vibrate. Click the notification to open the app.</p>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">3</span>
                    <h3 className="font-bold text-slate-800">Take Medicine</h3>
                  </div>
                  <p className="text-sm text-slate-600 pl-11">On the Home screen, find the medication card. Click the <span className="font-bold text-blue-600">Take</span> button or the <Check size={14} className="inline"/> icon. This logs it in your History.</p>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">4</span>
                    <h3 className="font-bold text-slate-800">Track Progress</h3>
                  </div>
                  <p className="text-sm text-slate-600 pl-11">Go to the <b>History</b> tab to see your streaks and create reports for your doctor.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
     )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-white p-4 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Settings size={20} className="text-slate-500" />
            Settings & Profile
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 flex-shrink-0 overflow-x-auto">
          {[
            { id: 'profile', label: 'My Health', icon: <User size={16} /> },
            { id: 'devices', label: 'Devices', icon: <Watch size={16} /> },
            { id: 'general', label: 'Preferences', icon: <Settings size={16} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors border-b-2 ${
                activeTab === tab.id 
                  ? 'border-blue-500 text-blue-600 bg-white' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 bg-[#f8fafc]">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && currentProfileData && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Profile Header Card */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl shadow-inner border border-white/30">
                    {currentProfileData.avatar}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{currentProfileData.name}</h3>
                    <p className="text-blue-100 text-sm opacity-90">Medical ID: {currentProfileData.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-20">
                  <CreditCard size={100} />
                </div>
              </div>

              {/* Preferences for this Profile */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Music size={16} /> Preferences
                 </h3>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">Default Reminder Ringtone</label>
                    <div className="flex gap-2">
                      <select 
                        value={currentProfileData.preferredSound || 'default'}
                        onChange={e => {
                          handleProfileChange('preferredSound', e.target.value);
                          testSound(e.target.value as SoundType);
                        }}
                        className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                      >
                        <option value="default">System Default</option>
                        <option value="chime">Gentle Chime</option>
                        <option value="alert">Digital Alert</option>
                        <option value="soft">Soft Rise</option>
                        <option value="harp">Harp Arpeggio</option>
                        <option value="nature">Nature Chirp</option>
                        <option value="arcade">Arcade Jump</option>
                        <option value="glass">Glass Ting</option>
                        <option value="shimmer">Shimmer</option>
                        <option value="echo">Echo Blip</option>
                      </select>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">This sound will be pre-selected when adding new meds for {currentProfileData.name}.</p>
                 </div>
              </div>

              {/* Personal Details Form */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <User size={16} /> Personal Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Gender</label>
                    <select 
                      value={currentProfileData.gender || ''}
                      onChange={e => handleProfileChange('gender', e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Age</label>
                    <input 
                      type="number"
                      value={currentProfileData.age || ''}
                      onChange={e => handleProfileChange('age', e.target.value)}
                      placeholder="Years"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Blood Type</label>
                    <select 
                      value={currentProfileData.bloodType || ''}
                      onChange={e => handleProfileChange('bloodType', e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                    >
                      <option value="">Select</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Height (cm)</label>
                    <input 
                      type="text"
                      value={currentProfileData.height || ''}
                      onChange={e => handleProfileChange('height', e.target.value)}
                      placeholder="e.g. 175"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Medical Notes / Allergies</label>
                  <textarea 
                    value={currentProfileData.allergies || ''}
                    onChange={e => handleProfileChange('allergies', e.target.value)}
                    placeholder="Peanuts, Penicillin, etc."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 resize-none h-20"
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-red-50 p-5 rounded-xl border border-red-100 shadow-sm">
                <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <ShieldAlert size={16} /> Emergency Contact
                </h3>
                <div className="space-y-3">
                  <input 
                    placeholder="Contact Name"
                    value={currentProfileData.emergencyContact?.name || ''}
                    onChange={e => handleEmergencyChange('name', e.target.value)}
                    className="w-full p-2.5 bg-white border border-red-200 rounded-lg text-sm outline-none focus:border-red-400"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      placeholder="Relation"
                      value={currentProfileData.emergencyContact?.relation || ''}
                      onChange={e => handleEmergencyChange('relation', e.target.value)}
                      className="w-full p-2.5 bg-white border border-red-200 rounded-lg text-sm outline-none focus:border-red-400"
                    />
                    <input 
                      placeholder="Phone Number"
                      value={currentProfileData.emergencyContact?.phone || ''}
                      onChange={e => handleEmergencyChange('phone', e.target.value)}
                      className="w-full p-2.5 bg-white border border-red-200 rounded-lg text-sm outline-none focus:border-red-400"
                    />
                  </div>
                </div>
              </div>

              {/* Family Management */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                     <Users size={16} /> Family Profiles
                   </h3>
                   <button 
                     onClick={() => setShowAddProfile(true)}
                     className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded"
                   >
                     <Plus size={14} /> Add New
                   </button>
                </div>
                
                {showAddProfile && (
                  <form onSubmit={handleAddProfileSubmit} className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 animate-fadeIn">
                    <input 
                      autoFocus
                      placeholder="Profile Name (e.g. Mom)" 
                      value={newProfileName}
                      onChange={e => setNewProfileName(e.target.value)}
                      className="w-full p-2 mb-2 rounded border border-slate-200 text-sm outline-none focus:border-blue-500"
                    />
                    <div className="flex gap-2">
                       <button type="submit" className="flex-1 bg-blue-600 text-white text-xs py-1.5 rounded font-bold">Add</button>
                       <button type="button" onClick={() => setShowAddProfile(false)} className="flex-1 bg-white border border-slate-200 text-xs py-1.5 rounded">Cancel</button>
                    </div>
                  </form>
                )}

                <div className="flex flex-wrap gap-2">
                  {profiles.map(p => (
                    <div key={p.id} className={`flex items-center gap-2 p-2 px-3 rounded-full border text-sm ${p.id === activeProfileId ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600'}`}>
                       <span>{p.avatar}</span>
                       <span className="font-bold">{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={saveProfile}
                  className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={18} /> Save Changes
                </button>
              </div>
            </div>
          )}

          {/* DEVICES TAB */}
          {activeTab === 'devices' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100 mb-2">
                <h3 className="font-bold text-indigo-800 mb-2">Connected Health</h3>
                <p className="text-sm text-indigo-600 mb-4">Sync vitals from your favorite devices to keep your health dashboard up to date.</p>
              </div>

              {/* Fire-Boltt Integration */}
              <div className="flex items-center justify-between p-4 border border-indigo-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                    <Watch size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">Fire-Boltt Watch</p>
                    <p className="text-xs text-slate-400">{fireBolttConnected ? 'Connected & Syncing' : 'Tap to link device'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => toggleFireBoltt && toggleFireBoltt(!fireBolttConnected)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    fireBolttConnected 
                      ? 'bg-green-500 text-white shadow-md' 
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {fireBolttConnected ? 'Linked' : 'Link'}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center border border-red-100">
                    <Activity size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">Google Fit</p>
                    <p className="text-xs text-slate-400">{googleFitConnected ? 'Syncing active' : 'Not connected'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setGoogleFitConnected(!googleFitConnected)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    googleFitConnected 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {googleFitConnected ? 'Connected' : 'Connect'}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center border border-pink-100">
                    <Heart size={24} fill="currentColor" className="text-pink-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">Apple Health</p>
                    <p className="text-xs text-slate-400">{appleHealthConnected ? 'Syncing active' : 'Not connected'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setAppleHealthConnected(!appleHealthConnected)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    appleHealthConnected 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {appleHealthConnected ? 'Connected' : 'Connect'}
                </button>
              </div>
            </div>
          )}

          {/* PREFERENCES TAB */}
          {activeTab === 'general' && (
            <div className="space-y-4 animate-fadeIn">
               <button 
                 onClick={() => setShowHelp(true)}
                 className="w-full bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between group hover:bg-blue-100 transition-colors"
               >
                 <div className="flex items-center gap-3">
                    <HelpCircle size={20} className="text-blue-500" />
                    <div className="text-left">
                       <p className="font-bold text-blue-700 text-sm">How to use MediMind</p>
                       <p className="text-xs text-blue-500">Quick start guide</p>
                    </div>
                 </div>
                 <ChevronRight size={16} className="text-blue-300 group-hover:text-blue-500" />
               </button>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                 <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Moon size={20} className="text-slate-400" />
                      <div>
                        <p className="font-bold text-slate-700 text-sm">Dark Mode</p>
                        <p className="text-xs text-slate-400">Reduce eye strain at night</p>
                      </div>
                    </div>
                    <button 
                       onClick={() => setDarkMode(!darkMode)}
                       className={`w-12 h-7 rounded-full p-1 transition-colors ${darkMode ? 'bg-indigo-500' : 'bg-slate-200'}`}
                    >
                       <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${darkMode ? 'translate-x-5' : ''}`}></div>
                    </button>
                 </div>
                 <button 
                   onClick={() => setShowSoundSettings(true)}
                   className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                 >
                    <div className="flex items-center gap-3">
                      <Bell size={20} className="text-slate-400" />
                      <div className="text-left">
                        <p className="font-bold text-slate-700 text-sm">Sounds & Haptics</p>
                        <p className="text-xs text-slate-400">Manage alerts & test notifications</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                 </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Data Management</h4>
                <button className="w-full py-3 border border-slate-200 rounded-lg text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors mb-2">
                  Export All Data (JSON)
                </button>
                <button className="w-full py-3 border border-red-100 text-red-500 rounded-lg font-bold text-sm hover:bg-red-50 transition-colors">
                  Clear All App Data
                </button>
              </div>

              <div className="pt-4 text-center">
                <p className="text-xs text-slate-400">MediMind v2.3 • Fire-Boltt Edition</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;