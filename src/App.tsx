import React, { useState, useEffect } from 'react';
import svData from './data/sv.json';
import championsData from './data/champions.json';
import { Search, ChevronUp, ChevronDown, Minus, User, Swords, Trash2, Plus, Gamepad2, Settings2, Sun, CloudRain, Wind, Snowflake, Info, Zap } from 'lucide-react';
import { PokemonDetailModal, Pokemon, MyPokemon, NATURES } from './components/PokemonDetailModal';
import { getWeaknesses } from './utils/typeChart';
import { applyStatRank } from './utils/statsCalc';
import { DamageCalculator } from './components/DamageCalculator';
import abilitiesData from './data/abilities.json';
import itemsData from './data/items.json';

const abilitiesDict = abilitiesData as Record<string, string>;
const itemsDict = itemsData as Record<string, string>;
const ITEMS = ["なし", ...Object.keys(itemsDict)];

export type BattleStatRanks = { attack: number, defense: number, spAttack: number, spDefense: number, speed: number };

type GameVersion = 'champions' | 'sv';

const ClickTooltip = ({ text, className = "w-48" }: { text: React.ReactNode, className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative inline-flex items-center ml-1 align-middle">
      <button 
        type="button"
        onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="text-slate-400 hover:text-slate-600 transition-colors p-1 -m-1"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {isOpen && (
        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 ${className} p-3 bg-slate-800 text-white text-[11px] rounded shadow-xl z-[60] text-left font-normal leading-relaxed pointer-events-none`}>
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
        </div>
      )}
    </div>
  );
};

const TypeBadge = ({ type }: { type: string }) => {
  const colors: Record<string, string> = {
    'ノーマル': 'bg-stone-400', 'ほのお': 'bg-red-500', 'みず': 'bg-blue-500', 'くさ': 'bg-green-500',
    'でんき': 'bg-yellow-400', 'こおり': 'bg-cyan-300', 'かくとう': 'bg-orange-600', 'どく': 'bg-purple-500',
    'じめん': 'bg-amber-600', 'ひこう': 'bg-sky-400', 'エスパー': 'bg-pink-500', 'むし': 'bg-lime-500',
    'いわ': 'bg-yellow-600', 'ゴースト': 'bg-violet-600', 'ドラゴン': 'bg-indigo-600', 'あく': 'bg-zinc-700',
    'はがね': 'bg-slate-400', 'フェアリー': 'bg-pink-300'
  };
  return (
    <span className={`text-[10px] font-bold text-white px-1.5 py-0.5 rounded shadow-sm ${colors[type] || 'bg-slate-400'}`}>
      {type}
    </span>
  );
};

const StatBar = ({ label, value, max = 255 }: { label: string, value: number, max?: number }) => (
  <div className="flex items-center text-[10px] font-bold">
    <span className="w-8 text-slate-500">{label}</span>
    <span className="w-6 text-right mr-2 text-slate-700">{value}</span>
    <div className="flex-grow h-2 bg-slate-200 rounded-full overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-pokemon-red to-orange-400 rounded-full"
        style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
      />
    </div>
  </div>
);

const App: React.FC = () => {
  const [gameVersion, setGameVersion] = useState<GameVersion>('champions');
  const [myTeam, setMyTeam] = useState<(MyPokemon | null)[]>(Array(6).fill(null));
  const [opponentSearchQuery, setOpponentSearchQuery] = useState('');
  const [showOpponentDropdown, setShowOpponentDropdown] = useState(false);
  const [myTeamSearchQuery, setMyTeamSearchQuery] = useState('');
  const [showMyTeamDropdown, setShowMyTeamDropdown] = useState(false);
  const [opponent, setOpponent] = useState<Pokemon | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [weather, setWeather] = useState<string>('none');
  const [oppActiveAbility, setOppActiveAbility] = useState<string>('');
  const [oppActiveItem, setOppActiveItem] = useState<string>('なし');
  
  // バトル選出状態
  const [activePokemonIndices, setActivePokemonIndices] = useState<number[]>([0,1,2,3,4,5]);
  // バトル中のランク補正 (キーはパーティのインデックス)
  const [battleRanks, setBattleRanks] = useState<Record<number, BattleStatRanks>>({});

  const getBattleRanks = (index: number) => battleRanks[index] || { attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 };

  const handleBattleRankChange = (index: number, stat: keyof BattleStatRanks, value: number) => {
    setBattleRanks(prev => ({
      ...prev,
      [index]: {
        ...getBattleRanks(index),
        [stat]: Math.max(-6, Math.min(6, value))
      }
    }));
  };

  useEffect(() => {
    if (opponent && opponent.abilities.length > 0) {
      setOppActiveAbility(opponent.abilities[0]);
    } else {
      setOppActiveAbility('');
    }
  }, [opponent]);

  const pokemonData = (gameVersion === 'champions' ? championsData : svData) as Pokemon[];

  useEffect(() => {
    const savedVersion = localStorage.getItem('selectedGameVersion') as GameVersion;
    if (savedVersion) setGameVersion(savedVersion);
    
    const savedTeam = localStorage.getItem(`myPokemonTeamV2_${savedVersion || 'champions'}`);
    if (savedTeam) {
      try {
        setMyTeam(JSON.parse(savedTeam));
      } catch (e) {
        console.error("Failed to parse team", e);
      }
    }
  }, []);

  const handleVersionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVersion = e.target.value as GameVersion;
    setGameVersion(newVersion);
    localStorage.setItem('selectedGameVersion', newVersion);
    
    const savedTeam = localStorage.getItem(`myPokemonTeamV2_${newVersion}`);
    if (savedTeam) {
      try { setMyTeam(JSON.parse(savedTeam)); } catch (e) { setMyTeam(Array(6).fill(null)); }
    } else {
      setMyTeam(Array(6).fill(null));
    }
    setOpponent(null);
    setOpponentSearchQuery('');
    setMyTeamSearchQuery('');
  };

  const saveTeam = (team: (MyPokemon | null)[]) => {
    setMyTeam(team);
    localStorage.setItem(`myPokemonTeamV2_${gameVersion}`, JSON.stringify(team));
  };

  const hiraToKata = (str: string) => {
    return str.replace(/[\u3041-\u3096]/g, match => 
      String.fromCharCode(match.charCodeAt(0) + 0x60)
    );
  };

  const getFilteredPokemon = (query: string) => {
    if (!query) return [];
    const normalizedQuery = hiraToKata(query);
    // ユーザーの要望により、前方一致（startsWith）のみを抽出する（中間に含まれるポケモンが出ないようにする）
    return pokemonData.filter(p => p.name.startsWith(normalizedQuery)).slice(0, 8);
  };

  const opponentFiltered = getFilteredPokemon(opponentSearchQuery);
  const myTeamFiltered = getFilteredPokemon(myTeamSearchQuery);

  const handleAddMyPokemon = (base: Pokemon) => {
    const emptyIndex = myTeam.findIndex(p => p === null);
    if (emptyIndex !== -1) {
      const newPokemon: MyPokemon = {
        base,
        evs: { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 },
        nature: NATURES[0],
        ability: base.abilities[0],
        moves: [null, null, null, null]
      };
      const newTeam = [...myTeam];
      newTeam[emptyIndex] = newPokemon;
      saveTeam(newTeam);
      setEditingIndex(emptyIndex); // 追加後すぐに詳細設定を開く
    }
  };

  const calculateActualSpeed = (myPoke: MyPokemon, rank: number = 0) => {
    // 実際の素早さ計算 (レベル50想定)
    // 実数値 = ((種族値×2 + 個体値 + 努力値/4) × 50 / 100 + 5) × 性格補正
    const base = myPoke.base.stats.speed;
    const iv = 31; // 個体値は31固定
    const ev = myPoke.evs.speed;
    let stat = Math.floor((base * 2 + iv + Math.floor(ev / 4)) * 50 / 100 + 5);
    
    // 性格補正
    if (myPoke.nature.includes('速↑')) stat = Math.floor(stat * 1.1);
    if (myPoke.nature.includes('速↓')) stat = Math.floor(stat * 0.9);
    
    // ランク補正
    stat = applyStatRank(stat, rank);

    // アイテム補正
    if (myPoke.item === 'こだわりスカーフ') {
      stat = Math.floor(stat * 1.5);
    }

    // 特性・天候補正
    if ((myPoke.ability === 'すいすい' && weather === 'rain') ||
        (myPoke.ability === 'ようりょくそ' && weather === 'sun') ||
        (myPoke.ability === 'すなかき' && weather === 'sandstorm') ||
        (myPoke.ability === 'ゆきかき' && weather === 'snow')) {
      stat = Math.floor(stat * 2);
    }
    
    return stat;
  };

  const opponentWeaknesses = opponent ? getWeaknesses(opponent.types) : { quadWeak: [], weak: [], resist: [], quadResist: [], immune: [] };

  const renderMatchupRow = (label: string, types: string[], bgColorClass: string, labelColorClass: string) => {
    if (types.length === 0) return null;
    return (
      <div className={`flex items-center gap-2 p-1.5 rounded-lg ${bgColorClass}`}>
        <span className={`text-[10px] font-bold w-12 flex-shrink-0 text-center ${labelColorClass}`}>{label}</span>
        <div className="flex flex-wrap gap-1">
          {types.map(t => <TypeBadge key={t} type={t} />)}
        </div>
      </div>
    );
  };

  const isMega = opponent?.name.startsWith('メガ');
  const baseName = isMega ? opponent!.name.replace(/^メガ/, '').replace(/[XY]$/, '') : opponent?.name;
  const basePokemon = isMega ? pokemonData.find(p => p.name === baseName) : opponent;
  const megaEvolutions = basePokemon ? pokemonData.filter(p => p.name.startsWith(`メガ${basePokemon.name}`)) : [];

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
                  <div 
                    onClick={() => setEditingIndex(i)}
                    className="border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-white hover:border-indigo-300 rounded-xl p-3 flex flex-col justify-between h-full relative shadow-sm cursor-pointer"
                  >
                    <button 
                      onClick={(e) => { e.stopPropagation(); const newTeam = [...myTeam]; newTeam[i] = null; saveTeam(newTeam); }}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md transition-colors z-10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <div className="flex items-center gap-2 mb-1">
                      <img 
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.base.id}.png`}
                        alt=""
                        className="w-8 h-8 object-contain drop-shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-800 truncate leading-tight">{p.base.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{p.ability} / {p.nature.split(' ')[0]}</div>
                      </div>
                    </div>
                    <div className="mt-1 pt-1.5 border-t border-indigo-100/50 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-500 bg-indigo-100 px-1.5 py-0.5 rounded">実速: {calculateActualSpeed(p, 0)}</span>
                      </div>
                      <div className="text-[10px] font-bold text-white bg-indigo-500 hover:bg-indigo-600 rounded p-1.5 flex items-center justify-center transition-colors shadow-sm w-full">
                        <Settings2 className="w-3 h-3 mr-1" />
                        技・ステータス設定
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 hover:border-indigo-300 active:bg-indigo-50/50 bg-slate-50 rounded-xl p-3 h-[78px] flex flex-col items-center justify-center cursor-pointer transition-colors" onClick={() => {
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

        {/* 相手検索 & 比較エリア */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="bg-slate-100 p-3 border-b border-slate-200 flex items-center rounded-t-2xl">
            <Swords className="w-5 h-5 mr-2 text-slate-600" />
            <h2 className="font-bold text-slate-700">対戦相手 (分析と素早さ比較)</h2>
          </div>

          {/* 選出フィルター */}
          {opponent && myTeam.some(p => p !== null) && (
            <div className="bg-slate-50 border-b border-slate-200 p-3">
              <div className="text-[10px] font-bold text-slate-500 mb-2">選出メンバー (タップで表示切替)</div>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {myTeam.map((p, i) => {
                  if (!p) return null;
                  const isActive = activePokemonIndices.includes(i);
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        if (isActive) {
                          setActivePokemonIndices(prev => prev.filter(idx => idx !== i));
                        } else {
                          setActivePokemonIndices(prev => [...prev, i]);
                        }
                      }}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        isActive 
                          ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm' 
                          : 'bg-white text-slate-400 border-slate-200 opacity-60'
                      }`}
                    >
                      <img 
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.base.id}.png`}
                        alt=""
                        className="w-5 h-5 -ml-1 object-contain"
                      />
                      <span className="truncate max-w-[60px]">{p.base.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* 天候トグル */}
          <div className="bg-white border-b border-slate-200">
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
            <div className="px-3 pb-3 flex overflow-x-auto gap-2 scrollbar-hide">
              {[
                { id: 'none', label: '天候なし', icon: <Minus className="w-3.5 h-3.5" /> },
                { id: 'sun', label: '晴れ', icon: <Sun className="w-3.5 h-3.5" /> },
                { id: 'rain', label: '雨', icon: <CloudRain className="w-3.5 h-3.5" /> },
                { id: 'sandstorm', label: '砂嵐', icon: <Wind className="w-3.5 h-3.5" /> },
                { id: 'snow', label: '雪', icon: <Snowflake className="w-3.5 h-3.5" /> },
              ].map(w => (
                <button
                  key={w.id}
                  onClick={() => setWeather(w.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                    weather === w.id
                      ? 'bg-amber-500 text-white shadow-md border border-amber-600'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {w.icon}
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4">
            <div className="relative">
              <div className="flex items-center border-2 border-slate-200 rounded-xl bg-slate-50 overflow-hidden focus-within:ring-4 focus-within:ring-pokemon-red/20 focus-within:border-pokemon-red transition-all">
                <Search className="w-5 h-5 ml-3 text-slate-400" />
                <input
                  type="text"
                  className="w-full p-3 bg-transparent outline-none text-slate-800 font-medium placeholder:font-normal placeholder:text-slate-400"
                  placeholder="相手のポケモン名を入力..."
                  value={opponentSearchQuery}
                  onChange={(e) => {
                    setOpponentSearchQuery(e.target.value);
                    setShowOpponentDropdown(true);
                  }}
                  onFocus={() => setShowOpponentDropdown(true)}
                />
                {opponentSearchQuery && (
                  <button 
                    onClick={() => { setOpponentSearchQuery(''); setOpponent(null); }}
                    className="mr-3 text-slate-400 p-1"
                  >
                    ×
                  </button>
                )}
              </div>

              {showOpponentDropdown && opponentSearchQuery && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                  {opponentFiltered.length > 0 ? (
                    opponentFiltered.map((p) => (
                      <button
                        key={p.id}
                        className={`w-full text-left p-3 hover:bg-slate-50 border-b border-slate-100 flex justify-between items-center ${gameVersion === 'champions' && !p.availableIn?.includes('champions') ? 'opacity-60' : ''}`}
                        onClick={() => {
                          setOpponent(p);
                          setOpponentSearchQuery(p.name);
                          setShowOpponentDropdown(false);
                          (document.activeElement as HTMLElement)?.blur();
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <img 
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                            alt=""
                            className="w-8 h-8 object-contain"
                          />
                          <span className="font-bold text-slate-700">{p.name}</span>
                        </div>
                        <div className="flex gap-1">
                          {gameVersion === 'champions' && !p.availableIn?.includes('champions') && (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded mr-1">未実装</span>
                          )}
                          {p.types.map(t => <TypeBadge key={t} type={t} />)}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-slate-400 text-sm text-center">見つかりませんでした</div>
                  )}
                </div>
              )}
            </div>

            {opponent && (
              <div className="mt-6 animate-[fadeIn_0.3s_ease-out]">
                {/* 相手の詳細ステータス */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <img 
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${opponent.id}.png`}
                      alt={opponent.name}
                      className="w-16 h-16 drop-shadow-md bg-white rounded-full border border-slate-200"
                    />
                    <div>
                      <h3 className="font-black text-lg text-slate-800">{opponent.name}</h3>
                      <div className="flex gap-1 mt-1 mb-2">
                        {opponent.types.map(t => <TypeBadge key={t} type={t} />)}
                      </div>
                      {/* メガシンカ切り替えボタン */}
                      {megaEvolutions.length > 0 && (
                        <div className="flex gap-2">
                          {!isMega ? megaEvolutions.map(mega => (
                            <button
                              key={mega.id}
                              onClick={() => { setOpponent(mega); setOppActiveAbility(mega.abilities[0] || ''); }}
                              className="px-2 py-1 bg-gradient-to-r from-slate-700 to-slate-900 text-white text-[10px] font-bold rounded shadow-sm hover:from-slate-600 hover:to-slate-800 flex items-center"
                            >
                              <Zap className="w-3 h-3 mr-1 text-yellow-400" />
                              {mega.name.replace('メガ' + basePokemon?.name, 'メガ')}
                            </button>
                          )) : basePokemon && (
                            <button
                              onClick={() => { setOpponent(basePokemon); setOppActiveAbility(basePokemon.abilities[0] || ''); }}
                              className="px-2 py-1 bg-slate-200 text-slate-600 text-[10px] font-bold rounded shadow-sm hover:bg-slate-300 flex items-center"
                            >
                              元の姿に戻す
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* 相手の特性 (複数ある場合は選択) */}
                  {opponent.abilities.length > 0 && (
                    <div className="mb-4">
                      <div className="text-[10px] font-bold text-slate-500 mb-2">想定特性 (タップで変更)</div>
                      <div className="flex flex-wrap gap-2">
                        {opponent.abilities.map(ability => (
                          <button
                            key={ability}
                            onClick={() => setOppActiveAbility(ability)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                              oppActiveAbility === ability 
                                ? 'bg-indigo-600 text-white shadow-md border border-indigo-700' 
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {ability}
                          </button>
                        ))}
                      </div>
                      
                      {/* 特性の説明 */}
                      {oppActiveAbility && abilitiesDict[oppActiveAbility] && (
                        <div className="mt-2 text-xs text-slate-600 bg-slate-100 p-2 rounded-lg border border-slate-200 shadow-sm">
                          <span className="font-bold text-indigo-600">効果:</span> {abilitiesDict[oppActiveAbility]}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 相手の道具 */}
                  <div className="mb-4">
                    <label className="block text-[10px] font-bold text-slate-500 mb-2">想定もちもの</label>
                    <select 
                      value={oppActiveItem} 
                      onChange={e => setOppActiveItem(e.target.value)}
                      className="w-full p-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-amber-400 font-bold text-slate-700 shadow-sm"
                    >
                      {ITEMS.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                    {oppActiveItem !== "なし" && itemsDict[oppActiveItem] && (
                      <div className="mt-2 text-xs text-slate-600 bg-amber-50 p-2 rounded-lg border border-amber-100 shadow-sm">
                        <span className="font-bold text-amber-700">効果:</span> {itemsDict[oppActiveItem]}
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-4">
                    <StatBar label="HP" value={opponent.stats.hp} />
                    <StatBar label="攻撃" value={opponent.stats.attack} />
                    <StatBar label="防御" value={opponent.stats.defense} />
                    <StatBar label="特攻" value={opponent.stats.spAttack} />
                    <StatBar label="特防" value={opponent.stats.spDefense} />
                    <StatBar label="素早" value={opponent.stats.speed} />
                  </div>

                  {/* 相性表示 (詳細) */}
                  <div className="border-t border-slate-200 pt-3 space-y-1.5">
                    <div className="text-[10px] font-bold text-slate-500 mb-2">タイプ相性</div>
                    {renderMatchupRow("4倍", opponentWeaknesses.quadWeak, "bg-red-50", "text-red-600")}
                    {renderMatchupRow("2倍", opponentWeaknesses.weak, "bg-orange-50", "text-orange-600")}
                    {renderMatchupRow("0.5倍", opponentWeaknesses.resist, "bg-blue-50", "text-blue-600")}
                    {renderMatchupRow("0.25倍", opponentWeaknesses.quadResist, "bg-indigo-50", "text-indigo-600")}
                    {renderMatchupRow("無効", opponentWeaknesses.immune, "bg-slate-100", "text-slate-500")}
                  </div>
                </div>
                
                {/* 爆速素早さ比較 */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 ml-1">自陣との素早さ比較 (相手の無振〜最速想定)</h4>
                  {myTeam.map((myPoke, i) => {
                    if (!myPoke || !activePokemonIndices.includes(i)) return null;
                    
                    const myRanks = getBattleRanks(i);
                    const mySpeed = calculateActualSpeed(myPoke, myRanks.speed);
                    // 相手の素早さ(無振り) = (種族値×2 + 31) × 50 / 100 + 5
                    let oppMinSpeed = Math.floor((opponent.stats.speed * 2 + 31) * 50 / 100 + 5);
                    // 相手の素早さ(最速) = ((種族値×2 + 31 + 252/4) × 50 / 100 + 5) × 1.1
                    let oppMaxSpeed = Math.floor((Math.floor((opponent.stats.speed * 2 + 31 + 63) * 50 / 100) + 5) * 1.1);
                    
                    // アイテム補正
                    if (oppActiveItem === 'こだわりスカーフ') {
                      oppMinSpeed = Math.floor(oppMinSpeed * 1.5);
                      oppMaxSpeed = Math.floor(oppMaxSpeed * 1.5);
                    }

                    // 天候と相手特性による素早さ補正
                    if ((oppActiveAbility === 'すいすい' && weather === 'rain') ||
                        (oppActiveAbility === 'ようりょくそ' && weather === 'sun') ||
                        (oppActiveAbility === 'すなかき' && weather === 'sandstorm') ||
                        (oppActiveAbility === 'ゆきかき' && weather === 'snow')) {
                      oppMinSpeed = Math.floor(oppMinSpeed * 2);
                      oppMaxSpeed = Math.floor(oppMaxSpeed * 2);
                    }
                    
                    const isFasterThanMax = mySpeed > oppMaxSpeed;
                    const isSlowerThanMin = mySpeed < oppMinSpeed;
                    
                    let bgClass = "bg-slate-50 border-slate-200";
                    let icon = <Minus className="w-5 h-5 text-slate-400" />;
                    let statusText = "乱数/振り方次第";
                    let textColor = "text-slate-500";
                    
                    if (isFasterThanMax) {
                      bgClass = "bg-gradient-to-r from-blue-50 to-blue-100/50 border-blue-200";
                      icon = <ChevronUp className="w-6 h-6 text-blue-600 drop-shadow-sm" />;
                      statusText = "絶対抜ける";
                      textColor = "text-blue-700";
                    } else if (isSlowerThanMin) {
                      bgClass = "bg-gradient-to-r from-red-50 to-red-100/50 border-red-200";
                      icon = <ChevronDown className="w-6 h-6 text-red-500 drop-shadow-sm" />;
                      statusText = "絶対抜かれる";
                      textColor = "text-red-600";
                    }

                    return (
                      <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${bgClass} shadow-sm transition-all`}>
                        <div className="flex items-center gap-3">
                          <div className="font-bold text-slate-800 w-28 truncate">{myPoke.base.name}</div>
                          <div className="text-[10px] font-bold text-slate-500 bg-white/50 px-1.5 py-0.5 rounded">実速: {mySpeed}</div>
                        </div>
                        <div className={`flex items-center font-black ${textColor}`}>
                          <span className="text-xs mr-1 tracking-wide">{statusText}</span>
                          {icon}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* ダメージ計算エリア */}
                <DamageCalculator 
                  myTeam={myTeam} 
                  activePokemonIndices={activePokemonIndices}
                  battleRanks={battleRanks}
                  onRankChange={handleBattleRankChange}
                  opponent={opponent} 
                  weather={weather} 
                  oppActiveAbility={oppActiveAbility} 
                  oppActiveItem={oppActiveItem}
                />
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 自陣登録用ボトムバー */}
      <div className="fixed bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-200 p-3 shadow-[0_-8px_20px_-5px_rgba(0,0,0,0.05)] z-30">
        <div className="max-w-md mx-auto relative">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[11px] font-bold text-indigo-600 flex items-center">
              <Plus className="w-3 h-3 mr-1" /> パーティに追加
            </p>
          </div>
          
          {/* ボトムバーのサジェストドロップダウン (上方向に展開) */}
          {showMyTeamDropdown && myTeamSearchQuery && myTeamFiltered.length > 0 && (
            <div className="absolute bottom-full mb-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
              {myTeamFiltered.map((p) => (
                <button
                  key={p.id}
                  className={`w-full text-left p-3 hover:bg-slate-50 active:bg-slate-100 border-b border-slate-100 last:border-0 flex justify-between items-center transition-colors ${gameVersion === 'champions' && !p.availableIn?.includes('champions') ? 'opacity-60' : ''}`}
                  onClick={() => {
                    handleAddMyPokemon(p);
                    setMyTeamSearchQuery('');
                    setShowMyTeamDropdown(false);
                    (document.activeElement as HTMLElement)?.blur();
                  }}
                >
                  <div className="flex items-center gap-2">
                    <img 
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                      alt=""
                      className="w-8 h-8 object-contain"
                    />
                    <span className="font-bold text-slate-700">{p.name}</span>
                  </div>
                  <div className="flex gap-1">
                    {gameVersion === 'champions' && !p.availableIn?.includes('champions') && (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded mr-1">未実装</span>
                    )}
                    {p.types.map(t => <TypeBadge key={t} type={t} />)}
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="relative">
            <input
              id="team-add-input"
              type="text"
              className="w-full p-2.5 pl-9 pr-12 border-2 border-indigo-100 rounded-xl bg-indigo-50/50 text-sm font-medium text-slate-700 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all placeholder:text-indigo-300"
              placeholder={`${gameVersion === 'champions' ? 'チャンピオンズ' : 'SV'}のポケモン名...`}
              value={myTeamSearchQuery}
              onChange={(e) => {
                setMyTeamSearchQuery(e.target.value);
                setShowMyTeamDropdown(true);
              }}
              onFocus={() => setShowMyTeamDropdown(true)}
            />
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-indigo-400" />
            {myTeamSearchQuery && (
              <button 
                onClick={() => { setMyTeamSearchQuery(''); }}
                className="absolute right-3 top-3 text-slate-400 p-1 bg-slate-200 rounded-full w-5 h-5 flex items-center justify-center text-xs"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* モーダル */}
      {editingIndex !== null && myTeam[editingIndex] && (
        <PokemonDetailModal 
          pokemon={myTeam[editingIndex]!}
          onSave={(updated) => {
            const newTeam = [...myTeam];
            newTeam[editingIndex] = updated;
            saveTeam(newTeam);
            setEditingIndex(null);
          }}
          onClose={() => setEditingIndex(null)}
        />
      )}
    </div>
  );
};

export default App;
