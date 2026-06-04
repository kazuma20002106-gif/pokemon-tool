import os

pd_file = 'src/components/PokemonDetailModal.tsx'
app_file = 'src/App.tsx'

with open(pd_file, 'r', encoding='utf-8') as f:
    pd_content = f.read()

# 1. Update grid cols from 3 to 2
pd_content = pd_content.replace(
    '<div className="grid grid-cols-3 gap-3">',
    '<div className="grid grid-cols-2 gap-3">'
)

# 2. Make item search span 2 columns
old_item_div = """            <div className="relative">
              <label className="block text-xs font-bold text-slate-500 mb-1">もちもの</label>"""
new_item_div = """            <div className="relative col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">もちもの</label>"""
pd_content = pd_content.replace(old_item_div, new_item_div)

# Also make sure the dropdown text is not truncated
old_nature_btn = """                  <div className="flex items-center gap-2 whitespace-nowrap overflow-hidden">
                    <span className="font-bold text-slate-700">{nature.split(' ')[0]}</span>"""
new_nature_btn = """                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <span className="font-bold text-slate-700">{nature.split(' ')[0]}</span>"""
pd_content = pd_content.replace(old_nature_btn, new_nature_btn)


with open(pd_file, 'w', encoding='utf-8') as f:
    f.write(pd_content)

# Bump App.tsx version
with open(app_file, 'r', encoding='utf-8') as f:
    app_content = f.read()
app_content = app_content.replace('>v1.1.9</span>', '>v1.1.10</span>')
with open(app_file, 'w', encoding='utf-8') as f:
    f.write(app_content)
