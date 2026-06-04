import os

# 1. DamageCalculator
damage_file = 'src/components/DamageCalculator.tsx'
with open(damage_file, 'r', encoding='utf-8') as f:
    content = f.read()

speed_comp = """      {/* 素早さ比較 */}
      <div className="bg-slate-100 p-3 border-t border-b border-slate-200 flex flex-col gap-1.5 text-xs text-slate-700">
        <div className="font-bold mb-1">素早さ比較</div>
        {teamWithMoves.map((myPoke, i) => {
          let mySpeed = calculateStat(myPoke.base.stats.speed, 31, myPoke.evs.speed, 50, getNatureMultiplier(myPoke.nature, 'speed'), false);
          mySpeed = applyStatRank(mySpeed, battleRanks[activePokemonIndices[i]]?.speed || 0);
          if (myPoke.item === "こだわりスカーフ") mySpeed = Math.floor(mySpeed * 1.5);
          
          let oppSpeed = applyStatRank(calculateStat(opponent.base.stats.speed, 31, 252, 50, 1.1, false), oppRanks.speed);
          if (opponent.item === "こだわりスカーフ") oppSpeed = Math.floor(oppSpeed * 1.5);

          const isFaster = mySpeed > oppSpeed;
          return (
            <div key={i} className="flex items-center justify-between bg-white px-2 py-1.5 rounded shadow-sm">
              <span className="font-bold truncate max-w-[45%]">{myPoke.base.name}</span>
              <span className="flex items-center gap-1">
                <span className={`font-black ${isFaster ? 'text-blue-600' : 'text-slate-400'}`}>{mySpeed}</span>
                <span className="text-slate-400 text-[10px]">vs</span>
                <span className={`font-black ${!isFaster ? 'text-red-500' : 'text-slate-400'}`}>{oppSpeed}</span>
              </span>
            </div>
          );
        })}
      </div>"""

# Remove the incorrectly placed one
content = content.replace(speed_comp + "\n    </div>\n  );\n};", "    </div>\n  );\n};", 1)

# Put it at the correct end
content = content.replace(
    "    </div>\n  );\n};\n",
    speed_comp + "\n    </div>\n  );\n};\n"
)

with open(damage_file, 'w', encoding='utf-8') as f:
    f.write(content)

# 2. BattlePokemonCard megaIds import unused error
card_file = 'src/components/BattlePokemonCard.tsx'
with open(card_file, 'r', encoding='utf-8') as f:
    content2 = f.read()

# I wrote `(megaIds as any)[basePokemonData.name]` but the typescript compilation fails because megaIds was never read?
# Ah, I replaced the src attribute but maybe it failed because basePokemonData.id was used twice or something?
# Let's check if the replacement actually happened.
content2 = content2.replace(
    "import { Settings2, Zap } from 'lucide-react';\\nimport megaIds from '../data/megaIds.json';",
    "import { Zap } from 'lucide-react';\\nimport megaIds from '../data/megaIds.json';"
)

with open(card_file, 'w', encoding='utf-8') as f:
    f.write(content2)

# 3. App.tsx InfoTooltip unused
app_file = 'src/App.tsx'
with open(app_file, 'r', encoding='utf-8') as f:
    content3 = f.read()

# Wait, I added InfoTooltip but maybe it was declared but never read because of case sensitivity or something?
# Oh, it said InfoTooltip is declared but its value is never read. Did my second replace fail?
# "フィールドの天候" might have been replaced correctly but maybe there are multiple instances?
content3 = content3.replace(
    '<h3 className="text-xs font-bold text-slate-500 mb-2 px-1">フィールドの天候</h3>',
    '<h3 className="text-xs font-bold text-slate-500 mb-2 px-1 flex items-center">フィールドの天候 <InfoTooltip text="天候による特定のタイプへの特防・防御1.5倍補正、技の威力補正がダメージ計算に自動反映されます。" /></h3>'
)

with open(app_file, 'w', encoding='utf-8') as f:
    f.write(content3)
