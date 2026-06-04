import os

dc_file = 'src/components/DamageCalculator.tsx'

with open(dc_file, 'r', encoding='utf-8') as f:
    dc_content = f.read()

# 1. Fix teamWithMoves filtering
old_filter = "const teamWithMoves = myTeam.filter((p, i) => p !== null && activePokemonIndices.includes(i) && p.moves && p.moves.some(m => m !== null)) as MyPokemon[];"
new_filter = "const teamWithMoves = myTeam.filter((p, i) => p !== null && activePokemonIndices.includes(i)) as MyPokemon[];"
dc_content = dc_content.replace(old_filter, new_filter)

# 2. Fix empty state condition (if length is 0, we show the message, but wait, the top of the component says "if (teamWithMoves.length === 0) return null")
old_empty_return = """  if (teamWithMoves.length === 0) {
    return null;
  }"""
new_empty_return = """  // if (teamWithMoves.length === 0) {
  //   return null;
  // }"""
dc_content = dc_content.replace(old_empty_return, new_empty_return)

# 3. Update "H0", "H特化", "H252 / B0 / D0" to beginner-friendly text
old_h0_btn = "ベース: H無振り"
new_h0_btn = "ベース: HP無振り"
dc_content = dc_content.replace(old_h0_btn, new_h0_btn)

old_h252_btn = "ベース: H特化"
new_h252_btn = "ベース: HP特化"
dc_content = dc_content.replace(old_h252_btn, new_h252_btn)

old_target_h252 = "H252 / B0 / D0"
new_target_h252 = "HP 252 / 防御 0 / 特防 0"
dc_content = dc_content.replace(old_target_h252, new_target_h252)

old_target_h0 = "H0 / B0 / D0"
new_target_h0 = "HP 0 / 防御 0 / 特防 0"
dc_content = dc_content.replace(old_target_h0, new_target_h0)

# 4. Add dotted border between moves
old_move_div = '<div key={j} className="flex flex-col gap-1.5 mt-2 first:mt-0">'
new_move_div = '<div key={j} className="flex flex-col gap-1.5 pt-3 mt-3 border-t border-dotted border-slate-300 first:border-0 first:pt-0 first:mt-0">'
dc_content = dc_content.replace(old_move_div, new_move_div)

# 5. Add max-height and scrolling to space-y-3
old_space_y_3 = '<div className="space-y-3">'
new_space_y_3 = '<div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">'
dc_content = dc_content.replace(old_space_y_3, new_space_y_3)

# Replace 'custom-scrollbar' with simple tailwind classes if we don't have custom-scrollbar in CSS, actually let's just use standard tailwind classes
dc_content = dc_content.replace('custom-scrollbar', '[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-100')

with open(dc_file, 'w', encoding='utf-8') as f:
    f.write(dc_content)

# Update App version
app_file = 'src/App.tsx'
with open(app_file, 'r', encoding='utf-8') as f:
    app_content = f.read()
app_content = app_content.replace('>v1.1.12</span>', '>v1.1.13</span>')
with open(app_file, 'w', encoding='utf-8') as f:
    f.write(app_content)
