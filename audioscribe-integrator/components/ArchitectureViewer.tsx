import React from 'react';
import { ArrowRight, Database, Mic, Server, Globe, UploadCloud, FileAudio, FileText, Clock } from 'lucide-react';

const ArchitectureViewer: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Recommended Architecture</h2>
        <p className="text-slate-600 mb-8">
          To avoid PHP timeouts and memory limits, users should never upload large audiobooks directly to the WordPress server. 
          Instead, use a <strong>Signed URL</strong> pattern to upload directly to Google Cloud Storage (GCS) from the browser.
        </p>

        {/* Diagram Container */}
        <div className="relative bg-slate-50 border border-slate-200 rounded-xl p-8 overflow-x-auto">
          <div className="min-w-[800px] flex items-center justify-between gap-4 relative">
            
            {/* Step 1: WordPress Admin */}
            <div className="flex flex-col items-center z-10 w-48">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-3 shadow-sm">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800">1. WP Admin</h3>
              <p className="text-xs text-center text-slate-500 mt-1">Request upload URL</p>
            </div>

            <ArrowRight className="text-slate-300 w-8 h-8 flex-shrink-0" />

            {/* Step 2: WordPress Server */}
            <div className="flex flex-col items-center z-10 w-48">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-3 shadow-sm">
                <Server className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800">2. WP Backend</h3>
              <p className="text-xs text-center text-slate-500 mt-1">Generates GCS Signed URL</p>
            </div>

            <ArrowRight className="text-slate-300 w-8 h-8 flex-shrink-0" />

            {/* Step 3: Google Cloud Storage */}
            <div className="flex flex-col items-center z-10 w-48">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-3 shadow-sm">
                <Database className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800">3. Google Storage</h3>
              <p className="text-xs text-center text-slate-500 mt-1">Browser uploads directly</p>
            </div>

            <ArrowRight className="text-slate-300 w-8 h-8 flex-shrink-0" />

            {/* Step 4: Speech to Text */}
            <div className="flex flex-col items-center z-10 w-48">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-3 shadow-sm">
                <Mic className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800">4. Speech-to-Text</h3>
              <p className="text-xs text-center text-slate-500 mt-1">Async Processing</p>
            </div>
          </div>

           {/* Feedback Loop */}
           <div className="absolute top-1/2 left-[18%] right-[18%] h-32 border-b-2 border-dashed border-slate-300 -z-0 rounded-b-full"></div>
           <div className="absolute top-[calc(50%+7rem)] left-1/2 -translate-x-1/2 bg-white px-3 text-xs font-medium text-slate-500">
              Webhook / Polling for Completion
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <UploadCloud className="text-blue-500 w-5 h-5" />
            Direct Upload Strategy
          </h3>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="mt-1 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
              Bypass WordPress <code>upload_max_filesize</code> limitations completely.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
              Reduce server load; the PHP server only handles authentication, not the file stream.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
              Requires configuring CORS on the GCS bucket to allow your WP domain.
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Clock className="text-green-500 w-5 h-5" />
            Async Transcription
          </h3>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="mt-1 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
              Audiobooks are long. <code>LongRunningRecognize</code> API operation is mandatory.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
              Do not wait for the response in PHP. The request will time out.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
              Use WP-Cron or a dedicated webhook endpoint to check status or receive results.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureViewer;
