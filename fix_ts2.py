import os

# 1. Fix App.tsx
app_file = 'src/App.tsx'
with open(app_file, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("          gameVersion={gameVersion}\n", "")
with open(app_file, 'w', encoding='utf-8') as f:
    f.write(content)


# 2. Fix BattlePokemonCard.tsx
card_file = 'src/components/BattlePokemonCard.tsx'
with open(card_file, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import abilitiesData from '../data/abilities.json';\n", "")
content = content.replace("import itemsData from '../data/items.json';\n", "")

with open(card_file, 'w', encoding='utf-8') as f:
    f.write(content)


# 3. Fix DamageCalculator.tsx
damage_file = 'src/components/DamageCalculator.tsx'
with open(damage_file, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import { Pokemon, MyPokemon } from './PokemonDetailModal';", "import { MyPokemon } from './PokemonDetailModal';")

# RankGauge definition spans multiple lines, we can just remove it using regex
import re
content = re.sub(r'const RankGauge = \(\{.*?\}\);', '', content, flags=re.DOTALL)
content = content.replace("const onRankChange = (i: number, s: any, v: number) => {}; // No-op since RankGauge is not meant to change myBattleRanks directly anymore, wait, RankGauge is still in the component! We should probably remove it or keep a local state. Actually, let's keep RankGauge and pass a dummy onRankChange for now, or use myBattleRanks.\n", "")

# Apply oppRanks to oppDef and oppSpDef
content = content.replace(
"""  // HP: 252 EV, Def/SpD: 0 EV, Nature: 1.0
  const oppMaxHp = calculateStat(opponent.base.stats.hp, 31, 252, 50, 1.0, true);
  let oppDef = calculateStat(opponent.base.stats.defense, 31, 0, 50, 1.0, false);
  let oppSpDef = calculateStat(opponent.base.stats.spDefense, 31, 0, 50, 1.0, false);""",
"""  // HP: 252 EV, Def/SpD: 0 EV, Nature: 1.0
  const oppMaxHp = calculateStat(opponent.base.stats.hp, 31, 252, 50, 1.0, true);
  let oppDef = applyStatRank(calculateStat(opponent.base.stats.defense, 31, 0, 50, 1.0, false), oppRanks.defense);
  let oppSpDef = applyStatRank(calculateStat(opponent.base.stats.spDefense, 31, 0, 50, 1.0, false), oppRanks.spDefense);"""
)

with open(damage_file, 'w', encoding='utf-8') as f:
    f.write(content)
