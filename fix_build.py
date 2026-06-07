import os

# 1. Fix statsCalc.ts
calc_file = 'src/utils/statsCalc.ts'
with open(calc_file, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("let modifier = 4096; // using 4096 base for fractional math if needed, but simple float works too", "")

with open(calc_file, 'w', encoding='utf-8') as f:
    f.write(content)

# 2. Fix DamageCalculator.tsx
dc_file = 'src/components/DamageCalculator.tsx'
with open(dc_file, 'r', encoding='utf-8') as f:
    dc_content = f.read()

dc_content = dc_content.replace("myPoke.ivs.speed,", "31,")

with open(dc_file, 'w', encoding='utf-8') as f:
    f.write(dc_content)
