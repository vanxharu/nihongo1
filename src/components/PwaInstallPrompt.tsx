/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Laptop, 
  X, 
  Check, 
  HelpCircle, 
  MoreVertical, 
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Share2,
  PlusSquare,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PwaInstallPromptProps {
  onDismiss?: () => void;
  initialTab?: 'windows' | 'android' | 'ios' | 'mac';
}

export function detectPlatform(): 'windows' | 'android' | 'ios' | 'mac' | 'other' {
  if (typeof window === 'undefined') return 'windows';
  const ua = navigator.userAgent.toLowerCase();
  if (/windows|win32|win64/i.test(ua)) return 'windows';
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  if (/macintosh|mac os x/i.test(ua)) return 'mac';
  return 'windows';
}

export function isAppInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const isStandaloneMode = 
      (window.matchMedia && (window.matchMedia('(display-mode: standalone)')?.matches || window.matchMedia('(display-mode: window-controls-overlay)')?.matches)) ||
      (window.navigator as any)?.standalone === true ||
      (typeof document !== 'undefined' && document.referrer && document.referrer.includes('android-app://'));
    const storedFlag = typeof localStorage !== 'undefined' ? localStorage.getItem('jpstudy_app_installed') === 'true' : false;
    return Boolean(isStandaloneMode || storedFlag);
  } catch {
    return false;
  }
}

export function markAppAsInstalled(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('jpstudy_app_installed', 'true');
    window.dispatchEvent(new Event('jpstudy_installed_state_changed'));
  } catch {}
}

