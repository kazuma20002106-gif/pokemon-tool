import os

damage_file = 'src/components/DamageCalculator.tsx'
with open(damage_file, 'r', encoding='utf-8') as f:
    content = f.read()

import re
content = re.sub(r'const RankGauge = \(\{.*?\}\);', '', content, flags=re.DOTALL)
content = content.replace("import { ChevronUp, ChevronDown, Minus, Plus, ShieldAlert, Swords } from 'lucide-react';", "import { ChevronUp, ChevronDown, Minus, ShieldAlert, Swords } from 'lucide-react';")
content = content.replace("import { Info } from 'lucide-react';\n", "import { Info } from 'lucide-react';\n")

with open(damage_file, 'w', encoding='utf-8') as f:
    f.write(content)
