import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Copy,
  Check,
  ExternalLink,
  Instagram,
  QrCode,
  Share2,
  Smartphone,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const BioLinkShareModal: React.FC = () => {
  const { store, setActiveView } = useStore();
  const [copied, setCopied] = useState(false);

  const bioUrl = `https://tapshop.co/@${store.handle}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(bioUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-6 pb-24 sm:pb-12">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
          Your Social Bio Link &amp; Profile Preview
        </h2>
        <p className="text-xs text-slate-500">
          Paste this link into your Instagram, TikTok, and Facebook bio so followers can order instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Link & Instructions */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Share Card */}
          <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Direct Storefront Link
            </span>

            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="flex-1 px-3 py-1 font-mono text-xs sm:text-sm text-emerald-800 font-semibold truncate">
                {bioUrl}
              </span>
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setActiveView('storefront')}
                className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Launch Live Storefront</span>
              </button>
            </div>
          </div>

          {/* Social Platform Integration Guide */}
          <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>How to Add to Social Media Bios</span>
            </h3>

            <div className="space-y-2.5 pt-1">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                <Instagram className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Instagram Bio:</strong>
                  <span className="text-slate-600">
                    Open Instagram → Edit Profile → Links → Add External Link → Paste your TapShop URL.
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                <Smartphone className="w-4 h-4 text-slate-800 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">TikTok Bio &amp; Videos:</strong>
                  <span className="text-slate-600">
                    Go to Edit profile → Website → Paste your TapShop link. Pin a video with "Shop via link in bio".
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Instagram Profile Simulation */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900 p-4 sm:p-5 rounded-3xl shadow-xl text-white">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-white/10">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Instagram className="w-4 h-4 text-pink-500" />
                Instagram Bio Simulation
              </span>
              <span>Live Preview</span>
            </div>

            {/* Simulated Phone Screen */}
            <div className="mt-4 bg-white text-slate-900 rounded-2xl p-4 shadow-inner space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between text-xs font-bold border-b border-slate-100 pb-2">
                <span>{store.instagram.replace('@', '')}</span>
                <span className="text-[10px] text-slate-400">Instagram</span>
              </div>

              {/* Profile Bar */}
              <div className="flex items-center gap-4">
                <img
                  src={store.logo}
                  alt={store.name}
                  className="w-16 h-16 rounded-full object-cover p-0.5 border-2 border-pink-500 shrink-0"
                />
                <div className="flex-1 flex justify-around text-center text-xs">
                  <div>
                    <div className="font-bold text-slate-900">142</div>
                    <div className="text-[10px] text-slate-500">posts</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">14.8k</div>
                    <div className="text-[10px] text-slate-500">followers</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">380</div>
                    <div className="text-[10px] text-slate-500">following</div>
                  </div>
                </div>
              </div>

              {/* Bio Text */}
              <div className="text-xs space-y-1">
                <div className="font-bold text-slate-900">{store.name}</div>
                <div className="text-slate-600">{store.slogan}</div>
                <div className="text-slate-500 text-[11px]">
                  📍 Same-day delivery across Nairobi & Kenya
                </div>

                {/* THE CLICKABLE LINK IN BIO */}
                <div className="pt-1">
                  <button
                    onClick={() => setActiveView('storefront')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline bg-blue-50 px-2 py-0.5 rounded-md"
                  >
                    <span>🔗 {bioUrl.replace('https://', '')}</span>
                  </button>
                </div>
              </div>

              {/* Simulated Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => setActiveView('storefront')}
                  className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  <span>Test Click Bio Link (Open Storefront)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
