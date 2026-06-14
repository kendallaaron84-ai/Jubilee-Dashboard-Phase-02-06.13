import React, { useState } from 'react';
import { Code, Copy, Check, Loader2, Settings } from 'lucide-react';
import { generatePluginCode } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const PluginGenerator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string>('');
  const [requirements, setRequirements] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setCode('');
    try {
      const generated = await generatePluginCode(requirements || "Standard audiobook transcription setup.");
      setCode(generated);
    } catch (error) {
      console.error("Failed to generate code", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      <div className="bg-white p-6 rounded-t-xl shadow-sm border border-slate-200 flex-shrink-0">
        <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
          <Code className="text-purple-600" />
          Plugin Boilerplate Generator
        </h2>
        <p className="text-slate-600 mb-4 text-sm">
          Generate a custom WordPress plugin structure that adheres to the best practices identified in the Risk Assessment.
        </p>
        
        <div className="flex gap-4">
          <textarea
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="E.g., I need a settings page for the API key, a custom post type for 'Audiobooks', and it should delete the file from GCS after transcription."
            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none h-24 text-sm resize-none"
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 rounded-lg transition-colors flex items-center justify-center gap-2 w-48 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Settings />}
            Generate Code
          </button>
        </div>
      </div>

      <div className="flex-1 bg-slate-900 overflow-hidden rounded-b-xl border-x border-b border-slate-200 relative">
        {code ? (
          <>
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={copyToClipboard}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg backdrop-blur-sm transition-colors"
              >
                {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <div className="h-full overflow-y-auto p-6 text-slate-100 font-mono text-sm leading-relaxed">
              <ReactMarkdown 
                components={{
                  code({node, inline, className, children, ...props}: any) {
                    return !inline ? (
                      <div className="bg-black/30 p-4 rounded-lg my-4 overflow-x-auto border border-white/10">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </div>
                    ) : (
                      <code className="bg-white/10 px-1 py-0.5 rounded text-purple-200" {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {code}
              </ReactMarkdown>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500">
            <div className="text-center">
              <Code className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>Generated code will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PluginGenerator;
