import os

# 1. BattlePokemonCard: Mega Image
card_file = 'src/components/BattlePokemonCard.tsx'
with open(card_file, 'r', encoding='utf-8') as f:
    content = f.read()

if 'megaIds from' not in content:
    content = content.replace(
        "import { Settings2, Zap } from 'lucide-react';",
        "import { Settings2, Zap } from 'lucide-react';\nimport megaIds from '../data/megaIds.json';"
    )

content = content.replace(
    """        <img 
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${basePokemonData.id}.png`}
          alt={basePokemonData.name}""",
    """        <img 
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${(megaIds as any)[basePokemonData.name] || basePokemonData.id}.png`}
          alt={basePokemonData.name}"""
)

with open(card_file, 'w', encoding='utf-8') as f:
    f.write(content)

# 2. DamageCalculator: borders and speed
damage_file = 'src/components/DamageCalculator.tsx'
with open(damage_file, 'r', encoding='utf-8') as f:
    content2 = f.read()

# Add border between moves
content2 = content2.replace(
    """                    <div key={j} className="flex flex-col gap-1.5 mt-2 first:mt-0">""",
    """                    <div key={j} className="flex flex-col gap-1.5 pt-2 mt-2 first:mt-0 first:pt-0 border-t border-slate-100 first:border-0">"""
)

# Speed comparison at the bottom of damage calculator
# In the original, the speed comparison was:
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

if "素早さ比較" not in content2:
    # insert before final closing div
    content2 = content2.replace(
        "    </div>\n  );\n};",
        speed_comp + "\n    </div>\n  );\n};"
    )

with open(damage_file, 'w', encoding='utf-8') as f:
    f.write(content2)

# 3. App.tsx: weather tooltip and version
app_file = 'src/App.tsx'
with open(app_file, 'r', encoding='utf-8') as f:
    content3 = f.read()

# Version
content3 = content3.replace(
    """<h1 className="text-xl font-black italic tracking-wider">BATTLE HUB</h1>""",
    """<div className="flex items-baseline gap-2">
            <h1 className="text-xl font-black italic tracking-wider">BATTLE HUB</h1>
            <span className="text-[10px] font-bold opacity-80 bg-black/20 px-1.5 py-0.5 rounded">v1.1.0</span>
          </div>"""
)

# Weather tooltip
if 'InfoTooltip' not in content3:
    content3 = content3.replace(
        "import { Gamepad2, Sun, CloudRain, Wind, Snowflake, Info, Swords } from 'lucide-react';",
        "import { Gamepad2, Sun, CloudRain, Wind, Snowflake, Info, Swords } from 'lucide-react';\n\nconst InfoTooltip = ({ text }: { text: string }) => {\n  const [isOpen, setIsOpen] = React.useState(false);\n  return (\n    <div className=\"relative inline-flex items-center ml-1 align-middle\">\n      <button type=\"button\" onClick={() => setIsOpen(!isOpen)} onBlur={() => setTimeout(() => setIsOpen(false), 200)} className=\"text-slate-400 hover:text-slate-600 p-1 -m-1\">\n        <Info className=\"w-3.5 h-3.5\" />\n      </button>\n      {isOpen && (\n        <div className=\"absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl z-20 text-left pointer-events-none\">\n          {text}\n          <div className=\"absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800\"></div>\n        </div>\n      )}\n    </div>\n  );\n};"
    )

content3 = content3.replace(
    """<h3 className="text-xs font-bold text-slate-500 mb-2 px-1">フィールドの天候</h3>""",
    """<h3 className="text-xs font-bold text-slate-500 mb-2 px-1 flex items-center">フィールドの天候 <InfoTooltip text="天候による特定のタイプへの特防・防御1.5倍補正、技の威力補正がダメージ計算に自動反映されます。" /></h3>"""
)

with open(app_file, 'w', encoding='utf-8') as f:
    f.write(content3)
