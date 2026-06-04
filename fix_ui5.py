import os

damage_file = 'src/components/DamageCalculator.tsx'
with open(damage_file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the incorrectly placed speed_comp
# It starts with "      {/* 素早さ比較 */}"
start_idx = content.find("      {/* 素早さ比較 */}")
if start_idx != -1:
    end_idx = content.find("      </div>", start_idx) + len("      </div>")
    bad_part = content[start_idx:end_idx]
    # Remove it
    content = content[:start_idx] + content[end_idx:]

# 2. Append to the end of the file correctly
speed_comp = """      {/* 素早さ比較 */}
      <div className="bg-slate-100 p-3 border-t border-b border-slate-200 flex flex-col gap-1.5 text-xs text-slate-700">
        <div className="font-bold mb-1">素早さ比較</div>
        {teamWithMoves.map((myPoke, i) => {
          let mySpeed = calculateStat(myPoke.base.stats.speed, 31, myPoke.evs.speed, 50, getNatureMultiplier(myPoke.nature, 'speed'), false);
          mySpeed = applyStatRank(mySpeed, myBattleRanks[activePokemonIndices[i]]?.speed || 0);
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

if "素早さ比較" not in content:
    content = content.replace("    </div>\n  );\n};", speed_comp + "\n    </div>\n  );\n};")

with open(damage_file, 'w', encoding='utf-8') as f:
    f.write(content)
