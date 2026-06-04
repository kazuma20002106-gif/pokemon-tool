import os

pd_file = 'src/components/PokemonDetailModal.tsx'
app_file = 'src/App.tsx'

with open(pd_file, 'r', encoding='utf-8') as f:
    pd_content = f.read()

# 1. Add activeNatureSelect state
if 'const [activeNatureSelect, setActiveNatureSelect] = useState(false);' not in pd_content:
    pd_content = pd_content.replace(
        'const [itemSearchQuery, setItemSearchQuery] = useState(\'\');',
        'const [itemSearchQuery, setItemSearchQuery] = useState(\'\');\n  const [activeNatureSelect, setActiveNatureSelect] = useState(false);'
    )

# 2. Update item search filtering with hiraToKata
old_item_filter = "ITEMS.filter(i => i.includes(itemSearchQuery))"
new_item_filter = "ITEMS.filter(i => hiraToKata(i).includes(hiraToKata(itemSearchQuery)))"
pd_content = pd_content.replace(old_item_filter, new_item_filter)

# 3. Update nature UI to custom dropdown
old_nature_ui = """            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">性格</label>
              <div className="flex items-center gap-1.5">
                <select 
                  value={nature} 
                  onChange={e => setNature(e.target.value)}
                  className="flex-1 w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400"
                >
                  {NATURES.map(n => <option key={n} value={n}>{n}</option>)}
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

new_nature_ui = """            <div>
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
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.3)] z-[100] max-h-48 overflow-y-auto">
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

pd_content = pd_content.replace(old_nature_ui, new_nature_ui)

# Add ChevronDown import if missing
if 'ChevronDown' not in pd_content[:300]:
    pd_content = pd_content.replace('import { Heart', 'import { ChevronDown, Heart')

# 4. Update item search input with select() and X button
old_item_input = """              <input
                value={activeItemSearch ? itemSearchQuery : item}
                onChange={e => {
                  setItemSearchQuery(e.target.value);
                  if (!activeItemSearch) setActiveItemSearch(true);
                }}
                onFocus={() => {
                  setActiveItemSearch(true);
                  setItemSearchQuery(item === "なし" ? "" : item);
                }}
                onBlur={() => {
                  setTimeout(() => {
                    setActiveItemSearch(false);
                    setItemSearchQuery(item);
                  }, 200);
                }}
                className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 placeholder:text-slate-400"
                placeholder="検索..."
              />"""

new_item_input = """              <div className="relative">
                <input
                  value={activeItemSearch ? itemSearchQuery : item}
                  onChange={e => {
                    setItemSearchQuery(e.target.value);
                    if (!activeItemSearch) setActiveItemSearch(true);
                  }}
                  onFocus={(e) => {
                    setActiveItemSearch(true);
                    setItemSearchQuery(item === "なし" ? "" : item);
                    e.target.select();
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setActiveItemSearch(false);
                      setItemSearchQuery(item);
                    }, 200);
                  }}
                  className="w-full p-2 pr-7 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 placeholder:text-slate-400"
                  placeholder="検索..."
                />
                {activeItemSearch && itemSearchQuery && (
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setItemSearchQuery('');
                      setItem("なし");
                    }}
                    className="absolute right-2 top-2 p-0.5 text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full z-10"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>"""

pd_content = pd_content.replace(old_item_input, new_item_input)

# 5. Update move search input to use select() and X button behavior update
old_move_input = """                        onFocus={() => {
                          setActiveMoveIndex(index);
                          setMoveSearchQuery(moves[index] || '');
                        }}"""
new_move_input = """                        onFocus={(e) => {
                          setActiveMoveIndex(index);
                          setMoveSearchQuery(moves[index] || '');
                          e.target.select();
                        }}"""
pd_content = pd_content.replace(old_move_input, new_move_input)

old_move_x = """                          onClick={() => {
                            const newMoves = [...moves];
                            newMoves[index] = null;
                            setMoves(newMoves);
                            if (isActive) setMoveSearchQuery('');
                          }}"""
new_move_x = """                          onMouseDown={(e) => {
                            e.preventDefault();
                            const newMoves = [...moves];
                            newMoves[index] = null;
                            setMoves(newMoves);
                            setMoveSearchQuery('');
                          }}"""
pd_content = pd_content.replace(old_move_x, new_move_x)

with open(pd_file, 'w', encoding='utf-8') as f:
    f.write(pd_content)

# Bump App.tsx version
with open(app_file, 'r', encoding='utf-8') as f:
    app_content = f.read()
app_content = app_content.replace('>v1.1.6</span>', '>v1.1.7</span>')
with open(app_file, 'w', encoding='utf-8') as f:
    f.write(app_content)
