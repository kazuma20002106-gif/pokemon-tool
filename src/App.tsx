import React, { useState, useEffect } from 'react';
import svData from './data/sv.json';
import championsData from './data/champions.json';
import { Search, ChevronUp, ChevronDown, Minus, User, Swords, Trash2, Plus, Gamepad2 } from 'lucide-react';

interface Pokemon {
  id: number;
  name: string;
  types: string[];
  speed: number;
}

type GameVersion = 'champions' | 'sv';

const App: React.FC = () => {
  const [gameVersion, setGameVersion] = useState<GameVersion>('champions');
  const [myTeam, setMyTeam] = useState<(Pokemon | null)[]>(Array(6).fill(null));
  const [searchQuery, setSearchQuery] = useState('');
  const [opponent, setOpponent] = useState<Pokemon | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const pokemonData = gameVersion === 'champions' ? championsData : svData;

  // Load from local storage
  useEffect(() => {
    const savedVersion = localStorage.getItem('selectedGameVersion') as GameVersion;
    if (savedVersion) {
      setGameVersion(savedVersion);
    }
    
    // 作品ごとに保存されたパーティを読み込む
    const savedTeam = localStorage.getItem(`myPokemonTeam_${savedVersion || 'champions'}`);
    if (savedTeam) {
      try {
        setMyTeam(JSON.parse(savedTeam));
      } catch (e) {
        console.error("Failed to parse team from local storage", e);
      }
    } else {
      setMyTeam(Array(6).fill(null));
    }
  }, []);

  // Save version
  const handleVersionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVersion = e.target.value as GameVersion;
    setGameVersion(newVersion);
    localStorage.setItem('selectedGameVersion', newVersion);
    
    // Switch team data
    const savedTeam = localStorage.getItem(`myPokemonTeam_${newVersion}`);
    if (savedTeam) {
      try {
        setMyTeam(JSON.parse(savedTeam));
      } catch (e) {
        setMyTeam(Array(6).fill(null));
      }
    } else {
      setMyTeam(Array(6).fill(null));
    }
    
    // Clear opponent search
    setOpponent(null);
    setSearchQuery('');
  };

  // Save to local storage
  const saveTeam = (team: (Pokemon | null)[]) => {
    setMyTeam(team);
    localStorage.setItem(`myPokemonTeam_${gameVersion}`, JSON.stringify(team));
  };

  // Improved search handling (up to 8 results for better UX)
  const filteredPokemon = pokemonData.filter(p => 
    p.name.includes(searchQuery) || p.name.startsWith(searchQuery)
  ).slice(0, 8);

  const handleSelectMyPokemon = (index: number, p: Pokemon) => {
    const newTeam = [...myTeam];
    newTeam[index] = p;
    saveTeam(newTeam);
  };

  const handleRemoveMyPokemon = (index: number) => {
    const newTeam = [...myTeam];
    newTeam[index] = null;
    saveTeam(newTeam);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-sans text-slate-800">
      <header className="bg-gradient-to-r from-pokemon-red to-red-600 text-white p-4 shadow-lg sticky top-0 z-10 flex items-center justify-between">
        <h1 className="text-lg font-black tracking-widest drop-shadow-md">BATTLE HUB</h1>
        <div className="flex items-center bg-white/20 rounded-lg px-2 py-1">
          <Gamepad2 className="w-4 h-4 mr-2" />
          <select 
            value={gameVersion}
            onChange={handleVersionChange}
            className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer appearance-none"
          >
            <option value="champions" className="text-slate-800">チャンピオンズ</option>
            <option value="sv" className="text-slate-800">SV(スカーレット・バイオレット)</option>
          </select>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto space-y-6">
        {/* 自陣登録エリア */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-100 p-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center">
              <User className="w-5 h-5 mr-2 text-slate-600" />
              <h2 className="font-bold text-slate-700">マイパーティ</h2>
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
              {myTeam.filter(p => p !== null).length} / 6
            </span>
          </div>
          <div className="p-3 grid grid-cols-2 gap-3">
            {myTeam.map((p, i) => (
              <div key={i} className="relative group transition-transform active:scale-[0.98]">
                {p ? (
                  <div className="border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-white rounded-xl p-3 flex flex-col justify-between h-full relative shadow-sm">
                    <button 
                      onClick={() => handleRemoveMyPokemon(i)}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md transition-colors z-10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <div className="text-sm font-bold text-slate-800 truncate">{p.name}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-500 bg-indigo-100 px-1.5 py-0.5 rounded">S: {p.speed}</span>
                      <div className="flex gap-0.5 max-w-[50%] flex-wrap justify-end">
                        {p.types.map((t, idx) => (
                          <span key={idx} className="text-[8px] px-1 py-0.5 bg-slate-200 text-slate-600 rounded-sm truncate">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 hover:border-indigo-300 active:bg-indigo-50/50 bg-slate-50 rounded-xl p-3 h-[72px] flex flex-col items-center justify-center cursor-pointer transition-colors" onClick={() => {
                    const input = document.getElementById('team-add-input');
                    if (input) input.focus();
                  }}>
                    <Plus className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-[10px] font-medium text-slate-400">登録する</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* インクリメンタルサーチ & 素早さ比較 */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-100 p-3 border-b border-slate-200 flex items-center">
            <Swords className="w-5 h-5 mr-2 text-slate-600" />
            <h2 className="font-bold text-slate-700">対戦相手 (素早さ比較)</h2>
          </div>
          
          <div className="p-4">
            <div className="relative">
              <div className="flex items-center border-2 border-slate-200 rounded-xl bg-slate-50 overflow-hidden focus-within:ring-4 focus-within:ring-pokemon-red/20 focus-within:border-pokemon-red transition-all">
                <Search className="w-5 h-5 ml-3 text-slate-400" />
                <input
                  type="text"
                  className="w-full p-3 bg-transparent outline-none text-slate-800 font-medium placeholder:font-normal placeholder:text-slate-400"
                  placeholder="相手のポケモン名を入力..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                />
                {searchQuery && (
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setOpponent(null);
                      const input = document.querySelector('input');
                      if(input) input.focus();
                    }}
                    className="mr-3 text-slate-400 hover:text-slate-600 p-1"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* サジェストドロップダウン */}
              {showDropdown && searchQuery && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto overflow-x-hidden">
                  {filteredPokemon.length > 0 ? (
                    filteredPokemon.map((p) => (
                      <button
                        key={p.id}
                        className="w-full text-left p-3 hover:bg-slate-50 active:bg-slate-100 border-b border-slate-100 last:border-0 flex justify-between items-center transition-colors"
                        onClick={() => {
                          setOpponent(p);
                          setSearchQuery(p.name);
                          setShowDropdown(false);
                          // スマホでキーボードを閉じる処理
                          (document.activeElement as HTMLElement)?.blur();
                        }}
                      >
                        <span className="font-bold text-slate-700">{p.name}</span>
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">S: {p.speed}</span>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-slate-400 text-sm font-medium text-center">見つかりませんでした</div>
                  )}
                </div>
              )}
            </div>

            {/* 爆速比較UI */}
            {opponent && (
              <div className="mt-6 animate-[fadeIn_0.3s_ease-out]">
                <div className="flex justify-between items-end mb-4 px-1">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    {opponent.name}
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                      S: {opponent.speed}
                    </span>
                  </h3>
                </div>
                
                <div className="space-y-2">
                  {myTeam.map((myPoke, i) => {
                    if (!myPoke) return null;
                    
                    const isFaster = myPoke.speed > opponent.speed;
                    const isTie = myPoke.speed === opponent.speed;
                    
                    let bgClass = "bg-slate-50 border-slate-200";
                    let icon = <Minus className="w-5 h-5 text-slate-400" />;
                    let statusText = "同速";
                    let textColor = "text-slate-500";
                    
                    if (isFaster) {
                      bgClass = "bg-gradient-to-r from-blue-50 to-blue-100/50 border-blue-200";
                      icon = <ChevronUp className="w-6 h-6 text-blue-600 drop-shadow-sm" />;
                      statusText = "速い";
                      textColor = "text-blue-700";
                    } else if (!isTie) {
                      bgClass = "bg-gradient-to-r from-red-50 to-red-100/50 border-red-200";
                      icon = <ChevronDown className="w-6 h-6 text-red-500 drop-shadow-sm" />;
                      statusText = "遅い";
                      textColor = "text-red-600";
                    }

                    return (
                      <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${bgClass} shadow-sm transition-all`}>
                        <div className="flex items-center gap-3">
                          <div className="font-bold text-slate-800 w-28 truncate">{myPoke.name}</div>
                          <div className="text-[10px] font-bold text-slate-500 bg-white/50 px-1.5 py-0.5 rounded">S: {myPoke.speed}</div>
                        </div>
                        <div className={`flex items-center font-black ${textColor}`}>
                          <span className="text-sm mr-1 tracking-wide">{statusText}</span>
                          {icon}
                        </div>
                      </div>
                    );
                  })}
                  {myTeam.every(p => p === null) && (
                    <div className="text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 py-8 mt-4">
                      <p className="text-sm font-medium text-slate-500">自陣のポケモンが登録されていません</p>
                      <p className="text-xs text-slate-400 mt-1">下のバーからポケモンを追加してください</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 自陣登録用ボトムバー */}
      <div className="fixed bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-200 p-3 shadow-[0_-8px_20px_-5px_rgba(0,0,0,0.05)] z-20">
        <div className="max-w-md mx-auto relative">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[11px] font-bold text-indigo-600 flex items-center">
              <Plus className="w-3 h-3 mr-1" /> パーティに追加
            </p>
            <p className="text-[10px] font-medium text-slate-400">※空き枠に自動追加</p>
          </div>
          <div className="relative">
            <input
              id="team-add-input"
              type="text"
              className="w-full p-2.5 pl-9 border-2 border-indigo-100 rounded-xl bg-indigo-50/50 text-sm font-medium text-slate-700 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all placeholder:text-indigo-300"
              placeholder={`${gameVersion === 'champions' ? 'チャンピオンズ' : 'SV'}のポケモン名...`}
              onChange={(e) => {
                const val = e.target.value;
                if (val.length > 0) {
                  const found = pokemonData.find(p => p.name.startsWith(val) || p.name.includes(val));
                  if (found) {
                    const emptyIndex = myTeam.findIndex(p => p === null);
                    if (emptyIndex !== -1) {
                      handleSelectMyPokemon(emptyIndex, found);
                      e.target.value = '';
                      // Optional: close keyboard on mobile after adding
                      // e.target.blur();
                    }
                  }
                }
              }}
            />
            <Search className="w-4 h-4 absolute left-3 top-3 text-indigo-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
