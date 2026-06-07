import os

app_file = 'src/App.tsx'
with open(app_file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add calcOpponentIndices state
old_opp_state = """  // Opponent Team State
  const [opponentTeam, setOpponentTeam] = useState<(MyPokemon | null)[]>(Array(6).fill(null));
  const [activeOpponentIndex, setActiveOpponentIndex] = useState<number>(0);
  const [opponentSearchQuery, setOpponentSearchQuery] = useState('');"""

new_opp_state = """  // Opponent Team State
  const [opponentTeam, setOpponentTeam] = useState<(MyPokemon | null)[]>(Array(6).fill(null));
  const [activeOpponentIndex, setActiveOpponentIndex] = useState<number>(0);
  const [calcOpponentIndices, setCalcOpponentIndices] = useState<number[]>([0,1,2,3,4,5]);
  const [opponentSearchQuery, setOpponentSearchQuery] = useState('');"""

content = content.replace(old_opp_state, new_opp_state)

# 2. Remove calcMyPokemonIndices UI and Update DamageCalculator props
old_dc_ui = """            <div className="text-[10px] font-bold text-slate-500 mb-2">計算に参加させる自陣メンバー</div>
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
            />"""

new_dc_ui = """            <DamageCalculator 
              myTeam={myTeam}
              activeMyIndices={calcMyPokemonIndices}
              setCalcMyPokemonIndices={setCalcMyPokemonIndices}
              myBattleRanks={myBattleRanks}
              activeMyFaceoffIndex={activeMyPokemonIndex}

              oppTeam={opponentTeam}
              activeOppIndices={calcOpponentIndices}
              setCalcOpponentIndices={setCalcOpponentIndices}
              oppBattleRanks={oppBattleRanks}
              activeOppFaceoffIndex={activeOpponentIndex}

              weather={weather}
            />"""

content = content.replace(old_dc_ui, new_dc_ui)

with open(app_file, 'w', encoding='utf-8') as f:
    f.write(content)
