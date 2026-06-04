import os

# 1. TeamSelector.tsx (Types and dropdown direction)
ts_file = 'src/components/TeamSelector.tsx'
with open(ts_file, 'r', encoding='utf-8') as f:
    ts_content = f.read()

# Make dropdown go up
ts_content = ts_content.replace(
    'className="mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto absolute z-50 w-[calc(100%-24px)] max-w-[400px]"',
    'className="bottom-[calc(100%-12px)] left-3 mb-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto absolute z-[100] w-[calc(100%-24px)] max-w-[400px]"'
)

# Add TypeBadge import if not there
if "TypeBadge" not in ts_content:
    ts_content = ts_content.replace(
        "import { MyPokemon, Pokemon } from './PokemonDetailModal';",
        "import { MyPokemon, Pokemon, TypeBadge } from './PokemonDetailModal';"
    )

# Add type badges to search list
old_item = """                  <div className="flex items-center gap-2">
                    <img 
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                      alt=""
                      className="w-8 h-8 object-contain"
                    />
                    <span className="font-bold text-slate-700">{p.name}</span>
                  </div>"""

new_item = """                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <img 
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                        alt=""
                        className="w-8 h-8 object-contain"
                      />
                      <span className="font-bold text-slate-700">{p.name}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {p.types.map(t => <TypeBadge key={t} type={t} />)}
                  </div>"""

ts_content = ts_content.replace(old_item, new_item)

with open(ts_file, 'w', encoding='utf-8') as f:
    f.write(ts_content)

# 2. App.tsx (Center layout)
app_file = 'src/App.tsx'
with open(app_file, 'r', encoding='utf-8') as f:
    app_content = f.read()

app_content = app_content.replace(
    '<main className="max-w-md mx-auto px-4 space-y-5">',
    '<main className="max-w-md mx-auto px-4 space-y-5 flex flex-col justify-center min-h-[calc(100vh-100px)] py-8">'
)

with open(app_file, 'w', encoding='utf-8') as f:
    f.write(app_content)
