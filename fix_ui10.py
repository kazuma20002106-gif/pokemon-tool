import os

app_file = 'src/App.tsx'
ts_file = 'src/components/TeamSelector.tsx'
pd_file = 'src/components/PokemonDetailModal.tsx'

# 1. Update App.tsx version to v1.1.4 and change settings button
with open(app_file, 'r', encoding='utf-8') as f:
    app_content = f.read()

app_content = app_content.replace('>v1.1.3</span>', '>v1.1.4</span>')

old_settings_btn = """                      <div className="text-[10px] font-bold text-white bg-indigo-500 hover:bg-indigo-600 rounded p-1.5 flex items-center justify-center transition-colors shadow-sm w-full">
                        <Settings2 className="w-3 h-3 mr-1" />
                        技・ステータス設定
                      </div>"""

new_settings_btn = """                      <div className="text-[11px] font-bold text-white bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-600 hover:to-fuchsia-600 rounded-lg p-2 flex items-center justify-center transition-all shadow-md w-full border border-indigo-400">
                        <Settings2 className="w-3.5 h-3.5 mr-1" />
                        技・ステータス設定
                      </div>"""

app_content = app_content.replace(old_settings_btn, new_settings_btn)

with open(app_file, 'w', encoding='utf-8') as f:
    f.write(app_content)


# 2. Update TeamSelector.tsx focus issue
with open(ts_file, 'r', encoding='utf-8') as f:
    ts_content = f.read()

# Add useRef and useEffect
if 'const inputRef =' not in ts_content:
    ts_content = ts_content.replace(
        'const [addingIndex, setAddingIndex] = React.useState<number | null>(null);',
        'const [addingIndex, setAddingIndex] = React.useState<number | null>(null);\n  const inputRef = React.useRef<HTMLInputElement>(null);\n  React.useEffect(() => {\n    if (addingIndex !== null) inputRef.current?.focus();\n  }, [addingIndex]);'
    )

    ts_content = ts_content.replace(
        '              autoFocus\n              type="text"',
        '              ref={inputRef}\n              type="text"'
    )

with open(ts_file, 'w', encoding='utf-8') as f:
    f.write(ts_content)


# 3. Update PokemonDetailModal.tsx nature UI and regex
with open(pd_file, 'r', encoding='utf-8') as f:
    pd_content = f.read()

old_nature_ui = """            <div>
              <label className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                <span>性格</span>
                {nature.includes('↑') ? (
                  <span className="text-[10px] font-normal scale-90 origin-right whitespace-nowrap">
                    <span className="text-red-500">{nature.match(/\((.+)↑/)?.[1]}↑</span>
                    <span className="text-blue-500 ml-1">{nature.match(/ (.+)↓\)/)?.[1]}↓</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-normal scale-90 origin-right text-slate-400">補正なし</span>
                )}
              </label>
              <select 
                value={nature} 
                onChange={e => setNature(e.target.value)}
                className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400"
              >
                {NATURES.map(n => <option key={n} value={n}>{n.split(' ')[0]}</option>)}
              </select>
            </div>"""

new_nature_ui = """            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">性格</label>
              <div className="flex items-center gap-1.5">
                <select 
                  value={nature} 
                  onChange={e => setNature(e.target.value)}
                  className="flex-1 w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400"
                >
                  {NATURES.map(n => <option key={n} value={n}>{n.split(' ')[0]}</option>)}
                </select>
                {nature.includes('↑') ? (
                  <div className="flex flex-col items-center justify-center bg-white border border-slate-200 rounded px-1.5 py-0.5 min-w-[36px]">
                    <span className="text-[9px] font-bold text-red-500 leading-tight">{nature.match(/\(([^ ]+)↑/)?.[1]}↑</span>
                    <span className="text-[9px] font-bold text-blue-500 leading-tight">{nature.match(/ ([^ ]+)↓\)/)?.[1]}↓</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center bg-slate-50 border border-slate-200 rounded px-1.5 py-1 min-w-[36px] h-[34px]">
                    <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">なし</span>
                  </div>
                )}
              </div>
            </div>"""

pd_content = pd_content.replace(old_nature_ui, new_nature_ui)

with open(pd_file, 'w', encoding='utf-8') as f:
    f.write(pd_content)
