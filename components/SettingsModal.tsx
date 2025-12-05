
import React, { useState, useEffect } from 'react';
import { X, Smartphone, Activity, Check, Settings, Moon, Bell, Users, Plus, Watch, User, Heart, ShieldAlert, CreditCard, ChevronRight, Music, Volume2, Vibrate, ArrowLeft, HelpCircle, RefreshCw, Link2, Bluetooth } from 'lucide-react';
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
  onConnectWatch?: () => void;
  connectedDeviceName?: string | null;
  onTestNotification?: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, profiles = [], activeProfileId, onAddProfile, onUpdateProfile, fireBolttConnected = false, onConnectWatch, connectedDeviceName, onTestNotification 
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

  // ... (Sub-menus render code remains similar, abbreviated for clarity) ...
  if (showSoundSettings) {
    // ... (Same as before)
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
             <div className="bg-white border border-slate-200 rounded-xl p-4">
               <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                 <Bell size={18} className="text-blue-500" /> Test Notification
               </h3>
               <button onClick={onTestNotification} className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold">
                 Send Test Alert
               </button>
             </div>
             <div className="bg-white border border-slate-200 rounded-xl p-4">
               <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                 <Volume2 size={18} className="text-teal-500" /> Sound Preview
               </h3>
               <div className="grid grid-cols-2 gap-3">
                  {['chime', 'alert', 'soft', 'harp', 'nature', 'arcade', 'glass', 'shimmer', 'echo'].map((sound) => (
                    <button key={sound} onClick={() => testSound(sound as SoundType)} className="p-3 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                      <span className="capitalize">{sound}</span>
                    </button>
                  ))}
               </div>
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
             <h2 className="text-xl font-bold text-slate-800">Help</h2>
          </div>
          <div className="p-6 space-y-6 overflow-y-auto bg-slate-50">
             <p className="text-sm text-slate-600">MediMind Guide...</p>
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
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-red-50 p-5 rounded-xl border border-red-100 shadow-sm">
                <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <ShieldAlert size={16} /> Emergency Contact
                </h3>
                <input 
                  placeholder="Contact Name"
                  value={currentProfileData.emergencyContact?.name || ''}
                  onChange={e => handleEmergencyChange('name', e.target.value)}
                  className="w-full p-2.5 bg-white border border-red-200 rounded-lg text-sm outline-none mb-3"
                />
                <input 
                  placeholder="Phone Number"
                  value={currentProfileData.emergencyContact?.phone || ''}
                  onChange={e => handleEmergencyChange('phone', e.target.value)}
                  className="w-full p-2.5 bg-white border border-red-200 rounded-lg text-sm outline-none"
                />
              </div>

              <button 
                  onClick={saveProfile}
                  className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={18} /> Save Changes
              </button>
            </div>
          )}

          {/* DEVICES TAB */}
          {activeTab === 'devices' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100 mb-2">
                <h3 className="font-bold text-indigo-800 mb-2">Connected Health</h3>
                <p className="text-sm text-indigo-600 mb-4">Sync vitals from your devices via Bluetooth to keep your dashboard up to date.</p>
              </div>

              {/* Fire-Boltt Integration */}
              <div className="flex flex-col p-4 border border-indigo-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                      <Bluetooth size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-700">Fire-Boltt Watch</p>
                      <p className="text-xs text-slate-400">
                         {fireBolttConnected 
                           ? `Connected to ${connectedDeviceName || 'Device'}` 
                           : 'Bluetooth Pairing Required'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={onConnectWatch}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                      fireBolttConnected 
                        ? 'bg-green-500 text-white shadow-md' 
                        : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    {fireBolttConnected ? <Check size={16} /> : <Link2 size={16} />}
                    {fireBolttConnected ? 'Linked' : 'Link'}
                  </button>
                </div>
                {!fireBolttConnected && (
                  <div className="mt-3 text-xs text-slate-400 bg-slate-50 p-2 rounded">
                    Tap <b>Link</b> to open the Bluetooth scanner. Select your watch from the list. It must be powered on and not connected to another phone.
                  </div>
                )}
              </div>

              {/* Google Fit Simulation */}
              <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow opacity-75">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center border border-red-100">
                    <Activity size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">Google Fit</p>
                    <p className="text-xs text-slate-400">Cloud Sync (Simulated)</p>
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
                  {googleFitConnected ? 'Active' : 'Enable'}
                </button>
              </div>
            </div>
          )}

          {/* PREFERENCES TAB */}
          {activeTab === 'general' && (
            <div className="space-y-4 animate-fadeIn">
               {/* ... (Existing preferences code) ... */}
               <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
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
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
