import os

app_file = 'src/App.tsx'
ts_file = 'src/components/TeamSelector.tsx'
pd_file = 'src/components/PokemonDetailModal.tsx'

# 1. Update App.tsx version to v1.1.2 and pass gameVersion to TeamSelector
with open(app_file, 'r', encoding='utf-8') as f:
    app_content = f.read()

app_content = app_content.replace('>v1.1.1</span>', '>v1.1.2</span>')

# Pass gameVersion to TeamSelector
app_content = app_content.replace(
    'onRemovePokemon={(idx) => {',
    'gameVersion={gameVersion}\n            onRemovePokemon={(idx) => {'
)

with open(app_file, 'w', encoding='utf-8') as f:
    f.write(app_content)


# 2. Update TeamSelector.tsx to accept gameVersion and show badge
with open(ts_file, 'r', encoding='utf-8') as f:
    ts_content = f.read()

ts_content = ts_content.replace(
    'isOpponent?: boolean;',
    'isOpponent?: boolean;\n  gameVersion?: string;'
)

ts_content = ts_content.replace(
    'isOpponent = false\n}) => {',
    'isOpponent = false,\n  gameVersion\n}) => {'
)

# Add opacity-60 to button if not implemented
old_btn = """                  <button
                    key={p.id}
                    className="w-full text-left p-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex justify-between items-center\""""

new_btn = """                  <button
                    key={p.id}
                    className={`w-full text-left p-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex justify-between items-center transition-colors ${gameVersion === 'champions' && !p.availableIn?.includes('champions') ? 'opacity-60' : ''}`}"""

ts_content = ts_content.replace(old_btn, new_btn)

# Add 未実装 badge
old_badge = """                    <div className="flex gap-1">
                      {p.types.map(t => <TypeBadge key={t} type={t} />)}
                    </div>"""

new_badge = """                    <div className="flex gap-1">
                      {gameVersion === 'champions' && !p.availableIn?.includes('champions') && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded mr-1">未実装</span>
                      )}
                      {p.types.map(t => <TypeBadge key={t} type={t} />)}
                    </div>"""

ts_content = ts_content.replace(old_badge, new_badge)

with open(ts_file, 'w', encoding='utf-8') as f:
    f.write(ts_content)


# 3. Update PokemonDetailModal.tsx for item sort and move direction
with open(pd_file, 'r', encoding='utf-8') as f:
    pd_content = f.read()

pd_content = pd_content.replace(
    'export const ITEMS = ["なし", ...Object.keys(itemsDict)];',
    'export const ITEMS = ["なし", ...Object.keys(itemsDict).sort((a, b) => a.localeCompare(b, "ja"))];'
)

pd_content = pd_content.replace(
    "index < 2 ? 'top-full mt-1 flex-col' : 'bottom-full mb-1 flex-col-reverse'",
    "'bottom-[calc(100%+8px)] flex-col'"
)

with open(pd_file, 'w', encoding='utf-8') as f:
    f.write(pd_content)
