import React, { useState, useEffect, useMemo } from 'react';
import { X, Check, ShoppingBag, Coins, Lock, Sparkles, Search, SlidersHorizontal } from 'lucide-react';
import {
  ALL_SKINS,
  getOwnedSkins,
  unlockSkin,
  getSelectedSkin,
  setSelectedSkin,
  getTotalCoins,
} from '../utils/storage';
import { soundManager } from '../utils/audio';

interface GarageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkinChanged: (skinId: string) => void;
}

type CategoryType = 'ALL' | 'ELEMENTAL' | 'CYBER' | 'ROYAL' | 'COSMIC' | 'ARCADE';
type OwnershipFilter = 'all' | 'owned' | 'locked';

const CATEGORIES: { id: CategoryType; label: string; icon: string }[] = [
  { id: 'ALL', label: 'All', icon: '🌟' },
  { id: 'ELEMENTAL', label: 'Elemental', icon: '🔥' },
  { id: 'CYBER', label: 'Cyber', icon: '⚡' },
  { id: 'ROYAL', label: 'Royal', icon: '👑' },
  { id: 'COSMIC', label: 'Cosmic', icon: '🌌' },
  { id: 'ARCADE', label: 'Arcade', icon: '🕹️' },
];

export const GarageModal: React.FC<GarageModalProps> = ({
  isOpen,
  onClose,
  onSkinChanged,
}) => {
  const [coins, setCoins] = useState<number>(getTotalCoins());
  const [ownedSkins, setOwnedSkins] = useState<string[]>(getOwnedSkins());
  const [selectedSkin, setSelectedSkinState] = useState<string>(getSelectedSkin());
  const [previewSkinId, setPreviewSkinId] = useState<string>(getSelectedSkin());
  const [activeCategory, setActiveCategory] = useState<CategoryType>('ALL');
  const [ownershipFilter, setOwnershipFilter] = useState<OwnershipFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setCoins(getTotalCoins());
      setOwnedSkins(getOwnedSkins());
      const current = getSelectedSkin();
      setSelectedSkinState(current);
      setPreviewSkinId(current);
    }
  }, [isOpen]);

  // Listen to storage update events
  useEffect(() => {
    const handleCoinsUpdate = () => {
      setCoins(getTotalCoins());
    };
    const handleSkinsUpdate = () => {
      setOwnedSkins(getOwnedSkins());
    };
    window.addEventListener('fb2_coins_updated', handleCoinsUpdate);
    window.addEventListener('fb2_skins_updated', handleSkinsUpdate);
    return () => {
      window.removeEventListener('fb2_coins_updated', handleCoinsUpdate);
      window.removeEventListener('fb2_skins_updated', handleSkinsUpdate);
    };
  }, []);

  // Filtered skins based on Category, Search Query, and Ownership
  const filteredSkins = useMemo(() => {
    return ALL_SKINS.filter((skin) => {
      // Category filter
      if (activeCategory !== 'ALL' && skin.category !== activeCategory) {
        return false;
      }
      // Search term filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = skin.name.toLowerCase().includes(query);
        const matchesDesc = skin.description.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }
      // Ownership filter
      const isOwned = ownedSkins.includes(skin.id);
      if (ownershipFilter === 'owned' && !isOwned) return false;
      if (ownershipFilter === 'locked' && isOwned) return false;

      return true;
    });
  }, [activeCategory, searchQuery, ownershipFilter, ownedSkins]);

  if (!isOpen) return null;

  const currentPreview = ALL_SKINS.find((s) => s.id === previewSkinId) || ALL_SKINS[0];
  const isPreviewOwned = ownedSkins.includes(currentPreview.id);
  const isPreviewEquipped = selectedSkin === currentPreview.id;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Unlock or Equip action
  const handleAction = (skin = currentPreview) => {
    const isOwned = ownedSkins.includes(skin.id);

    if (isOwned) {
      setSelectedSkin(skin.id);
      setSelectedSkinState(skin.id);
      onSkinChanged(skin.id);
      soundManager.playFlap();
      showToast(`${skin.name} EQUIPPED! ✨`);
    } else {
      // Purchase skin
      if (coins >= skin.cost) {
        const success = unlockSkin(skin.id, skin.cost);
        if (success) {
          soundManager.playCoin();
          const nextCoins = getTotalCoins();
          const nextOwned = getOwnedSkins();
          setCoins(nextCoins);
          setOwnedSkins(nextOwned);
          setSelectedSkin(skin.id);
          setSelectedSkinState(skin.id);
          onSkinChanged(skin.id);
          showToast(`UNLOCKED & EQUIPPED ${skin.name}! 🎉`);
        }
      } else {
        soundManager.playHit();
        showToast(`Need ${skin.cost - coins} more coins! Pass more pillars to earn coins.`);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-amber-50 via-yellow-50 to-orange-100 rounded-3xl p-4 sm:p-5 border-4 border-amber-500 shadow-2xl max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={() => {
            soundManager.playFlap();
            onClose();
          }}
          className="absolute -top-3 -right-3 w-10 h-10 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center border-2 border-white shadow-lg font-bold cursor-pointer transition-transform active:scale-95 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Title and Coin Counter */}
        <div className="flex items-center justify-between mb-2.5 pb-2 border-b-2 border-amber-200 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-xl border-2 border-amber-600 flex items-center justify-center shadow">
              <ShoppingBag className="w-5 h-5 text-amber-900" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xl sm:text-2xl font-cartoon text-amber-950 text-stroke-sm leading-none">
                  FLAPPY GARAGE
                </h2>
                <span className="bg-amber-500 text-white text-[10px] font-cartoon px-1.5 py-0.5 rounded-full border border-amber-600 shadow-xs">
                  {ALL_SKINS.length}+ SKINS
                </span>
              </div>
              <p className="text-[11px] font-game text-amber-700">
                Unlocked: <span className="font-bold text-amber-900">{ownedSkins.length}</span> / {ALL_SKINS.length} · All 200+ Coins
              </p>
            </div>
          </div>

          {/* Coin Badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-yellow-300 px-3 py-1.5 rounded-2xl border-2 border-amber-600 shadow-sm">
              <Coins className="w-4 h-4 text-amber-950 fill-amber-500" />
              <span className="font-cartoon text-sm text-amber-950 text-stroke-sm">
                {coins}
              </span>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="mb-2 py-1.5 px-3 bg-amber-900 text-white rounded-xl text-center font-cartoon text-xs animate-bounce shadow shrink-0">
            {toastMessage}
          </div>
        )}

        {/* Featured Character Preview Display */}
        <div className="relative bg-gradient-to-b from-sky-400 via-sky-300 to-sky-200 rounded-2xl p-3 border-2 border-sky-400 shadow-inner flex flex-col items-center justify-center mb-2.5 shrink-0 overflow-hidden">
          {/* Subtle clouds in preview background */}
          <div className="absolute top-1 left-2 w-14 h-4 bg-white/70 rounded-full blur-[0.5px]" />
          <div className="absolute top-2 right-4 w-16 h-5 bg-white/60 rounded-full blur-[0.5px]" />

          {/* Category Tag */}
          <div className="absolute top-2 left-2 z-10">
            <span className="text-[10px] font-cartoon px-2 py-0.5 rounded-full bg-white/85 text-slate-800 border border-slate-300 shadow-xs">
              {currentPreview.category}
            </span>
          </div>

          {/* Trail color indicator */}
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded-full border border-slate-300 text-[10px] font-cartoon text-slate-700">
            <span
              className="w-2.5 h-2.5 rounded-full border border-black/20"
              style={{ backgroundColor: currentPreview.trailColor }}
            />
            <span>Trail</span>
          </div>

          {/* Live Bird Sprite with hueShift */}
          <div className="relative w-24 h-16 sm:w-28 sm:h-18 flex items-center justify-center animate-gentle-bob my-1">
            <img
              src="/assets/aistudio/Screenshot_2026-11-01_135323-removebg-preview_0282861d.png"
              alt={currentPreview.name}
              style={{
                filter: currentPreview.hueShift
                  ? `hue-rotate(${currentPreview.hueShift}deg) drop-shadow(0 4px 10px ${currentPreview.glowColor})`
                  : `drop-shadow(0 4px 10px ${currentPreview.glowColor})`,
              }}
              className="max-w-full max-h-full object-contain cursor-pointer transition-all duration-300"
              onClick={() => soundManager.playBirdChirp(1.2)}
              title="Click to chirp!"
            />
          </div>

          <div className="font-cartoon text-lg sm:text-xl text-slate-800 text-stroke-sm">
            {currentPreview.name}
          </div>
          <div className="text-[11px] font-game text-slate-600 text-center px-2 line-clamp-1 mb-2">
            {currentPreview.description}
          </div>

          {/* Big Action Button (Equip / Unlock) */}
          <div className="w-full max-w-[280px]">
            {isPreviewEquipped ? (
              <div className="w-full py-1.5 rounded-xl bg-emerald-500 text-white font-cartoon text-xs sm:text-sm text-center border-2 border-emerald-600 shadow flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4 stroke-[3]" />
                EQUIPPED
              </div>
            ) : isPreviewOwned ? (
              <button
                onClick={() => handleAction(currentPreview)}
                className="w-full py-1.5 rounded-xl btn-3d-blue text-white font-cartoon text-xs sm:text-sm text-stroke-sm tracking-wide border-2 border-sky-600 shadow cursor-pointer transition-transform active:scale-95"
              >
                EQUIP THIS AVIATOR
              </button>
            ) : coins >= currentPreview.cost ? (
              <button
                onClick={() => handleAction(currentPreview)}
                className="w-full py-1.5 rounded-xl btn-3d-orange text-white font-cartoon text-xs sm:text-sm text-stroke-sm tracking-wide border-2 border-amber-600 shadow cursor-pointer transition-transform active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>UNLOCK FOR {currentPreview.cost} COINS</span>
                <Coins className="w-4 h-4 fill-amber-300" />
              </button>
            ) : (
              <div className="w-full py-1.5 rounded-xl bg-slate-200/90 text-slate-700 font-cartoon text-xs text-center border-2 border-slate-300 shadow">
                LOCKED · NEED {currentPreview.cost - coins} MORE COINS
              </div>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-2 shrink-0 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const count =
              cat.id === 'ALL'
                ? ALL_SKINS.length
                : ALL_SKINS.filter((s) => s.category === cat.id).length;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  soundManager.playFlap();
                  setActiveCategory(cat.id);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-cartoon whitespace-nowrap transition-all border cursor-pointer flex items-center gap-1 ${
                  isActive
                    ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                    : 'bg-white/80 text-amber-900 border-amber-300 hover:bg-amber-100'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1 rounded-full ${isActive ? 'bg-amber-800 text-amber-100' : 'bg-amber-200 text-amber-800'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-2 mb-2 shrink-0">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-700" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 100+ flapper skins..."
              className="w-full pl-8 pr-7 py-1 text-xs font-game bg-white/90 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-amber-400 text-amber-950"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-600 hover:text-amber-900 cursor-pointer text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Filter: All / Owned / Locked */}
          <div className="flex items-center bg-white/90 border border-amber-300 rounded-xl p-0.5 text-[10px] font-cartoon">
            {(['all', 'owned', 'locked'] as OwnershipFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setOwnershipFilter(filter)}
                className={`px-2 py-0.5 rounded-lg capitalize transition-colors cursor-pointer ${
                  ownershipFilter === filter
                    ? 'bg-amber-500 text-white'
                    : 'text-amber-800 hover:text-amber-950'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Skin Selection Grid */}
        <div className="flex-1 overflow-y-auto pr-1 min-h-[140px] max-h-[220px]">
          {filteredSkins.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 text-amber-800">
              <SlidersHorizontal className="w-6 h-6 mb-1 text-amber-500 opacity-60" />
              <p className="font-cartoon text-xs">No skins found</p>
              <p className="text-[10px] font-game text-amber-600">Try clearing search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {filteredSkins.map((skin) => {
                const isOwned = ownedSkins.includes(skin.id);
                const isEquipped = selectedSkin === skin.id;
                const isSelectedForPreview = previewSkinId === skin.id;

                return (
                  <button
                    key={skin.id}
                    onClick={() => {
                      setPreviewSkinId(skin.id);
                      handleAction(skin);
                    }}
                    className={`relative p-1.5 sm:p-2 rounded-2xl border-2 flex flex-col items-center justify-between transition-all cursor-pointer ${
                      isSelectedForPreview
                        ? 'bg-amber-100 border-amber-500 shadow-md ring-2 ring-amber-400'
                        : isOwned
                        ? 'bg-white/90 border-amber-200 hover:bg-amber-50'
                        : 'bg-slate-100/90 border-slate-300 opacity-90 hover:opacity-100'
                    }`}
                  >
                    {/* Equipped Badge */}
                    {isEquipped && (
                      <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white rounded-full p-0.5 border border-white shadow">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}

                    {/* Lock Badge if not owned */}
                    {!isOwned && (
                      <span className="absolute -top-1.5 -left-1.5 bg-amber-500 text-white rounded-full p-0.5 border border-white shadow">
                        <Lock className="w-3 h-3" />
                      </span>
                    )}

                    {/* Mini Sprite thumbnail */}
                    <div className="w-11 h-9 flex items-center justify-center my-0.5">
                      <img
                        src="/assets/aistudio/Screenshot_2026-11-01_135323-removebg-preview_0282861d.png"
                        alt={skin.name}
                        style={{
                          filter: skin.hueShift ? `hue-rotate(${skin.hueShift}deg)` : undefined,
                        }}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>

                    <div className="font-cartoon text-[11px] text-slate-800 text-center leading-tight mt-0.5 line-clamp-1 w-full px-0.5">
                      {skin.name}
                    </div>

                    {/* Status/Cost */}
                    <div className="mt-1 w-full text-center">
                      {isEquipped ? (
                        <span className="text-[9px] font-cartoon text-emerald-700 bg-emerald-100 px-1 py-0.5 rounded-md block">
                          EQUIPPED
                        </span>
                      ) : isOwned ? (
                        <span className="text-[9px] font-cartoon text-sky-700 bg-sky-100 px-1 py-0.5 rounded-md block">
                          OWNED
                        </span>
                      ) : (
                        <span className="text-[9px] font-cartoon text-amber-900 bg-yellow-200 px-1 py-0.5 rounded-md flex items-center justify-center gap-0.5">
                          <Coins className="w-2.5 h-2.5 fill-amber-500" />
                          {skin.cost}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Info & Tip */}
        <div className="pt-2 mt-2 border-t border-amber-200 flex items-center justify-between text-xs font-game text-amber-800 shrink-0">
          <div className="flex items-center gap-1 font-cartoon text-[11px] text-amber-900">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Pass pillars to claim coins & unlock!</span>
          </div>

          <button
            onClick={() => {
              soundManager.playFlap();
              onClose();
            }}
            className="px-4 py-1.5 font-cartoon text-xs text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow border border-amber-600 cursor-pointer transition-transform active:scale-95"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
