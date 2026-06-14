import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import RiskAnalyzer from './components/RiskAnalyzer';
import ArchitectureViewer from './components/ArchitectureViewer';
import Transcriber from './components/Transcriber';
import PluginGenerator from './components/PluginGenerator';
import { View } from './types';
import { CheckCircle2, ChevronRight, PlayCircle } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);

  const renderContent = () => {
    switch (currentView) {
      case View.RISK_ANALYZER:
        return <RiskAnalyzer />;
      case View.ARCHITECTURE:
        return <ArchitectureViewer />;
      case View.PROTOTYPE:
        return <Transcriber />;
      case View.CODE_GEN:
        return <PluginGenerator />;
      default:
        return (
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4 pt-10">
              <h1 className="text-4xl font-extrabold text-slate-900">
                Audiobook Transcription <span className="text-indigo-600">Master Plan</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                A guided workspace to successfully integrate Google Cloud Storage and Speech-to-Text APIs into your WordPress environment.
              </p>
              <button 
                onClick={() => setCurrentView(View.RISK_ANALYZER)}
                className="mt-6 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
              >
                Start Assessment <ChevronRight />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setCurrentView(View.RISK_ANALYZER)}>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle2 className="text-amber-600 w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">1. Assess Risks</h3>
                <p className="text-slate-600 text-sm">Identify PHP timeouts, memory limits, and GCS permission issues before you code.</p>
              </div>

              <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setCurrentView(View.ARCHITECTURE)}>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle2 className="text-blue-600 w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">2. Architecture</h3>
                <p className="text-slate-600 text-sm">Visualize the "Direct Upload" pattern to bypass WordPress server limits.</p>
              </div>

              <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setCurrentView(View.PROTOTYPE)}>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <PlayCircle className="text-purple-600 w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">3. Prototype</h3>
                <p className="text-slate-600 text-sm">Test transcription quality on real audio files using the Gemini API.</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 pb-20 max-w-7xl mx-auto">
           {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
