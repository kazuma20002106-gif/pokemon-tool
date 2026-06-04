import os

# 1. Fix App.tsx
app_file = 'src/App.tsx'
with open(app_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix PokemonDetailModal props
content = content.replace(
"""          pokemon={editingTeam === 'my' ? myTeam[editingIndex]!.base : opponentTeam[editingIndex]!.base}
          initialData={editingTeam === 'my' ? myTeam[editingIndex] : opponentTeam[editingIndex]}""",
"""          pokemon={editingTeam === 'my' ? myTeam[editingIndex]! : opponentTeam[editingIndex]!}"""
)

# Remove unused imports and variables
content = content.replace("import { applyStatRank } from './utils/statsCalc';\n", "")
content = content.replace("  const [assumeOpponentScarf, setAssumeOpponentScarf] = useState(false);\n", "")

with open(app_file, 'w', encoding='utf-8') as f:
    f.write(content)


# 2. Fix BattlePokemonCard.tsx
card_file = 'src/components/BattlePokemonCard.tsx'
with open(card_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix stats access
content = content.replace("pokemon.stats", "basePokemonData.stats")

# Remove unused imports
content = content.replace("import { TypeBadge } from './TypeBadge';\n", "")
content = content.replace("const abilitiesDict = abilitiesData as Record<string, string>;\n", "")
content = content.replace("const itemsDict = itemsData as Record<string, string>;\n", "")

# Add TypeBadge internally since we removed the import
type_badge_str = """
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
"""
content = content.replace("export const BattlePokemonCard", type_badge_str + "\nexport const BattlePokemonCard")

with open(card_file, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed TS errors")
