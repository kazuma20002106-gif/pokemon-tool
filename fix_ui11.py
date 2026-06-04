import os

app_file = 'src/App.tsx'
pd_file = 'src/components/PokemonDetailModal.tsx'
bc_file = 'src/components/BattlePokemonCard.tsx'

# 1. Update App.tsx version to v1.1.5 and add weather description
with open(app_file, 'r', encoding='utf-8') as f:
    app_content = f.read()

app_content = app_content.replace('>v1.1.4</span>', '>v1.1.5</span>')

weather_desc_ui = """          <div className="px-3 pb-3 flex overflow-x-auto gap-2 scrollbar-hide">"""

weather_desc_new = """          <div className="px-3 pb-2 flex overflow-x-auto gap-2 scrollbar-hide">"""

app_content = app_content.replace(weather_desc_ui, weather_desc_new)

weather_btn_close = """              </button>
            ))}
          </div>"""

weather_btn_close_new = """              </button>
            ))}
          </div>
          {weather !== 'none' && (
            <div className="px-3 pb-2 text-[10px] text-slate-500 font-bold border-t border-slate-100 pt-2 bg-slate-50 rounded-b-xl">
              {weather === 'sun' && '炎タイプの技の威力が1.5倍、水タイプの技の威力が0.5倍になります。'}
              {weather === 'rain' && '水タイプの技の威力が1.5倍、炎タイプの技の威力が0.5倍になります。'}
              {weather === 'sandstorm' && '岩タイプのポケモンの特防が1.5倍になります。'}
              {weather === 'snow' && '氷タイプのポケモンの防御が1.5倍になります。'}
            </div>
          )}"""

app_content = app_content.replace(weather_btn_close, weather_btn_close_new)

with open(app_file, 'w', encoding='utf-8') as f:
    f.write(app_content)


# 2. Update PokemonDetailModal.tsx
with open(pd_file, 'r', encoding='utf-8') as f:
    pd_content = f.read()

pd_content = pd_content.replace(
    "{NATURES.map(n => <option key={n} value={n}>{n.split(' ')[0]}</option>)}",
    "{NATURES.map(n => <option key={n} value={n}>{n}</option>)}"
)

with open(pd_file, 'w', encoding='utf-8') as f:
    f.write(pd_content)


# 3. Update BattlePokemonCard.tsx
with open(bc_file, 'r', encoding='utf-8') as f:
    bc_content = f.read()

bc_content = bc_content.replace("import { Zap } from 'lucide-react';", "import { Zap, Settings2 } from 'lucide-react';")

old_btn = """              <button onClick={onEdit} className="text-[9px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded shadow-sm border border-slate-200">
                ステータス・技を変更
              </button>"""

new_btn = """              <button onClick={onEdit} className="text-[10px] font-bold text-white bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-600 hover:to-fuchsia-600 px-2.5 py-1 rounded-md shadow-sm transition-all flex items-center shadow-indigo-200">
                <Settings2 className="w-3 h-3 mr-1" />
                設定を変更
              </button>"""

bc_content = bc_content.replace(old_btn, new_btn)

# Replace stats
bc_content = bc_content.replace('label="H"', 'label="HP"')
bc_content = bc_content.replace('label="A"', 'label="攻撃"')
bc_content = bc_content.replace('label="B"', 'label="防御"')
bc_content = bc_content.replace('label="C"', 'label="特攻"')
bc_content = bc_content.replace('label="D"', 'label="特防"')
bc_content = bc_content.replace('label="S"', 'label="素早"')

with open(bc_file, 'w', encoding='utf-8') as f:
    f.write(bc_content)

