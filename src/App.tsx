import React, { useState, useEffect } from 'react';
import svData from './data/sv.json';
import championsData from './data/champions.json';
import { Gamepad2, Sun, CloudRain, Wind, Snowflake, Info, Swords } from 'lucide-react';
import { PokemonDetailModal, Pokemon, MyPokemon, NATURES } from './components/PokemonDetailModal';
import { DamageCalculator } from './components/DamageCalculator';
import { BattlePokemonCard } from './components/BattlePokemonCard';
import { TeamSelector } from './components/TeamSelector';

export type BattleStatRanks = { attack: number, defense: number, spAttack: number, spDefense: number, speed: number };
type GameVersion = 'champions' | 'sv';

const ClickTooltip = ({ text, className = "w-48", align = 'center' }: { text: React.ReactNode, className?: string, align?: 'center' | 'right' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const [pos, setPos] = React.useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({
        top: rect.top,
        left: align === 'right' ? rect.right : rect.left + rect.width / 2
      });
      const handleScroll = () => setIsOpen(false);
      window.addEventListener('scroll', handleScroll, true);
      return () => window.removeEventListener('scroll', handleScroll, true);
    }
  }, [isOpen, align]);

  return (
    <div className="relative inline-flex items-center ml-1 align-middle">
      <button 
        ref={buttonRef}
        type="button"
        onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="text-slate-400 hover:text-slate-600 transition-colors p-1 -m-1"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {isOpen && (
        <div 
          className={`fixed z-[100] p-3 bg-slate-800 text-white text-[11px] rounded shadow-xl text-left font-normal leading-relaxed pointer-events-none ${className}`}
          style={{ 
            top: pos.top - 6,
            left: pos.left,
            transform: align === 'right' ? 'translate(-100%, -100%)' : 'translate(-50%, -100%)'
          }}
        >
          {text}
          <div 
            className={`absolute top-full border-4 border-transparent border-t-slate-800 ${
              align === 'right' ? 'right-2' : 'left-1/2 -translate-x-1/2'
            }`}
          ></div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [gameVersion, setGameVersion] = useState<GameVersion>('champions');
  
  // My Team State
  const [myTeam, setMyTeam] = useState<(MyPokemon | null)[]>(Array(6).fill(null));
  const [activeMyPokemonIndex, setActiveMyPokemonIndex] = useState<number>(0);
  const [calcMyPokemonIndices, setCalcMyPokemonIndices] = useState<number[]>([0,1,2,3,4,5]);
  const [myTeamSearchQuery, setMyTeamSearchQuery] = useState('');
  
  // Opponent Team State
  const [opponentTeam, setOpponentTeam] = useState<(MyPokemon | null)[]>(Array(6).fill(null));
  const [activeOpponentIndex, setActiveOpponentIndex] = useState<number>(0);
  const [opponentSearchQuery, setOpponentSearchQuery] = useState('');

  // Ranks & Editor
  const [oppBattleRanks, setOppBattleRanks] = useState<Record<number, BattleStatRanks>>({});
  const [myBattleRanks, setMyBattleRanks] = useState<Record<number, BattleStatRanks>>({});
  const [editingTeam, setEditingTeam] = useState<'my' | 'opp' | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Field State
  const [weather, setWeather] = useState<string>('none');

  const pokemonData = (gameVersion === 'champions' ? championsData : svData) as Pokemon[];

  useEffect(() => {
    const savedVersion = localStorage.getItem('selectedGameVersion') as GameVersion;
    if (savedVersion) setGameVersion(savedVersion);
    const savedMyTeam = localStorage.getItem(`myPokemonTeamV2_${savedVersion || 'champions'}`);
    if (savedMyTeam) {
      try { setMyTeam(JSON.parse(savedMyTeam)); } catch (e) { }
    }
  }, []);

  const handleVersionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVersion = e.target.value as GameVersion;
    setGameVersion(newVersion);
    localStorage.setItem('selectedGameVersion', newVersion);
    const savedMyTeam = localStorage.getItem(`myPokemonTeamV2_${newVersion}`);
    if (savedMyTeam) {
      try { setMyTeam(JSON.parse(savedMyTeam)); } catch (e) { setMyTeam(Array(6).fill(null)); }
    } else {
      setMyTeam(Array(6).fill(null));
    }
    setOpponentTeam(Array(6).fill(null));
  };

  const saveMyTeam = (team: (MyPokemon | null)[]) => {
    setMyTeam(team);
    localStorage.setItem(`myPokemonTeamV2_${gameVersion}`, JSON.stringify(team));
  };

  const createNewMyPokemon = (base: Pokemon): MyPokemon => ({
    base,
    evs: { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 },
    nature: NATURES[0],
    ability: base.abilities[0],
    moves: [null, null, null, null],
    item: 'なし'
  });

  const handleAddMyPokemon = (index: number, base: Pokemon) => {
    const newTeam = [...myTeam];
    newTeam[index] = createNewMyPokemon(base);
    saveMyTeam(newTeam);
    setEditingTeam('my');
    setEditingIndex(index);
    setActiveMyPokemonIndex(index);
  };

  const handleAddOpponent = (index: number, base: Pokemon) => {
    const newTeam = [...opponentTeam];
    newTeam[index] = createNewMyPokemon(base);
    setOpponentTeam(newTeam);
    setEditingTeam('opp');
    setEditingIndex(index);
    setActiveOpponentIndex(index);
  };

  const getMyRanks = (index: number) => myBattleRanks[index] || { attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 };
  const getOppRanks = (index: number) => oppBattleRanks[index] || { attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 };

  const handleMyRankChange = (index: number, stat: keyof BattleStatRanks, value: number) => {
    setMyBattleRanks(prev => ({ ...prev, [index]: { ...getMyRanks(index), [stat]: Math.max(-6, Math.min(6, value)) } }));
  };

  const handleOppRankChange = (index: number, stat: keyof BattleStatRanks, value: number) => {
    setOppBattleRanks(prev => ({ ...prev, [index]: { ...getOppRanks(index), [stat]: Math.max(-6, Math.min(6, value)) } }));
  };

  const getMegaEvolutions = (pokemon: Pokemon | undefined) => {
    if (!pokemon) return [];
    const isMega = pokemon.name.startsWith('メガ');
    const baseName = isMega ? pokemon.name.replace(/^メガ/, '').replace(/[XY]$/, '') : pokemon.name;
    const basePokemon = isMega ? pokemonData.find(p => p.name === baseName) : pokemon;
    return basePokemon ? pokemonData.filter(p => p.name.startsWith(`メガ${basePokemon.name}`)) : [];
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-6 font-sans text-slate-800">
      <header className="bg-gradient-to-r from-pokemon-red to-red-600 text-white p-4 shadow-lg sticky top-0 z-10 flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-6 h-6" />
          <div className="flex items-baseline gap-2">
            <h1 className="text-lg font-black tracking-widest drop-shadow-md">BATTLE HUB</h1>
            <span className="text-[10px] font-bold opacity-80 bg-black/20 px-1.5 py-0.5 rounded">v1.1.17</span>
          </div>
        </div>
        <div className="flex items-center bg-white/20 rounded-lg px-2 py-1">
          <Gamepad2 className="w-4 h-4 mr-2" />
          <select 
            value={gameVersion}
            onChange={handleVersionChange}
            className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer appearance-none"
          >
            <option value="champions" className="text-slate-800">チャンピオンズ</option>
            <option value="sv" className="text-slate-800">SV</option>
          </select>
        </div>
      </header>

      <main className="p-2 max-w-md mx-auto space-y-4 flex flex-col justify-center min-h-[calc(100vh-80px)]">
        {/* ================= 相手陣セクション ================= */}
        <section>
          <h2 className="text-sm font-bold text-slate-500 mb-2 px-1">相手パーティ</h2>
          <TeamSelector 
            isOpponent 
            team={opponentTeam} 
            activeIndex={activeOpponentIndex}
            onSelectActive={setActiveOpponentIndex}
            pokemonData={pokemonData}
            searchQuery={opponentSearchQuery}
            onSearchChange={setOpponentSearchQuery}
            onAddPokemon={handleAddOpponent}
            gameVersion={gameVersion}
            onRemovePokemon={(idx) => {
              const newTeam = [...opponentTeam];
              newTeam[idx] = null;
              setOpponentTeam(newTeam);
            }}
          />
          {opponentTeam[activeOpponentIndex] && (
            <div className="mt-3">
              <BattlePokemonCard 
                isOpponent
                pokemon={opponentTeam[activeOpponentIndex]!}
                basePokemonData={opponentTeam[activeOpponentIndex]!.base}
                ranks={getOppRanks(activeOpponentIndex)}
                onRankChange={(stat, val) => handleOppRankChange(activeOpponentIndex, stat, val)}
                onEdit={() => { setEditingTeam('opp'); setEditingIndex(activeOpponentIndex); }}
                megaEvolutions={getMegaEvolutions(opponentTeam[activeOpponentIndex]?.base)}
                onMegaEvolution={(mega) => {
                  const newTeam = [...opponentTeam];
                  newTeam[activeOpponentIndex] = { ...newTeam[activeOpponentIndex]!, base: mega, ability: mega.abilities[0] || '' };
                  setOpponentTeam(newTeam);
                }}
                onRevertMega={() => {
                  const newTeam = [...opponentTeam];
                  const baseName = newTeam[activeOpponentIndex]!.base.name.replace(/^メガ/, '').replace(/[XY]$/, '');
                  const base = pokemonData.find(p => p.name === baseName) || newTeam[activeOpponentIndex]!.base;
                  newTeam[activeOpponentIndex] = { ...newTeam[activeOpponentIndex]!, base, ability: base.abilities[0] || '' };
                  setOpponentTeam(newTeam);
                }}
              />
            </div>
          )}
        </section>

        {/* ================= フィールド・天候 ================= */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-3 pt-2 pb-1 flex items-center">
            <span className="text-[10px] font-bold text-slate-500">フィールドの天候</span>
            <ClickTooltip 
              className="w-64"
              text={
                <div className="space-y-1">
                  <p className="font-bold border-b border-slate-600 pb-1 mb-1">天候の効果</p>
                  <p>【晴れ】炎技1.5倍、水技0.5倍</p>
                  <p>【雨】水技1.5倍、炎技0.5倍</p>
                  <p>【砂嵐】岩タイプの特防1.5倍</p>
                  <p>【雪】氷タイプの防御1.5倍</p>
                  <p className="text-yellow-300 mt-1">※すいすい・サンパワーなどの特性も自動反映されます</p>
                </div>
              } 
            />
          </div>
          <div className="px-3 pb-2 flex overflow-x-auto gap-2 scrollbar-hide">
            {[
              { id: 'none', label: 'なし', icon: null, colorClass: 'bg-slate-500 border-slate-600 text-white' },
              { id: 'sun', label: '晴れ', icon: <Sun className="w-3.5 h-3.5" />, colorClass: 'bg-orange-500 border-orange-600 text-white' },
              { id: 'rain', label: '雨', icon: <CloudRain className="w-3.5 h-3.5" />, colorClass: 'bg-blue-500 border-blue-600 text-white' },
              { id: 'sandstorm', label: '砂嵐', icon: <Wind className="w-3.5 h-3.5" />, colorClass: 'bg-yellow-700 border-yellow-800 text-white' },
              { id: 'snow', label: '雪', icon: <Snowflake className="w-3.5 h-3.5" />, colorClass: 'bg-cyan-500 border-cyan-600 text-white' },
            ].map(w => (
              <button
                key={w.id}
                onClick={() => setWeather(w.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  weather === w.id
                    ? `${w.colorClass} shadow-md`
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {w.icon}{w.label}
              </button>
            ))}
          </div>
          {weather !== 'none' && (
            <div className="px-3 pb-2 text-[10px] text-slate-500 font-bold border-t border-slate-100 pt-2 bg-slate-50 rounded-b-xl">
              {weather === 'sun' && '炎タイプの技の威力が1.5倍、水タイプの技の威力が0.5倍になります。'}
              {weather === 'rain' && '水タイプの技の威力が1.5倍、炎タイプの技の威力が0.5倍になります。'}
              {weather === 'sandstorm' && '岩タイプのポケモンの特防が1.5倍になります。'}
              {weather === 'snow' && '氷タイプのポケモンの防御が1.5倍になります。'}
            </div>
          )}
        </section>

        {/* ================= ダメージ計算 ================= */}
        {opponentTeam[activeOpponentIndex] && myTeam.some(p => p !== null) && (
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-3">
            <div className="flex items-center text-slate-700 mb-3 border-b border-slate-200 pb-2">
              <Swords className="w-5 h-5 mr-2" />
              <h2 className="font-bold">ダメージ計算 (自陣 → 相手)</h2>
            </div>
            
            <div className="text-[10px] font-bold text-slate-500 mb-2">計算に参加させる自陣メンバー</div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 pb-2 border-b border-slate-100">
              {myTeam.map((p, i) => {
                if (!p) return null;
                const isActive = calcMyPokemonIndices.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (isActive) setCalcMyPokemonIndices(prev => prev.filter(idx => idx !== i));
                      else setCalcMyPokemonIndices(prev => [...prev, i]);
                    }}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                      isActive ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm' : 'bg-white text-slate-400 border-slate-200 opacity-60'
                    }`}
                  >
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.base.id}.png`} alt="" className="w-5 h-5 -ml-1 object-contain" />
                    <span className="truncate max-w-[60px]">{p.base.name}</span>
                  </button>
                );
              })}
            </div>

            <DamageCalculator 
              myTeam={myTeam}
              activePokemonIndices={calcMyPokemonIndices}
              myBattleRanks={myBattleRanks}
              opponent={opponentTeam[activeOpponentIndex]!}
              oppRanks={getOppRanks(activeOpponentIndex)}
              weather={weather}
            />
          </section>
        )}

        {/* ================= 自陣セクション ================= */}
        <section>
          <h2 className="text-sm font-bold text-slate-500 mb-2 px-1">マイパーティ</h2>
          <TeamSelector 
            team={myTeam} 
            activeIndex={activeMyPokemonIndex}
            onSelectActive={setActiveMyPokemonIndex}
            pokemonData={pokemonData}
            searchQuery={myTeamSearchQuery}
            onSearchChange={setMyTeamSearchQuery}
            onAddPokemon={handleAddMyPokemon}
            gameVersion={gameVersion}
            onRemovePokemon={(idx) => {
              const newTeam = [...myTeam];
              newTeam[idx] = null;
              saveMyTeam(newTeam);
            }}
          />
          {myTeam[activeMyPokemonIndex] && (
            <div className="mt-3">
              <BattlePokemonCard 
                pokemon={myTeam[activeMyPokemonIndex]!}
                basePokemonData={myTeam[activeMyPokemonIndex]!.base}
                ranks={getMyRanks(activeMyPokemonIndex)}
                onRankChange={(stat, val) => handleMyRankChange(activeMyPokemonIndex, stat, val)}
                onEdit={() => { setEditingTeam('my'); setEditingIndex(activeMyPokemonIndex); }}
                megaEvolutions={getMegaEvolutions(myTeam[activeMyPokemonIndex]?.base)}
                onMegaEvolution={(mega) => {
                  const newTeam = [...myTeam];
                  newTeam[activeMyPokemonIndex] = { ...newTeam[activeMyPokemonIndex]!, base: mega, ability: mega.abilities[0] || '' };
                  saveMyTeam(newTeam);
                }}
                onRevertMega={() => {
                  const newTeam = [...myTeam];
                  const baseName = newTeam[activeMyPokemonIndex]!.base.name.replace(/^メガ/, '').replace(/[XY]$/, '');
                  const base = pokemonData.find(p => p.name === baseName) || newTeam[activeMyPokemonIndex]!.base;
                  newTeam[activeMyPokemonIndex] = { ...newTeam[activeMyPokemonIndex]!, base, ability: base.abilities[0] || '' };
                  saveMyTeam(newTeam);
                }}
              />
            </div>
          )}
        </section>

      </main>

      {/* モーダル */}
      {editingTeam !== null && editingIndex !== null && (
        <PokemonDetailModal
          isOpponent={editingTeam === 'opp'}
          pokemon={editingTeam === 'my' ? myTeam[editingIndex]! : opponentTeam[editingIndex]!}
          onClose={() => { setEditingTeam(null); setEditingIndex(null); }}
          onSave={(updatedPokemon) => {
            if (editingTeam === 'my') {
              const newTeam = [...myTeam];
              newTeam[editingIndex] = updatedPokemon;
              saveMyTeam(newTeam);
            } else {
              const newTeam = [...opponentTeam];
              newTeam[editingIndex] = updatedPokemon;
              setOpponentTeam(newTeam);
            }
            setEditingTeam(null);
            setEditingIndex(null);
          }}
        />
      )}
    </div>
  );
};

export default App;
