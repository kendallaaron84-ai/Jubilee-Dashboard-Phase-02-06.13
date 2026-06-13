"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";
// 🔑 Import Auth
import { getAuth, onAuthStateChanged } from "firebase/auth";

interface Manuscript {
  id: string;
  title: string;
}

export function AuthorIntakeForm() {
  // 1. DECLARE ALL STATES FIRST (No hardcoded strings!)
  const [authorEmail, setAuthorEmail] = useState<string | null>(null);
  
  const [topicTitle, setTopicTitle] = useState("");
  const [targetKeywords, setTargetKeywords] = useState("");
  const [brandAllocation, setBrandAllocation] = useState<"personal" | "book">("personal");
  const [manuscriptId, setManuscriptId] = useState("");
  const [customDirectives, setCustomDirectives] = useState("");
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [deploying, setDeploying] = useState(false);
  const [feedback, setFeedback] = useState<{ status: "idle" | "success" | "error"; message: string }>({ status: "idle", message: "" });

  // 2. DECLARE ALL EFFECTS SECOND
  // Effect A: Listen for the logged-in user
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user && user.email) {
            setAuthorEmail(user.email);
        } else {
            setAuthorEmail(null);
        }
    });
    return () => unsubscribe();
  }, []);

  // Effect B: Fetch Manuscripts
  useEffect(() => {
    // 🔑 Safety Check: Do not try to fetch if we don't have an email yet!
    if (!authorEmail) return;

    const unsubscribe = onSnapshot(
      collection(db, "users", authorEmail, "manuscripts"),
      (snapshot) => {
        const list: Manuscript[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, title: doc.data().title });
        });
        setManuscripts(list);
      },
      (err) => {
        console.error("Error pulling manuscripts dropdown: ", err);
      }
    );
    return () => unsubscribe();
  }, [authorEmail, brandAllocation]);

  // 3. CONDITIONAL RETURNS THIRD
  // Now it is safe to block the UI while waiting for the Auth token
  if (!authorEmail) {
      return (
          <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">
              Authenticating secure session...
          </div>
      );
  }

  // 4. EVENT HANDLERS LAST
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    try {
      setDeploying(true);
      setFeedback({ status: "idle", message: "" });

      // 1. REGISTER PIPELINE TRACE: Instantly set UI to "Processing"
      const docRef = await addDoc(collection(db, "content_blueprints"), {
        authorEmail: authorEmail,
        topicTitle: topicTitle, 
        brandAllocation: brandAllocation,
        manuscriptId: manuscriptId || "",
        executionState: "processing", 
        createdAt: serverTimestamp(), 
        updatedAt: serverTimestamp()
      });

      const targetKeywordsArray = targetKeywords
        ? targetKeywords.split(",").map(kw => kw.trim()).filter(Boolean)
        : [];

      // 2. SECURE PROXY HANDSHAKE (This now returns instantly without timing out)
      const response = await fetch("/api/generate-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: topicTitle,               
          blueprintId: docRef.id,          
          authorEmail: authorEmail,
          brandAllocation: brandAllocation,
          keywords: targetKeywordsArray,   
        }),
      });

      if (!response.ok) {
        await updateDoc(doc(db, "content_blueprints", docRef.id), {
            executionState: "failed", 
            updatedAt: serverTimestamp()
        });
        const errorData = await response.json();
        throw new Error(errorData.error || "Pipeline connection failed");
      }

      // 3. LET PYTHON DO THE HEAVY LIFTING
      // React steps back. Python will update the database to "completed" in ~70 seconds.
      setFeedback({ 
        status: "success", 
        message: "Pipeline initialized! The tracker will turn green when your assets are ready." 
      });
      
      setTopicTitle("");
      setTargetKeywords("");
      setCustomDirectives("");
      
    } catch (err: any) {
      console.error("Pipeline Error:", err.message);
      setFeedback({ status: "error", message: err.message });
    } finally {
      setDeploying(false);
    }
  };

  return (
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b space-y-1">
          <h2 className="text-xl font-bold text-card-foreground">Generate Automated Content</h2>
          <p className="text-sm text-muted-foreground">Enter your target topic. Our engine will process your brand voice parameters and deploy a custom SEO draft straight to your site.</p>
        </div>
  
        <form className="p-6 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Topic Title / Focus Keyword</label>
            <Input 
              value={topicTitle}
              onChange={(e) => setTopicTitle(e.target.value)}
              className="bg-background border-border text-foreground focus:ring-primary" 
              placeholder="e.g., How Audiobooks Are Changing Commutes" 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Target Keywords (Comma Separated)</label>
            <Input 
              value={targetKeywords}
              onChange={(e) => setTargetKeywords(e.target.value)}
              className="bg-background border-border text-foreground focus:ring-primary" 
              placeholder="e.g., commute, audible, listening habits" 
            />
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Brand Allocation Account</label>
              <select 
                value={brandAllocation}
                onChange={(e) => setBrandAllocation(e.target.value as "personal" | "book")}
                className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="personal">Author Personal Brand</option>
                <option value="book">Specific Book Brand</option>
              </select>
            </div>
  
            {brandAllocation === "book" && (
              <div className="space-y-2 animate-in fade-in duration-350">
                <label className="text-sm font-semibold text-foreground">Target Manuscript Context</label>
                <select 
                  value={manuscriptId}
                  onChange={(e) => setManuscriptId(e.target.value)}
                  required
                  className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Select contextual lore...</option>
                  {manuscripts?.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
  
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Context / Directives for Gemini (Optional)</label>
            <textarea 
              value={customDirectives}
              onChange={(e) => setCustomDirectives(e.target.value)}
              className="w-full min-h-[100px] p-3 rounded-md border border-border bg-background text-foreground text-sm resize-y focus:outline-none focus:ring-1 focus:ring-primary" 
              placeholder="Add specific brand angles, target ebook offers, or layout stylistic guidelines..." 
            />
          </div>
  
          {feedback.status === "success" && (
            <div className="p-4 bg-green-950/20 border border-green-800/40 rounded-lg flex items-start gap-3 text-xs text-green-500 animate-in slide-in-from-bottom-2">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{feedback.message}</span>
            </div>
          )}
  
          {feedback.status === "error" && (
            <div className="p-4 bg-red-950/20 border border-red-800/40 rounded-lg flex items-start gap-3 text-xs text-red-400 animate-in slide-in-from-bottom-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{feedback.message}</span>
            </div>
          )}
  
          <Button type="submit" disabled={deploying} className="w-full bg-primary text-primary-foreground font-bold py-2 rounded-lg gap-2">
            {deploying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing Algorithmic Frameworks...
              </>
            ) : (
              "Deploy Content Blueprint"
            )}
          </Button>
        </form>
      </div>
  );
}