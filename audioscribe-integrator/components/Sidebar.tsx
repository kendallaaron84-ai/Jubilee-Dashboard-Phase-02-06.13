import React from 'react';
import { View } from '../types';
import { LayoutDashboard, AlertTriangle, Layers, Mic, Code2 } from 'lucide-react';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: View.DASHBOARD, label: 'Overview', icon: LayoutDashboard },
    { id: View.RISK_ANALYZER, label: 'Risk Analysis', icon: AlertTriangle },
    { id: View.ARCHITECTURE, label: 'Architecture', icon: Layers },
    { id: View.PROTOTYPE, label: 'Prototype', icon: Mic },
    { id: View.CODE_GEN, label: 'Plugin Gen', icon: Code2 },
  ];

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 flex-shrink-0">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold">A</span>
          </div>
          AudioScribe
        </h1>
        <p className="text-xs text-slate-500 mt-2 uppercase tracking-wider font-semibold">Integrator Tool</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                active 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-indigo-200' : 'text-slate-400'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <div className="text-xs text-slate-500">
          Powered by Gemini 2.5 & Google Cloud
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
