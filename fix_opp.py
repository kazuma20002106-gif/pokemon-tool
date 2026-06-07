import os

dc_file = 'src/components/DamageCalculator.tsx'
with open(dc_file, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("opponent.base.stats", "activeOpponent.base.stats")

with open(dc_file, 'w', encoding='utf-8') as f:
    f.write(content)
