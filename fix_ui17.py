import os

pd_file = 'src/components/PokemonDetailModal.tsx'
app_file = 'src/App.tsx'

with open(pd_file, 'r', encoding='utf-8') as f:
    pd_content = f.read()

# 1. Update imports
if 'useEffect' not in pd_content[:200]:
    pd_content = pd_content.replace("import React, { useState } from 'react';", "import React, { useState, useEffect } from 'react';")

# 2. Add useEffects for scrolling
scroll_hooks = """  useEffect(() => {
    if (activeItemSearch && item !== "なし") {
      setTimeout(() => {
        const el = document.getElementById(`item-btn-${item}`);
        if (el) el.scrollIntoView({ block: 'center' });
      }, 0);
    }
  }, [activeItemSearch]);

  useEffect(() => {
    if (activeMoveIndex !== null && moves[activeMoveIndex]) {
      setTimeout(() => {
        const el = document.getElementById(`move-btn-${activeMoveIndex}-${moves[activeMoveIndex]}`);
        if (el) el.scrollIntoView({ block: 'center' });
      }, 0);
    }
  }, [activeMoveIndex]);

  const getFilteredMoves = (query: string) => {"""
pd_content = pd_content.replace('  const getFilteredMoves = (query: string) => {', scroll_hooks)

# 3. Update getFilteredMoves
old_filtered_moves = """  const getFilteredMoves = (query: string) => {
    let availableMoves = movesData;
    
    const myLearnset = learnsets[pokemon.base.name];
    if (myLearnset && myLearnset.length > 0) {
      availableMoves = movesData.filter(m => myLearnset.includes(m.name));
    }

    if (!showUnimplemented) {
      availableMoves = availableMoves.filter(m => !unimplementedMoves.includes(m.name));
    }

    if (!query) return [];
    
    const normalizedQuery = hiraToKata(query);
    return availableMoves
      .filter(m => hiraToKata(m.name).startsWith(normalizedQuery))
      .slice(0, 30);
  };"""

new_filtered_moves = """  const getFilteredMoves = (query: string, currentMove: string | null) => {
    let availableMoves = movesData;
    
    const myLearnset = learnsets[pokemon.base.name];
    if (myLearnset && myLearnset.length > 0) {
      availableMoves = movesData.filter(m => myLearnset.includes(m.name));
    }

    if (!showUnimplemented) {
      availableMoves = availableMoves.filter(m => !unimplementedMoves.includes(m.name));
    }

    if (!query || query === currentMove) return availableMoves;
    
    const normalizedQuery = hiraToKata(query);
    return availableMoves
      .filter(m => hiraToKata(m.name).startsWith(normalizedQuery))
      .slice(0, 30);
  };"""

pd_content = pd_content.replace(old_filtered_moves, new_filtered_moves)

# 4. Update item mapping
old_item_mapping = """              {activeItemSearch && (
                <div className="absolute bottom-full mb-1 left-0 z-[100] w-[150%] max-w-[240px] bg-slate-800 text-white rounded-xl shadow-2xl max-h-60 overflow-y-auto border border-slate-700">
                  {ITEMS.filter(i => hiraToKata(i).includes(hiraToKata(itemSearchQuery))).map(i => (
                    <button
                      key={i}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-700 border-b border-slate-700/50 last:border-0"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setItem(i);
                        setActiveItemSearch(false);
                      }}
                    >
                      {i}
                    </button>
                  ))}
                  {ITEMS.filter(i => hiraToKata(i).includes(hiraToKata(itemSearchQuery))).length === 0 && (
                    <div className="p-3 text-center text-xs text-slate-400">見つかりません</div>
                  )}
                </div>
              )}"""

