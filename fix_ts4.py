import os

damage_file = 'src/components/DamageCalculator.tsx'
with open(damage_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if line.startswith("const RankGauge ="):
        skip = True
    if skip and "};" in line and len(line.strip()) == 2:
        skip = False
        continue
    if not skip:
        if "import { ChevronUp, ChevronDown, Minus, ShieldAlert, Swords } from 'lucide-react';" in line:
            new_lines.append("import { Info, ChevronUp, ChevronDown, Minus, ShieldAlert, Swords } from 'lucide-react';\n")
        elif "import { Info } from 'lucide-react';" in line:
            continue
        elif "Plus" in line and "import" in line:
            new_lines.append(line.replace("Plus, ", ""))
        else:
            new_lines.append(line)

with open(damage_file, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
