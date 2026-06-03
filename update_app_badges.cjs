const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

// 1. My Team search dropdown badge
const myTeamDropdownPattern = `
                        <div className="flex gap-1">
                          {p.types.map(t => <TypeBadge key={t} type={t} />)}
                        </div>
                      </button>
                    ))
`;
const myTeamDropdownReplacement = `
                        <div className="flex gap-1">
                          {gameVersion === 'champions' && !p.availableIn?.includes('champions') && (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded mr-1">未実装</span>
                          )}
                          {p.types.map(t => <TypeBadge key={t} type={t} />)}
                        </div>
                      </button>
                    ))
`;
app = app.replace(myTeamDropdownPattern.trim(), myTeamDropdownReplacement.trim());

// 2. Opponent search dropdown badge
const oppDropdownPattern = `
                      <button
                        key={p.id}
                        className="w-full text-left p-3 hover:bg-slate-50 border-b border-slate-100 flex justify-between items-center"
`;
const oppDropdownReplacement = `
                      <button
                        key={p.id}
                        className={\`w-full text-left p-3 hover:bg-slate-50 border-b border-slate-100 flex justify-between items-center \${gameVersion === 'champions' && !p.availableIn?.includes('champions') ? 'opacity-60' : ''}\`}
`;
app = app.replace(oppDropdownPattern.trim(), oppDropdownReplacement.trim());

// Opponent dropdown badge part 2 (the type badge area)
const oppDropdownTypePattern = `
                        <div className="flex gap-1">
                          {p.types.map(t => <TypeBadge key={t} type={t} />)}
                        </div>
                      </button>
                    ))
                  ) : (
`;
const oppDropdownTypeReplacement = `
                        <div className="flex gap-1">
                          {gameVersion === 'champions' && !p.availableIn?.includes('champions') && (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded mr-1">未実装</span>
                          )}
                          {p.types.map(t => <TypeBadge key={t} type={t} />)}
                        </div>
                      </button>
                    ))
                  ) : (
`;
app = app.replace(oppDropdownTypePattern.trim(), oppDropdownTypeReplacement.trim());

// Also need to fix the first one (MyTeam) opacity
const myTeamDropdownOpacityPattern = `
                  <button
                    key={p.id}
                    className="w-full text-left p-3 hover:bg-slate-50 active:bg-slate-100 border-b border-slate-100 last:border-0 flex justify-between items-center transition-colors"
`;
const myTeamDropdownOpacityReplacement = `
                  <button
                    key={p.id}
                    className={\`w-full text-left p-3 hover:bg-slate-50 active:bg-slate-100 border-b border-slate-100 last:border-0 flex justify-between items-center transition-colors \${gameVersion === 'champions' && !p.availableIn?.includes('champions') ? 'opacity-60' : ''}\`}
`;
app = app.replace(myTeamDropdownOpacityPattern.trim(), myTeamDropdownOpacityReplacement.trim());


// 3. Make My Team card's "Edit" button extremely obvious
const cardPattern = `
                    <div className="text-sm font-bold text-slate-800 truncate">{p.base.name}</div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">{p.ability} / {p.nature.split(' ')[0]}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-500 bg-indigo-100 px-1.5 py-0.5 rounded">実速: {calculateActualSpeed(p)}</span>
                      <Settings2 className="w-4 h-4 text-indigo-300" />
                    </div>
`;
const cardReplacement = `
                    <div className="text-sm font-bold text-slate-800 truncate">{p.base.name}</div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">{p.ability} / {p.nature.split(' ')[0]}</div>
                    <div className="mt-2 pt-2 border-t border-indigo-100/50 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-500 bg-indigo-100 px-1.5 py-0.5 rounded">実速: {calculateActualSpeed(p)}</span>
                      </div>
                      <div className="text-[10px] font-bold text-white bg-indigo-500 hover:bg-indigo-600 rounded p-1.5 flex items-center justify-center transition-colors shadow-sm w-full">
                        <Settings2 className="w-3 h-3 mr-1" />
                        技・ステータス設定
                      </div>
                    </div>
`;
app = app.replace(cardPattern.trim(), cardReplacement.trim());

fs.writeFileSync('src/App.tsx', app);
console.log("Updated App.tsx!");
