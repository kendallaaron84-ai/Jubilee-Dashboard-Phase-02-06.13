"use client";

import React, { useState, useEffect, useRef } from "react";
import Layout from "@/components/layout"; // 🔑 The master UI wrapper that injects your sidebar natively!
import { 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  Play, 
  Sparkles, 
  Plus, 
  UserCheck, 
  HelpCircle, 
  FolderLock,
  Mic,
  Music4
} from "lucide-react";

const productsData = [
  {
    id: "prod_duncan",
    title: "Duncan the Man Hunter",
    type: "Audiobook",
    vaultItem: "Duncan_Voice_V3_Master.wav",
    voiceId: "id_hash_xkqUDC0eiBTlezQNPr2apKGSgeF3",
    stripeStatus: "Active - Direct Connected",
    shortcode: '[koba_player asset_id="duncan_audiobook_13hr"]',
    studioKey: "koba_st_key_duncan_99z81x",
    characters: [
      { name: "Duncan (Protagonist)", model: "Noir-Gravel-V3", status: "Synced" },
      { name: "Narrator / Secondary", model: "Deep-Texas-V1", status: "Synced" }
    ],
    approvedVoices: ["Duncan_Gravel_Clip.mp3", "Narrator_Warm_Draft.mp3"]
  },
  {
    id: "prod_ai_course",
    title: "AI Audio Engineering Mastery",
    type: "Digital Course",
    vaultItem: "Polymath_Lecturer_V1.wav",
    voiceId: "id_hash_polymath778392",
    stripeStatus: "Active - Direct Connected",
    shortcode: '[koba_course id="ai_mastery_leaders"]',
    studioKey: "koba_st_key_course_44a12q",
    characters: [],
    approvedVoices: ["Lecturer_Tone_Check.mp3"]
  },
  {
    id: "prod_plugin_license",
    title: "KOBA-I Audio Plugin License",
    type: "Software License",
    vaultItem: "N/A - Standalone Codebase",
    voiceId: "id_hash_software_matrix_01",
    stripeStatus: "Active - Platform Core",
    shortcode: '[koba_player UI_injection="native"]',
    studioKey: "koba_st_key_plugin_88b19p",
    characters: [],
    approvedVoices: []
  }
];

