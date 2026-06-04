import os

bc_file = 'src/components/BattlePokemonCard.tsx'

with open(bc_file, 'r', encoding='utf-8') as f:
    bc_content = f.read()

# 1. Update the layout around the name and settings button
old_layout = """            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm text-slate-800">{basePokemonData.name}</h3>
              <button onClick={onEdit} className="text-[10px] font-bold text-white bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-600 hover:to-fuchsia-600 px-2.5 py-1 rounded-md shadow-sm transition-all flex items-center shadow-indigo-200">
                <Settings2 className="w-3 h-3 mr-1" />
                設定を変更
              </button>
            </div>"""

new_layout = """            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-black text-sm text-slate-800">{basePokemonData.name}</h3>
              <button onClick={onEdit} className="text-[10px] font-bold text-slate-600 bg-white border-2 border-slate-200 hover:border-indigo-400 hover:text-indigo-600 px-2 py-0.5 rounded-md shadow-sm transition-all flex items-center">
                <Settings2 className="w-3 h-3 mr-1" />
                設定
              </button>
              {megaEvolutions && megaEvolutions.length > 0 && onMegaEvolution && (
                <>
                  {!isMega ? megaEvolutions.map(mega => (
                    <button
                      key={mega.id}
                      onClick={() => onMegaEvolution(mega)}
                      className="px-2 py-0.5 bg-slate-800 text-white text-[9px] font-bold rounded shadow-sm hover:bg-slate-700 flex items-center"
                    >
                      <Zap className="w-3 h-3 mr-0.5 text-yellow-400" />
                      メガシンカに切替
                    </button>
                  )) : onRevertMega && (
                    <button
                      onClick={onRevertMega}
                      className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[9px] font-bold rounded shadow-sm hover:bg-slate-300 flex items-center"
                    >
                      元の姿に戻す
                    </button>
                  )}
                </>
              )}
            </div>"""

bc_content = bc_content.replace(old_layout, new_layout)

# 2. Remove the old Mega Evolution button at the bottom
old_mega_bottom = """      {megaEvolutions.length > 0 && onMegaEvolution && (
        <div className="flex gap-2 mt-2">
          {!isMega ? megaEvolutions.map(mega => (
            <button
              key={mega.id}
              onClick={() => onMegaEvolution(mega)}
              className="px-2 py-1 bg-gradient-to-r from-slate-700 to-slate-900 text-white text-[9px] font-bold rounded shadow-sm hover:from-slate-600 hover:to-slate-800 flex items-center"
            >
              <Zap className="w-3 h-3 mr-1 text-yellow-400" />
              {mega.name} に切り替え
            </button>
          )) : onRevertMega && (
            <button
              onClick={onRevertMega}
              className="px-2 py-1 bg-slate-200 text-slate-700 text-[9px] font-bold rounded shadow-sm hover:bg-slate-300 flex items-center"
            >
              元の姿に戻す
            </button>
          )}
        </div>
      )}"""

bc_content = bc_content.replace(old_mega_bottom, "")

with open(bc_file, 'w', encoding='utf-8') as f:
    f.write(bc_content)

# 3. App.tsx version bump
app_file = 'src/App.tsx'
with open(app_file, 'r', encoding='utf-8') as f:
    app_content = f.read()

app_content = app_content.replace('>v1.1.5</span>', '>v1.1.6</span>')

with open(app_file, 'w', encoding='utf-8') as f:
    f.write(app_content)
