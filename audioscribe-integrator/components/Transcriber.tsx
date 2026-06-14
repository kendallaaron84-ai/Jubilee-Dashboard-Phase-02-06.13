import React, { useState, useRef } from 'react';
import { Mic, Upload, FileAudio, Play, Pause, FileText, Sparkles, Loader2, Info } from 'lucide-react';
import { transcribeAudio } from '../services/geminiService';

const Transcriber: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setAudioSrc(url);
      setTranscription('');
      if (audioRef.current) {
        audioRef.current.load();
      }
    }
  };

  const handleTranscribe = async () => {
    if (!file) return;

    setLoading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        // Remove data URL prefix (e.g., "data:audio/mp3;base64,")
        const base64Data = base64String.split(',')[1];
        
        const text = await transcribeAudio(base64Data, file.type);
        setTranscription(text || "No transcription generated.");
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Transcription error", error);
      alert("Failed to transcribe. Ensure the file is a valid audio format supported by Gemini.");
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col gap-6">
      {/* Header */}
      <div className="bg-indigo-900 text-white p-6 rounded-xl shadow-lg flex items-start gap-4">
        <div className="p-3 bg-white/10 rounded-lg">
          <Sparkles className="w-6 h-6 text-yellow-300" />
        </div>
        <div>
          <h2 className="text-xl font-bold mb-1">Prototype Transcriber</h2>
          <p className="text-indigo-200 text-sm">
            Test audio transcription quality using the Gemini API. 
            <br />
            <span className="text-xs opacity-75 flex items-center gap-1 mt-1">
              <Info className="w-3 h-3" />
              Note: The final WP plugin will use Google Cloud Speech-to-Text, but this prototype demonstrates the AI capability.
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
        
        {/* Input Column */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <FileAudio className="w-4 h-4" />
              Audio Source
            </h3>
            {file && <span className="text-xs font-mono bg-slate-200 px-2 py-1 rounded text-slate-600">{file.name}</span>}
          </div>
          
          <div className="p-6 flex flex-col gap-6 flex-1 justify-center items-center">
             {!file ? (
               <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 mb-3 text-slate-400" />
                      <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-slate-500">MP3, WAV, M4A (Max 20MB for demo)</p>
                  </div>
                  <input type="file" className="hidden" accept="audio/*" onChange={handleFileChange} />
              </label>
             ) : (
                <div className="w-full text-center space-y-6">
                  <div className="w-24 h-24 bg-indigo-50 rounded-full mx-auto flex items-center justify-center border-4 border-indigo-100">
                    <Mic className="w-10 h-10 text-indigo-600" />
                  </div>
                  
                  <audio 
                    ref={audioRef} 
                    src={audioSrc || undefined} 
                    onEnded={() => setIsPlaying(false)}
                    onPause={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                    className="hidden"
                  />
                  
                  <div className="flex justify-center gap-4">
                     <button 
                        onClick={togglePlay}
                        className="flex items-center gap-2 px-6 py-2 bg-slate-800 text-white rounded-full hover:bg-slate-700 transition-colors"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        {isPlaying ? 'Pause' : 'Preview Audio'}
                     </button>
                     <button 
                        onClick={() => setFile(null)}
                        className="text-sm text-red-500 hover:text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                  </div>

                  <button
                    onClick={handleTranscribe}
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                    Start Transcription
                  </button>
                </div>
             )}
          </div>
        </div>

        {/* Output Column */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Result
            </h3>
          </div>
          <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <p className="text-sm font-medium animate-pulse">Processing audio stream...</p>
              </div>
            ) : transcription ? (
              <div className="prose prose-slate max-w-none">
                <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-serif text-lg">
                  {transcription}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <FileText className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm">Transcription will appear here</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Transcriber;