export default function StudioPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [blogState, setBlogState] = useState<"LOADING" | "ACTIVE" | "INACTIVE">("LOADING");
  const [blogError, setBlogError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Monitors the live status of audio.koba-i.com to reveal silent block states
  useEffect(() => {
    const checkBlogHealth = async () => {
      try {
        const res = await fetch("https://audio.koba-i.com/wp-json/", {
          method: "GET",
          mode: "cors"
        });
        if (!res.ok) throw new Error(`Handshake Flags Rejected: Status ${res.status}`);
        setBlogState("ACTIVE");
      } catch (err: any) {
        setBlogState("INACTIVE");
        setBlogError(err.message === "Failed to fetch" ? "CORS Restrictions or Target Host Offline" : err.message);
      }
    };
    checkBlogHealth();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const scrollTop = containerRef.current.scrollTop;
      const itemHeight = containerRef.current.clientHeight;
      const currentIndex = Math.round(scrollTop / itemHeight);
      if (currentIndex !== activeIndex && currentIndex < productsData.length) {
        setActiveIndex(currentIndex);
      }
    };

    const container = containerRef.current;
    container?.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, [activeIndex]);

  const activeProject = productsData[activeIndex];

  return (
    <Layout>
      {/* Container spacing parameters aligned directly with the Nexus Engine context framework */}
      <div className="p-6 space-y-6 max-w-7xl mx-auto text-white font-sans">
        
        {/* Core Upper Section Identity Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">KOBA-I Studio Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Monitor voice vaults, manage persona matrices, and review distribution pipelines.
          </p>
        </div>

        {/* The Linked Flex Control Deck Matrix Container */}
        <div className="flex flex-col lg:flex-row gap-6 w-full h-[600px] bg-card rounded-2xl border border-border overflow-hidden shadow-xl">
          
          {/* LEFT SIDE: Vertical Scroll-Snapping Carousel Area */}
          <div 
            ref={containerRef}
            className="w-full lg:w-1/2 h-full overflow-y-auto snap-y snap-mandatory scrollbar-none bg-slate-950/20"
            style={{ scrollSnapType: "y mandatory", scrollbarWidth: "none" }}
          >
            {productsData.map((project, index) => (
              <div 
                key={project.id}
                className="h-full w-full flex flex-col justify-center px-8 lg:px-12 snap-start border-b border-border/40 relative"
              >
                {/* Positional Progress Dots Indicator Track */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 items-center">
                  {productsData.map((_, dotIndex) => (
                    <div 
                      key={dotIndex}
                      className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                        dotIndex === index ? "bg-emerald-400 h-5" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>

                <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-semibold">
                  {project.type} Core Interface
                </span>
                <h2 className="text-xl font-extrabold mt-1 mb-3 text-white">
                  {project.title}
                </h2>
                
                {/* Embedded Operations Control Block Card */}
                <div className="space-y-4 w-full max-w-sm bg-slate-900/40 p-4 rounded-xl border border-border/80 backdrop-blur-sm shadow-md">
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                      WordPress UI Embed Code
                    </label>
                    <code className="block bg-slate-950 p-2 rounded-lg font-mono text-xs text-yellow-400 select-all border border-slate-900 text-center">
                      {project.shortcode}
                    </code>
                  </div>

                  {/* Character Persona Management Area */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                        Character Persona Cast
                      </label>
                      <button className="text-[9px] text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-0.5">
                        <Plus className="h-2 w-2" /> Provision Profile
                      </button>
                    </div>

                    {project.characters.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {project.characters.map((char, cIdx) => (
                          <div key={cIdx} className="bg-slate-950/90 p-2 rounded-lg border border-border/40 flex flex-col justify-between">
                            <div>
                              <div className="text-[11px] font-bold text-slate-200 truncate">{char.name}</div>
                              <div className="text-[9px] text-muted-foreground font-mono mt-0.5">{char.model}</div>
                            </div>
                            <span className="text-[8px] font-mono mt-1.5 text-emerald-400 bg-emerald-500/5 px-1 rounded self-start flex items-center gap-0.5 border border-emerald-500/10">
                              <UserCheck className="h-1.5 w-1.5" /> Auto-Assigned
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[10px] font-mono text-muted-foreground bg-slate-950/40 p-2.5 rounded-lg text-center italic border border-dashed border-border/40">
                        No localized persona profiles required.
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-border/40">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Gateway status</span>
                    <span className="text-[10px] font-bold text-emerald-400 font-mono bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">{project.stripeStatus}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* RIGHT SIDE: Sticky Infrastructure Pipeline Monitor Tracks */}
          <div className="w-full lg:w-1/2 h-full bg-slate-950/10 flex flex-col justify-between p-5 relative border-l border-border">
            
            {/* Animated Gradient Wire Tube Track */}
            <div className="absolute left-[34px] top-16 bottom-32 w-[1px] bg-border/60 z-0">
              <div 
                className="w-full bg-gradient-to-b from-emerald-400 via-cyan-400 to-purple-500 transition-all duration-700 ease-out"
                style={{
                  height: activeIndex === 0 ? "33%" : activeIndex === 1 ? "66%" : "100%",
                  top: 0
                }}
              />
            </div>

            {/* TOP COMPONENT: Blog REST API Handshake Card */}
            <div className="w-full z-10">
              <div className={`p-3 rounded-xl border backdrop-blur-md transition-all ${
                blogState === "ACTIVE" ? "bg-slate-950/80 border-emerald-500/20 shadow-sm" : 
                blogState === "INACTIVE" ? "bg-red-950/10 border-red-500/20" : "bg-slate-950/40 border-border"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {blogState === "ACTIVE" ? (
                      <Wifi className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                    ) : (
                      <WifiOff className="h-3.5 w-3.5 text-red-400" />
                    )}
                    <div>
                      <h3 className="text-xs font-bold tracking-wider uppercase text-foreground">audio.koba-i.com Sync Endpoint</h3>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded ${
                    blogState === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                  }`}>
                    {blogState}
                  </span>
                </div>
                {blogState === "INACTIVE" && (
                  <div className="mt-2 flex gap-1.5 items-start text-[10px] text-red-400 bg-red-950/40 p-2 rounded border border-red-500/10 font-mono">
                    <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5 text-red-500" />
                    <div><span className="font-bold">HEALTH RUN FAILURE:</span> {blogError}</div>
                  </div>
                )}
              </div>
            </div>

            {/* MIDDLE COMPONENT: Cloud Allocation Framework Node Map */}
            <div className="w-full flex flex-col items-end z-10 my-auto space-y-3">
              <div className="w-full max-w-[260px] space-y-3 pr-2">
                
                <div className="p-2.5 rounded-xl border bg-slate-950/90 border-border shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <FolderLock className="h-3 w-3 text-emerald-400" />
                    <span className="text-[9px] font-bold uppercase text-muted-foreground">1. Vault Location</span>
                  </div>
                  <div className="text-[9px] font-mono text-emerald-400 mt-1 truncate bg-slate-900/90 px-2 py-0.5 rounded border border-slate-900">
                    bucket://{activeProject?.vaultItem}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border bg-slate-950/90 border-border shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-cyan-400" />
                    <span className="text-[9px] font-bold uppercase text-muted-foreground">2. Digital Voice ID</span>
                  </div>
                  <div className="text-[9px] font-mono text-cyan-400 mt-1 truncate bg-slate-900/90 px-2 py-0.5 rounded border border-slate-900">
                    sig://{activeProject?.voiceId}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border bg-slate-950/90 border-border shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="h-3 w-3 text-purple-400" />
                    <span className="text-[9px] font-bold uppercase text-muted-foreground">3. WP Studio Token</span>
                  </div>
                  <div className="text-[9px] font-mono text-purple-400 mt-1 truncate bg-slate-900/90 px-2 py-0.5 rounded border border-slate-900">
                    token://{activeProject?.studioKey}
                  </div>
                </div>

              </div>
            </div>

            {/* BOTTOM COMPONENT: Review & Auditing Player Board */}
            <div className="w-full z-10 pt-2 border-t border-border/60">
              <div className="bg-slate-950 border border-border rounded-xl p-3 shadow-md">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-1.5">
                    <Mic className="h-3.5 w-3.5 text-emerald-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Author Listening Lounge</h4>
                  </div>
                </div>

                {activeProject?.approvedVoices.length > 0 ? (
                  <div className="space-y-1">
                    {activeProject.approvedVoices.map((track, tIdx) => (
                      <div key={tIdx} className="flex items-center justify-between bg-slate-900/30 px-2 py-1 rounded border border-border/40 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-300 truncate">
                          <Music4 className="h-3 w-3 text-muted-foreground" />
                          <span className="truncate font-mono text-[10px] text-slate-400">{track}</span>
                        </div>
                        <button className="h-5 w-5 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950 transition-all">
                          <Play className="h-2 w-2 fill-current" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3 text-muted-foreground font-mono text-[10px] italic bg-slate-900/10 rounded border border-dashed border-border/40">
                    No verified sound master tracks present.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </Layout>
  );
}