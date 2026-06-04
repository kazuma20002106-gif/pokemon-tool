import os

pd_file = 'src/components/PokemonDetailModal.tsx'
app_file = 'src/App.tsx'

with open(pd_file, 'r', encoding='utf-8') as f:
    pd_content = f.read()

# 1. Update the nature dropdown to combine the badge inside the button
old_nature_ui = """            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">性格</label>
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <button 
                    onClick={() => setActiveNatureSelect(!activeNatureSelect)}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 text-left flex justify-between items-center"
                  >
                    <span className="truncate">{nature.split(' ')[0]}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1" />
                  </button>
                  {activeNatureSelect && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setActiveNatureSelect(false)} />
                      <div className="absolute top-full left-0 min-w-[140px] mt-1 bg-white border border-slate-200 rounded-xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.3)] z-[100] max-h-48 overflow-y-auto">
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
                      </div>
                    </>
                  )}
                </div>
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

new_nature_ui = """            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">性格</label>
              <div className="relative">
                <button 
                  onClick={() => setActiveNatureSelect(!activeNatureSelect)}
                  className="w-full p-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 text-left flex justify-between items-center"
                >
                  <div className="flex items-center gap-2 whitespace-nowrap overflow-hidden">
                    <span className="font-bold text-slate-700">{nature.split(' ')[0]}</span>
                    {nature.includes('↑') ? (
                      <div className="flex gap-1.5">
                        <span className="text-[9px] font-bold text-red-500">{nature.match(/\\(([^ ]+)↑/)?.[1]}↑</span>
                        <span className="text-[9px] font-bold text-blue-500">{nature.match(/ ([^ ]+)↓\\)/)?.[1]}↓</span>
                      </div>
                    ) : (
                      <span className="text-[9px] font-bold text-slate-400">補正なし</span>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1" />
                </button>
                {activeNatureSelect && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setActiveNatureSelect(false)} />
                    <div className="absolute top-full left-0 min-w-full w-max mt-1 bg-white border border-slate-200 rounded-xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.3)] z-[100] max-h-48 overflow-y-auto">
                      {NATURES.map(n => (
                        <div 
                          key={n}
                          onClick={() => {
                            setNature(n);
                            setActiveNatureSelect(false);
                          }}
                          className={`px-3 py-2 text-xs border-b border-slate-50 cursor-pointer hover:bg-slate-50 flex justify-between items-center gap-4 whitespace-nowrap ${nature === n ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-700'}`}
                        >
                          <span>{n.split(' ')[0]}</span>
                          {n.includes('↑') ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold text-red-500">{n.match(/\\(([^ ]+)↑/)?.[1]}↑</span>
                              <span className="text-[9px] font-bold text-blue-500">{n.match(/ ([^ ]+)↓\\)/)?.[1]}↓</span>
                            </div>
                          ) : (
                            <span className="text-[9px] font-bold text-slate-400">補正なし</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>"""

pd_content = pd_content.replace(old_nature_ui, new_nature_ui)

with open(pd_file, 'w', encoding='utf-8') as f:
    f.write(pd_content)

# Bump App.tsx version
with open(app_file, 'r', encoding='utf-8') as f:
    app_content = f.read()
app_content = app_content.replace('>v1.1.8</span>', '>v1.1.9</span>')
with open(app_file, 'w', encoding='utf-8') as f:
    f.write(app_content)
