import os

import shutil

shutil.copy("temp_old_damage.tsx", "src/components/DamageCalculator.tsx")

# Read the file to apply minor fixes to temp_old_damage.tsx so it works with the new 6v6 structure
with open("src/components/DamageCalculator.tsx", 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the interface
content = content.replace(
"""interface Props {
  myTeam: (MyPokemon | null)[];
  activePokemonIndices: number[];
  battleRanks: Record<number, BattleStatRanks>;
  onRankChange: (index: number, stat: keyof BattleStatRanks, value: number) => void;
  opponent: Pokemon;
  weather: string;
  oppActiveAbility: string;
  oppActiveItem?: string;
}""",
"""interface Props {
  myTeam: (MyPokemon | null)[];
  activePokemonIndices: number[];
  myBattleRanks: Record<number, BattleStatRanks>;
  opponent: MyPokemon;
  oppRanks: BattleStatRanks;
  weather: string;
}"""
)

# Replace the component signature
content = content.replace(
"""export const DamageCalculator: React.FC<Props> = ({ myTeam, activePokemonIndices, battleRanks, onRankChange, opponent, weather, oppActiveAbility, oppActiveItem }) => {""",
"""export const DamageCalculator: React.FC<Props> = ({ myTeam, activePokemonIndices, myBattleRanks, opponent, oppRanks, weather }) => {
  const oppActiveAbility = opponent.ability;
  const oppActiveItem = opponent.item || "なし";
  const battleRanks = myBattleRanks;
  const onRankChange = (i: number, s: any, v: number) => {}; // No-op since RankGauge is not meant to change myBattleRanks directly anymore, wait, RankGauge is still in the component! We should probably remove it or keep a local state. Actually, let's keep RankGauge and pass a dummy onRankChange for now, or use myBattleRanks.
"""
)

# Wait, `onRankChange` is used in DamageCalculator's RankGauge!
# Let's remove RankGauge entirely from DamageCalculator because BattlePokemonCard handles it.
content = content.replace(
"""              <div className="bg-slate-50 rounded-lg p-2 mb-3 border border-slate-100">
                <div className="text-[10px] text-slate-500 font-bold mb-1.5">対面ランク補正</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                  <RankGauge 
                    label="攻撃" 
                    value={battleRanks[i]?.attack || 0} 
                    onChange={(v) => onRankChange(i, 'attack', v)} 
                  />
                  <RankGauge 
                    label="特攻" 
                    value={battleRanks[i]?.spAttack || 0} 
                    onChange={(v) => onRankChange(i, 'spAttack', v)} 
                  />
                  <RankGauge 
                    label="素早" 
                    value={battleRanks[i]?.speed || 0} 
                    onChange={(v) => onRankChange(i, 'speed', v)} 
                  />
                </div>
              </div>""",
""
)

# Fix opponent.stats.hp to opponent.base.stats.hp
content = content.replace("opponent.stats", "opponent.base.stats")
content = content.replace("opponent.types", "opponent.base.types")

with open("src/components/DamageCalculator.tsx", 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed DamageCalculator TS errors")
