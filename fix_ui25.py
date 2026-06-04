import os

pm_file = 'src/components/PokemonDetailModal.tsx'
with open(pm_file, 'r', encoding='utf-8') as f:
    pm_content = f.read()

old_lucide = "import { X, Shield, Zap, Target, Activity, Heart, Swords, Info, ChevronDown } from 'lucide-react';"
new_lucide = "import { X, Shield, Zap, Target, Activity, Heart, Swords, Info, ChevronDown, Settings } from 'lucide-react';"

pm_content = pm_content.replace(old_lucide, new_lucide)

with open(pm_file, 'w', encoding='utf-8') as f:
    f.write(pm_content)
