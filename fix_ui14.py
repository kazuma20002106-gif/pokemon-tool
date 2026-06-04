import os

pd_file = 'src/components/PokemonDetailModal.tsx'
app_file = 'src/App.tsx'

with open(pd_file, 'r', encoding='utf-8') as f:
    pd_content = f.read()

# 1. Update the nature dropdown items to be wider and colored
old_dropdown_ui = """                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.3)] z-[100] max-h-48 overflow-y-auto">
                        {NATURES.map(n => (
                          <div 
                            key={n}
                            onClick={() => {
                              setNature(n);
                              setActiveNatureSelect(false);
                            }}
                            className={`p-2.5 text-xs border-b border-slate-50 cursor-pointer hover:bg-slate-50 ${nature === n ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-700'}`}
                          >
                            {n}
                          </div>
                        ))}
                      </div>"""

new_dropdown_ui = """                      <div className="absolute top-full left-0 min-w-[140px] mt-1 bg-white border border-slate-200 rounded-xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.3)] z-[100] max-h-48 overflow-y-auto">
                        {NATURES.map(n => (
                          <div 
                            key={n}
                            onClick={() => {
                              setNature(n);
                              setActiveNatureSelect(false);
                            }}
                            className={`px-3 py-2 text-xs border-b border-slate-50 cursor-pointer hover:bg-slate-50 flex justify-between items-center gap-3 ${nature === n ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-700'}`}
                          >
                            <span>{n.split(' ')[0]}</span>
                            {n.includes('↑') && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-bold text-red-500">{n.match(/\\(([^ ]+)↑/)?.[1]}↑</span>
                                <span className="text-[9px] font-bold text-blue-500">{n.match(/ ([^ ]+)↓\\)/)?.[1]}↓</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>"""

pd_content = pd_content.replace(old_dropdown_ui, new_dropdown_ui)

with open(pd_file, 'w', encoding='utf-8') as f:
    f.write(pd_content)

# Bump App.tsx version
with open(app_file, 'r', encoding='utf-8') as f:
    app_content = f.read()
app_content = app_content.replace('>v1.1.7</span>', '>v1.1.8</span>')
with open(app_file, 'w', encoding='utf-8') as f:
    f.write(app_content)
