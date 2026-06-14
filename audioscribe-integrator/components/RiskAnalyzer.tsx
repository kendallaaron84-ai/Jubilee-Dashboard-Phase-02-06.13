import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, Server, DollarSign, Activity, Loader2 } from 'lucide-react';
import { generateRiskAnalysis } from '../services/geminiService';
import { RiskFactor } from '../types';

const RiskAnalyzer: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    fileCount: 50,
    avgDuration: 30,
    hosting: 'Shared Hosting (e.g., Bluehost, GoDaddy)',
    techSkill: 'Intermediate',
  });
  const [analysis, setAnalysis] = useState<{ risks: RiskFactor[], summary: string } | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const context = `
        User plans to transcribe ${inputs.fileCount} audiobook chapters.
        Average duration: ${inputs.avgDuration} minutes per file.
        Hosting Environment: ${inputs.hosting}.
        Technical Skill Level: ${inputs.techSkill}.
      `;
      const result = await generateRiskAnalysis(context);
      setAnalysis(result);
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Failed to generate analysis. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'Performance': return <Activity className="w-5 h-5" />;
      case 'Security': return <ShieldCheck className="w-5 h-5" />;
      case 'Cost': return <DollarSign className="w-5 h-5" />;
      default: return <Server className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <AlertTriangle className="text-amber-500" />
          Integration Risk Assessment
        </h2>
        <p className="text-slate-600 mb-6">
          Integrating heavy media processing like Speech-to-Text into WordPress is fraught with pitfalls. 
          Enter your project details to identify specific failure points before you build.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Total Chapters/Files</label>
            <input 
              type="number" 
              value={inputs.fileCount}
              onChange={(e) => setInputs({...inputs, fileCount: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Avg Duration (Minutes)</label>
            <input 
              type="number" 
              value={inputs.avgDuration}
              onChange={(e) => setInputs({...inputs, avgDuration: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Hosting Environment</label>
            <select 
              value={inputs.hosting}
              onChange={(e) => setInputs({...inputs, hosting: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option>Shared Hosting (e.g., Bluehost, GoDaddy)</option>
              <option>VPS (e.g., DigitalOcean, Linode)</option>
              <option>Managed WordPress (e.g., WP Engine)</option>
              <option>Enterprise / Dedicated</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Developer Skill Level</label>
            <select 
              value={inputs.techSkill}
              onChange={(e) => setInputs({...inputs, techSkill: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
        </div>

        <button 
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
          Generate Risk Report
        </button>
      </div>

      {analysis && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="text-lg font-bold text-slate-800 mb-2">Executive Summary</h3>
             <p className="text-slate-600">{analysis.summary}</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {analysis.risks.map((risk, idx) => (
              <div key={idx} className={`p-5 rounded-lg border-l-4 shadow-sm bg-white ${getSeverityColor(risk.severity)}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    {getIcon(risk.category)}
                    <span>{risk.title}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    risk.severity === 'Critical' ? 'bg-red-200 text-red-900' : 
                    risk.severity === 'High' ? 'bg-orange-200 text-orange-900' : 'bg-slate-200 text-slate-800'
                  }`}>
                    {risk.severity}
                  </span>
                </div>
                <p className="text-slate-700 mb-3 text-sm">{risk.description}</p>
                <div className="bg-white/50 p-3 rounded border border-slate-200/50">
                  <span className="font-semibold text-xs uppercase tracking-wider text-slate-500 block mb-1">Mitigation Strategy</span>
                  <p className="text-sm text-slate-800">{risk.mitigation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskAnalyzer;
