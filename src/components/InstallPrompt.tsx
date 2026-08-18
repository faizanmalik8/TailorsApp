"use client";

import React, { useState, useEffect } from 'react';

// Extend Window interface for beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPrompt() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true);
  const [isDismissed, setIsDismissed] = useState(true);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // 1. Check if user already dismissed
    const dismissed = localStorage.getItem('tailors_install_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      return;
    }
    setIsDismissed(false);

    // 2. Check if already installed (standalone mode)
    const checkStandalone = () => {
      const isRunningStandalone = window.matchMedia('(display-mode: standalone)').matches 
        || (window.navigator as any).standalone === true;
      setIsStandalone(isRunningStandalone);
    };
    checkStandalone();

    // 3. Android/Chrome Install Prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. iOS Safari Detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);
    if (isIOSDevice) {
      // iOS doesn't have beforeinstallprompt, so we just assume it's installable if not standalone
      setIsInstallable(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (isStandalone || isDismissed || !isInstallable) {
    return null; // Don't show anything if already installed, dismissed, or not installable
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      // Show iOS instructional modal
      setShowIOSModal(true);
    } else if (deferredPrompt) {
      // Show Android/Chrome native prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('tailors_install_dismissed', 'true');
  };

  return (
    <>
      {/* Banner floating at the bottom */}
      <div className="fixed bottom-20 left-4 right-4 z-[90] bg-[#152A4A] rounded-xl shadow-2xl p-4 flex items-center gap-4 animate-slide-up border border-blue-900/50">
        <div className="bg-white/10 p-2 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-100"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </div>
        <div className="flex-1">
          <h4 className="text-white font-bold text-sm">Install B Tailor</h4>
          <p className="text-blue-200 text-xs mt-0.5">Add to home screen for faster access & offline use.</p>
        </div>
        <div className="flex flex-col gap-2">
          <button 
            onClick={handleInstallClick}
            className="bg-amber-400 text-amber-950 px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shadow-sm hover:bg-amber-300"
          >
            Install Now
          </button>
          <button 
            onClick={handleDismiss}
            className="text-white/50 text-[10px] uppercase font-bold tracking-wider hover:text-white"
          >
            Not Now
          </button>
        </div>
      </div>

      {/* iOS Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center bg-black/60 p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-sm p-6 pb-10 animate-slide-up shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#152A4A]">Install on iPhone</h3>
              <button onClick={() => setShowIOSModal(false)} className="text-gray-400 p-2 bg-gray-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex gap-4 items-start bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="bg-white p-2 rounded-lg shadow-sm shrink-0 text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                </div>
                <div>
                  <p className="font-bold text-[#152A4A] mb-1">Step 1</p>
                  <p className="text-sm text-gray-600">Tap the <strong>Share</strong> icon in the bottom menu bar of Safari.</p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="bg-white p-2 rounded-lg shadow-sm shrink-0 text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                </div>
                <div>
                  <p className="font-bold text-[#152A4A] mb-1">Step 2</p>
                  <p className="text-sm text-gray-600">Scroll down and tap <strong>Add to Home Screen</strong>.</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowIOSModal(false)}
              className="w-full mt-8 bg-[#152A4A] text-white py-3 rounded-xl font-bold"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
