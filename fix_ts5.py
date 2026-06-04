import os
damage_file = 'src/components/DamageCalculator.tsx'
with open(damage_file, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import { Info, ChevronUp, ChevronDown, Minus, ShieldAlert, Swords } from 'lucide-react';\n", "import { Info, ShieldAlert, Swords } from 'lucide-react';\n")
content = content.replace("import { ChevronUp, ChevronDown, Minus, ShieldAlert, Swords } from 'lucide-react';\n", "import { ShieldAlert, Swords } from 'lucide-react';\n")

with open(damage_file, 'w', encoding='utf-8') as f:
    f.write(content)