new_item_mapping = """              {activeItemSearch && (
                <div className="absolute bottom-full mb-1 left-0 z-[100] w-[150%] max-w-[240px] bg-slate-800 text-white rounded-xl shadow-2xl max-h-60 overflow-y-auto border border-slate-700">
                  {(itemSearchQuery === item || !itemSearchQuery ? ITEMS : ITEMS.filter(i => hiraToKata(i).includes(hiraToKata(itemSearchQuery)))).map(i => (
                    <button
                      key={i}
                      id={`item-btn-${i}`}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-700 border-b border-slate-700/50 last:border-0 ${item === i ? 'bg-indigo-600 font-bold' : ''}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setItem(i);
                        setActiveItemSearch(false);
                      }}
                    >
                      {i}
                    </button>
                  ))}
                  {(itemSearchQuery === item || !itemSearchQuery ? ITEMS : ITEMS.filter(i => hiraToKata(i).includes(hiraToKata(itemSearchQuery)))).length === 0 && (
                    <div className="p-3 text-center text-xs text-slate-400">見つかりません</div>
                  )}
                </div>
              )}"""

pd_content = pd_content.replace(old_item_mapping, new_item_mapping)

# 5. Update move mapping
old_move_mapping = """                    {isActive && moveSearchQuery && (
                      <div className={`absolute z-[100] w-[200%] sm:w-[150%] max-w-[280px] ${index % 2 === 1 ? 'right-0' : 'left-0'} ${'bottom-[calc(100%+8px)] flex-col'} bg-white border border-slate-200 rounded-xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.3)] max-h-48 overflow-y-auto flex`}>
                        {getFilteredMoves(moveSearchQuery).length > 0 ? (
                          (index < 2 ? getFilteredMoves(moveSearchQuery) : [...getFilteredMoves(moveSearchQuery)].reverse()).map(m => (
                            <button
                              key={m.name}
                              className="w-full text-left p-2.5 hover:bg-slate-50 border-b border-slate-50 last:border-0 flex justify-between items-center text-sm transition-colors"
                              onMouseDown={(e) => { e.preventDefault(); }}
                              onClick={() => {
                                const newMoves = [...moves];
                                newMoves[index] = m.name;
                                setMoves(newMoves);
                                setActiveMoveIndex(null);
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-700">{m.name}</span>
                                <TypeBadge type={m.type} />
                              </div>
                              {unimplementedMoves.includes(m.name) && (
                                <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded ml-2">未実装</span>
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="p-3 text-xs text-slate-400 text-center">見つかりませんでした</div>
                        )}
                      </div>
                    )}"""

new_move_mapping = """                    {isActive && (
                      <div className={`absolute z-[100] w-[200%] sm:w-[150%] max-w-[280px] ${index % 2 === 1 ? 'right-0' : 'left-0'} ${'bottom-[calc(100%+8px)] flex-col'} bg-white border border-slate-200 rounded-xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.3)] max-h-48 overflow-y-auto flex`}>
                        {getFilteredMoves(moveSearchQuery, moves[index]).length > 0 ? (
                          (index < 2 ? getFilteredMoves(moveSearchQuery, moves[index]) : [...getFilteredMoves(moveSearchQuery, moves[index])].reverse()).map(m => (
                            <button
                              key={m.name}
                              id={`move-btn-${index}-${m.name}`}
                              className={`w-full text-left p-2.5 hover:bg-slate-50 border-b border-slate-50 last:border-0 flex justify-between items-center text-sm transition-colors ${moves[index] === m.name ? 'bg-indigo-50 font-bold text-indigo-700' : ''}`}
                              onMouseDown={(e) => { e.preventDefault(); }}
                              onClick={() => {
                                const newMoves = [...moves];
                                newMoves[index] = m.name;
                                setMoves(newMoves);
                                setActiveMoveIndex(null);
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-700">{m.name}</span>
                                <TypeBadge type={m.type} />
                              </div>
                              {unimplementedMoves.includes(m.name) && (
                                <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded ml-2">未実装</span>
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="p-3 text-xs text-slate-400 text-center">見つかりませんでした</div>
                        )}
                      </div>
                    )}"""

pd_content = pd_content.replace(old_move_mapping, new_move_mapping)


with open(pd_file, 'w', encoding='utf-8') as f:
    f.write(pd_content)

# Bump App.tsx version
with open(app_file, 'r', encoding='utf-8') as f:
    app_content = f.read()
app_content = app_content.replace('>v1.1.10</span>', '>v1.1.11</span>')
with open(app_file, 'w', encoding='utf-8') as f:
    f.write(app_content)