export default function PwaInstallPrompt({ onDismiss, initialTab }: PwaInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(isAppInstalled());
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showBanner, setShowBanner] = useState<boolean>(true);
  const [platform, setPlatform] = useState<'windows' | 'android' | 'ios' | 'mac'>('windows');
  const [activeTab, setActiveTab] = useState<'windows' | 'android' | 'ios' | 'mac'>('windows');

  useEffect(() => {
    // Check if already installed
    if (isAppInstalled()) {
      setIsInstalled(true);
      setShowBanner(false);
      return;
    }

    const detected = detectPlatform();
    const resolvedPlatform = detected === 'other' ? 'windows' : detected;
    setPlatform(resolvedPlatform);
    setActiveTab(initialTab || resolvedPlatform);

    // Check if user previously dismissed banner in localStorage
    const dismissed = localStorage.getItem('jpstudy_pwa_banner_dismissed');
    if (dismissed && Date.now() - parseInt(dismissed, 10) < 3 * 24 * 60 * 60 * 1000) {
      setShowBanner(false);
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isAppInstalled()) {
        setShowBanner(true);
      }
    };

    const handleAppInstalled = () => {
      markAppAsInstalled();
      setIsInstalled(true);
      setShowBanner(false);
      setShowModal(false);
      setDeferredPrompt(null);
    };

    const handleStateChanged = () => {
      if (isAppInstalled()) {
        setIsInstalled(true);
        setShowBanner(false);
        setShowModal(false);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('jpstudy_installed_state_changed', handleStateChanged);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('jpstudy_installed_state_changed', handleStateChanged);
    };
  }, [initialTab]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult && choiceResult.outcome === 'accepted') {
        markAppAsInstalled();
        setIsInstalled(true);
        setShowBanner(false);
        setShowModal(false);
      }
      setDeferredPrompt(null);
    } else {
      // Show manual step-by-step guide for platform
      setShowModal(true);
    }
  };

  const handleDismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem('jpstudy_pwa_banner_dismissed', Date.now().toString());
    if (onDismiss) onDismiss();
  };

  const handleConfirmInstalledManually = () => {
    markAppAsInstalled();
    setIsInstalled(true);
    setShowBanner(false);
    setShowModal(false);
  };

  if (isInstalled) return null;

  return (
    <>
      {/* Floating Bottom Banner */}
      <AnimatePresence>
        {showBanner && !isInstalled && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 xl:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md bg-[#121624]/95 text-white p-4 rounded-2xl shadow-2xl border border-sky-500/40 z-50 backdrop-blur-lg"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-rose-500 p-0.5 shadow-md shrink-0 flex items-center justify-center text-white font-black text-xl">
                  {platform === 'windows' ? (
                    <Monitor className="w-6 h-6 text-white" />
                  ) : (
                    <Smartphone className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase text-sky-400 tracking-wider">
                      {platform === 'windows' ? 'Cài Đặt App Windows / PC' : 'Cài Đặt Ứng Dụng'}
                    </span>
                    <span className="px-1.5 py-0.2 bg-sky-500/20 text-sky-300 text-[10px] font-bold rounded-full border border-sky-500/30">
                      {platform === 'windows' ? 'Edge / Chrome PC' : 'Android / iOS'}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-white leading-tight">
                    {platform === 'windows' ? 'Cài NihonGo! lên máy tính Windows' : 'Cài NihonGo! lên màn hình chính'}
                  </h3>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    {platform === 'windows' 
                      ? 'Chạy trong cửa sổ riêng biệt như phần mềm máy tính, ghim Taskbar mở cực nhanh!' 
                      : 'Mở nhanh như ứng dụng thật, học mượt mà không bị vướng thanh trình duyệt!'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleDismissBanner}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Đóng thông báo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setActiveTab(platform);
                  setShowModal(true);
                }}
                className="text-xs text-rose-300 hover:text-rose-100 font-bold underline flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Xem hướng dẫn chi tiết
              </button>

              <button
                onClick={handleInstallClick}
                className="px-4 py-2 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                {deferredPrompt ? 'Cài Đặt Ngay' : 'Cách Cài Đặt'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comprehensive Install Modal with Windows / Android / iOS tabs */}
      <AnimatePresence>
        {showModal && !isInstalled && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#181e33] text-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-700/80 space-y-5 relative my-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base sm:text-lg flex items-center gap-1.5">
                      Cài Đặt NihonGo!
                      <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full">
                        Desktop & Mobile
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300 font-medium">Trải nghiệm ứng dụng mượt mà không cần mở trình duyệt</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Platform Selector Tabs */}
              <div className="grid grid-cols-3 gap-1.5 bg-[#121624] p-1.5 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('windows')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-black text-xs transition-all cursor-pointer ${
                    activeTab === 'windows'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  <span>Windows (PC)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('android')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-black text-xs transition-all cursor-pointer ${
                    activeTab === 'android'
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Android</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('ios')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-black text-xs transition-all cursor-pointer ${
                    activeTab === 'ios'
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Laptop className="w-4 h-4" />
                  <span>iOS / Mac</span>
                </button>
              </div>

              {/* 1-Click Native Install Button (if browser prompt is ready) */}
              {deferredPrompt && (
                <div className="p-4 bg-gradient-to-r from-rose-950/80 to-indigo-950/80 border border-rose-500/50 rounded-2xl text-center space-y-2">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-rose-300">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>Trình duyệt đã sẵn sàng cài đặt tự động 1-Click!</span>
                  </div>
                  <button
                    onClick={handleInstallClick}
                    className="w-full py-3 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-black text-sm rounded-xl shadow-lg shadow-rose-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Download className="w-4.5 h-4.5" />
                    Cài Đặt NihonGo! Trên {activeTab === 'windows' ? 'Windows' : activeTab.toUpperCase()} Ngay
                  </button>
                </div>
              )}

              {/* TAB 1: WINDOWS PC INSTRUCTIONS */}
              {activeTab === 'windows' && (
                <div className="space-y-3.5">
                  <div className="bg-rose-950/30 border border-rose-500/30 p-3 rounded-xl text-xs text-slate-200 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-rose-300 block mb-0.5">Lợi ích khi cài trên Windows:</strong>
                      Ứng dụng mở trong cửa sổ độc lập không viền, tự tạo biểu tượng ngoài Desktop và Taskbar, nhận thông báo từ vựng trên Windows Action Center kể cả khi đóng trình duyệt.
                    </div>
                  </div>

                  <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Các cách cài đặt trên Microsoft Edge & Google Chrome:
                  </p>

                  {/* Step 1 for Windows: Address bar install button */}
                  <div className="flex items-start gap-3 p-3.5 bg-[#121624] rounded-2xl border border-slate-800">
                    <div className="w-7 h-7 rounded-full bg-rose-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div className="space-y-1 text-xs text-slate-200">
                      <p className="font-bold text-white">
                        Cách 1: Bấm biểu tượng Cài đặt trên thanh địa chỉ (Address Bar)
                      </p>
                      <p className="text-slate-300 leading-relaxed">
                        Nhìn vào góc phải thanh địa chỉ trình duyệt (nơi gõ link website), bạn sẽ thấy biểu tượng <strong>[+] App</strong> hoặc hình máy tính có mũi tên xuống <Download className="w-3.5 h-3.5 text-rose-400 inline" /> <strong>"Cài đặt NihonGo!"</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 for Windows: 3 dots menu */}
                  <div className="flex items-start gap-3 p-3.5 bg-[#121624] rounded-2xl border border-slate-800">
                    <div className="w-7 h-7 rounded-full bg-rose-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div className="space-y-1 text-xs text-slate-200">
                      <p className="font-bold text-white">
                        Cách 2: Cài qua Menu 3 chấm của trình duyệt
                      </p>
                      <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                        <li><strong>Microsoft Edge:</strong> Bấm <MoreVertical className="w-3.5 h-3.5 inline text-slate-400" /> góc trên phải → Chọn <strong>"Ứng dụng" (Apps)</strong> → Chọn <strong>"Cài đặt NihonGo!"</strong>.</li>
                        <li><strong>Google Chrome:</strong> Bấm <MoreVertical className="w-3.5 h-3.5 inline text-slate-400" /> → Chọn <strong>"Lưu và chia sẻ" (Save & share)</strong> → Chọn <strong>"Cài đặt NihonGo!..."</strong>.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Step 3 for Windows: Pin to taskbar */}
                  <div className="flex items-start gap-3 p-3.5 bg-[#121624] rounded-2xl border border-slate-800">
                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 text-xs text-slate-200">
                      <p className="font-bold text-white">
                        Ghim vào Taskbar và Desktop
                      </p>
                      <p className="text-slate-300 leading-relaxed">
                        Sau khi bấm <strong>"Cài đặt" (Install)</strong>, chọn tích <em>"Ghim vào thanh tác vụ (Taskbar)"</em> và <em>"Tạo lối tắt trên màn hình nền (Desktop)"</em> để mở học bất cứ lúc nào!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ANDROID INSTRUCTIONS */}
              {activeTab === 'android' && (
                <div className="space-y-3.5">
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Hướng dẫn cài đặt trên Google Chrome Android:
                  </p>

                  <div className="flex items-start gap-3 p-3.5 bg-[#121624] rounded-2xl border border-slate-800">
                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div className="space-y-0.5 text-xs text-slate-200">
                      <p className="font-bold text-white">
                        Nhấn vào dấu 3 chấm <MoreVertical className="w-3.5 h-3.5 inline text-slate-400" /> ở góc trên phải Chrome
                      </p>
                      <p className="text-slate-400">Mở danh mục cài đặt của trình duyệt Chrome Android.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 bg-[#121624] rounded-2xl border border-slate-800">
                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div className="space-y-0.5 text-xs text-slate-200">
                      <p className="font-bold text-white">
                        Chọn "Cài đặt ứng dụng" hoặc "Thêm vào Màn hình chính"
                      </p>
                      <p className="text-slate-400">(Tùy phiên bản Chrome: <em>Install app</em> hoặc <em>Add to Home screen</em>)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 bg-[#121624] rounded-2xl border border-slate-800">
                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div className="space-y-0.5 text-xs text-slate-200">
                      <p className="font-bold text-white">
                        Xác nhận "Cài đặt"
                      </p>
                      <p className="text-slate-400">Biểu tượng NihonGo! sẽ tự động xuất hiện trên màn hình điện thoại Android!</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: IOS / MAC INSTRUCTIONS */}
              {activeTab === 'ios' && (
                <div className="space-y-3.5">
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Hướng dẫn cài đặt trên Safari iOS (iPhone / iPad) & Mac:
                  </p>

                  <div className="flex items-start gap-3 p-3.5 bg-[#121624] rounded-2xl border border-slate-800">
                    <div className="w-7 h-7 rounded-full bg-rose-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div className="space-y-0.5 text-xs text-slate-200">
                      <p className="font-bold text-white flex items-center gap-1.5">
                        Nhấn nút Chia sẻ <Share2 className="w-3.5 h-3.5 text-rose-400 inline" /> trên thanh công cụ Safari
                      </p>
                      <p className="text-slate-400">Biểu tượng hình vuông có mũi tên chỉ lên ở đáy màn hình Safari.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 bg-[#121624] rounded-2xl border border-slate-800">
                    <div className="w-7 h-7 rounded-full bg-rose-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div className="space-y-0.5 text-xs text-slate-200">
                      <p className="font-bold text-white flex items-center gap-1.5">
                        Cuộn xuống và chọn <PlusSquare className="w-3.5 h-3.5 text-rose-400 inline" /> "Thêm vào MH chính" (Add to Home Screen)
                      </p>
                      <p className="text-slate-400">Hoặc trên macOS Sonoma: Chọn <em>"Add to Dock"</em>.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 bg-[#121624] rounded-2xl border border-slate-800">
                    <div className="w-7 h-7 rounded-full bg-rose-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div className="space-y-0.5 text-xs text-slate-200">
                      <p className="font-bold text-white">
                        Nhấn "Thêm" (Add) ở góc trên phải
                      </p>
                      <p className="text-slate-400">App NihonGo! đã sẵn sàng trên màn hình chính của bạn!</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Confirmation / Dismiss buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmInstalledManually}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30"
                >
                  <Check className="w-4 h-4" />
                  Đã cài đặt xong (Ẩn nút này)
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer border border-slate-700"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// Global button trigger component to insert in Header or elsewhere
export function InstallAppButton({ className }: { className?: string }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(isAppInstalled());
  const [platform, setPlatform] = useState<'windows' | 'android' | 'ios' | 'mac'>('windows');

  useEffect(() => {
    if (isAppInstalled()) {
      setIsInstalled(true);
      return;
    }

    const detected = detectPlatform();
    setPlatform(detected === 'other' ? 'windows' : detected);

    const handlePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      markAppAsInstalled();
      setIsInstalled(true);
    };

    const handleStateChanged = () => {
      if (isAppInstalled()) {
        setIsInstalled(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('jpstudy_installed_state_changed', handleStateChanged);

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('jpstudy_installed_state_changed', handleStateChanged);
    };
  }, []);

  if (isInstalled) return null;

  const handleClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice && choice.outcome === 'accepted') {
        markAppAsInstalled();
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={className || "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black text-xs rounded-lg shadow-xs transition-all cursor-pointer shrink-0 active:scale-95"}
        title={platform === 'windows' ? "Cài đặt ứng dụng NihonGo! trên Windows PC" : "Cài đặt ứng dụng NihonGo!"}
      >
        {platform === 'windows' ? (
          <Monitor className="w-3.5 h-3.5" />
        ) : platform === 'ios' ? (
          <Laptop className="w-3.5 h-3.5" />
        ) : (
          <Smartphone className="w-3.5 h-3.5" />
        )}
        <span className="hidden sm:inline">
          {platform === 'windows' ? 'Cài App Windows' : platform === 'ios' ? 'Cài App iOS' : 'Cài App Android'}
        </span>
      </button>

      {showModal && (
        <PwaInstallPrompt 
          initialTab={platform} 
          onDismiss={() => setShowModal(false)} 
        />
      )}
    </>
  );
}

// Sidebar Windows App Callout Card
export function SidebarWindowsInstallCard() {
  const [showModal, setShowModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(isAppInstalled());
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (isAppInstalled()) {
      setIsInstalled(true);
      return;
    }
    const handlePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const handleAppInstalled = () => {
      markAppAsInstalled();
      setIsInstalled(true);
    };
    const handleStateChanged = () => {
      if (isAppInstalled()) {
        setIsInstalled(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('jpstudy_installed_state_changed', handleStateChanged);
    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('jpstudy_installed_state_changed', handleStateChanged);
    };
  }, []);

  if (isInstalled) return null;

  const handleClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice && choice.outcome === 'accepted') {
        markAppAsInstalled();
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <div 
        onClick={handleClick}
        className="mx-3 my-2 p-3 rounded-2xl bg-gradient-to-br from-[#1c233a] to-[#121624] border border-sky-500/30 hover:border-sky-400/60 shadow-lg cursor-pointer transition-all duration-200 group hover:-translate-y-0.5"
      >
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-white transition-all">
            <Monitor className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-black text-white group-hover:text-sky-300 transition-colors">Cài App Windows</span>
              <span className="text-[9px] font-bold bg-sky-500/20 text-sky-300 px-1.5 py-0.2 rounded font-mono">PC</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium line-clamp-1">Mở nhanh trên Taskbar & Desktop</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] text-sky-400 font-bold">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            {deferredPrompt ? 'Cài đặt ngay 1-click' : 'Xem hướng dẫn'}
          </span>
          <span className="text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all">→</span>
        </div>
      </div>

      {showModal && (
        <PwaInstallPrompt 
          initialTab="windows" 
          onDismiss={() => setShowModal(false)} 
        />
      )}
    </>
  );
}
