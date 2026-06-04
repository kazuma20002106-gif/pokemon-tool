import os

# 1. Update TeamSelector.tsx slice limit
ts_file = 'src/components/TeamSelector.tsx'
with open(ts_file, 'r', encoding='utf-8') as f:
    ts_content = f.read()

ts_content = ts_content.replace('.slice(0, 8)', '.slice(0, 50)')

with open(ts_file, 'w', encoding='utf-8') as f:
    f.write(ts_content)


# 2. Update PokemonDetailModal.tsx slice limits and add isOpponent prop
pm_file = 'src/components/PokemonDetailModal.tsx'
with open(pm_file, 'r', encoding='utf-8') as f:
    pm_content = f.read()

pm_content = pm_content.replace('.slice(0, 30)', '.slice(0, 50)')

# Add Settings icon
old_lucide = "import { X, Search, ChevronDown, Check, Shield, Swords, Heart, Target, Zap, Activity } from 'lucide-react';"
new_lucide = "import { X, Search, ChevronDown, Check, Shield, Swords, Heart, Target, Zap, Activity, Settings } from 'lucide-react';"
pm_content = pm_content.replace(old_lucide, new_lucide)

# Add isOpponent to Props
old_props = """interface Props {
  pokemon: MyPokemon;
  onSave: (updated: MyPokemon) => void;
  onClose: () => void;
}"""
new_props = """interface Props {
  pokemon: MyPokemon;
  onSave: (updated: MyPokemon) => void;
  onClose: () => void;
  isOpponent?: boolean;
}"""
pm_content = pm_content.replace(old_props, new_props)

# Update Component definition
old_comp = "export const PokemonDetailModal: React.FC<Props> = ({ pokemon, onSave, onClose }) => {"
new_comp = "export const PokemonDetailModal: React.FC<Props> = ({ pokemon, onSave, onClose, isOpponent = false }) => {"
pm_content = pm_content.replace(old_comp, new_comp)

# Add showAdvancedSettings state
old_state = "const [moveSearchQuery, setMoveSearchQuery] = useState('');"
new_state = "const [moveSearchQuery, setMoveSearchQuery] = useState('');\n  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);"
pm_content = pm_content.replace(old_state, new_state)

# Wrap EV section
old_ev_section = """          <div>
            <div className="flex items-end justify-between mb-2">
              <label className="block text-sm font-bold text-slate-700">努力値 (EVs)</label>
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${remainingEVs === 0 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                残り: {remainingEVs}
              </span>
            </div>
            
            <div className="space-y-3">
              {statLabels.map(({ key, label, icon }) => (
                <div key={key} className="flex items-center gap-2">
                  <button 
                    onClick={() => handleSmartEvClick(key as keyof Stats)}
                    className={`flex-shrink-0 w-16 py-1.5 rounded-lg border-2 text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                      evs[key as keyof Stats] > 0 
                        ? evs[key as keyof Stats] >= 252 ? 'bg-indigo-500 border-indigo-500 text-white shadow-md' : 'bg-indigo-100 border-indigo-200 text-indigo-700'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'
                    }`}
                  >
                    {icon} {label}
                  </button>
                  <div className="flex-1 px-4">
                    <input
                      type="range"
                      min="0"
                      max="252"
                      step="4"
                      value={evs[key as keyof Stats]}
                      onChange={(e) => handleEvChange(key as keyof Stats, Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="252"
                      step="4"
                      value={evs[key as keyof Stats]}
                      onChange={(e) => handleEvChange(key as keyof Stats, Number(e.target.value))}
                      className="w-16 p-1.5 text-center text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400 bg-slate-50 font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>"""

new_ev_section = """          {isOpponent && !showAdvancedSettings ? (
            <div className="pt-4 border-t border-slate-100 flex justify-center pb-2">
              <button 
                onClick={() => setShowAdvancedSettings(true)}
                className="text-xs text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5 font-bold bg-slate-50 px-4 py-2 rounded-full border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50"
              >
                <Settings className="w-3.5 h-3.5" />
                シミュレーション詳細設定（努力値を指定）
              </button>
            </div>
          ) : (
          <div>
            <div className="flex items-end justify-between mb-2">
              <label className="block text-sm font-bold text-slate-700">努力値 (EVs)</label>
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${remainingEVs === 0 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                残り: {remainingEVs}
              </span>
            </div>
            
            <div className="space-y-3">
              {statLabels.map(({ key, label, icon }) => (
                <div key={key} className="flex items-center gap-2">
                  <button 
                    onClick={() => handleSmartEvClick(key as keyof Stats)}
                    className={`flex-shrink-0 w-16 py-1.5 rounded-lg border-2 text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                      evs[key as keyof Stats] > 0 
                        ? evs[key as keyof Stats] >= 252 ? 'bg-indigo-500 border-indigo-500 text-white shadow-md' : 'bg-indigo-100 border-indigo-200 text-indigo-700'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'
                    }`}
                  >
                    {icon} {label}
                  </button>
                  <div className="flex-1 px-4">
                    <input
                      type="range"
                      min="0"
                      max="252"
                      step="4"
                      value={evs[key as keyof Stats]}
                      onChange={(e) => handleEvChange(key as keyof Stats, Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="252"
                      step="4"
                      value={evs[key as keyof Stats]}
                      onChange={(e) => handleEvChange(key as keyof Stats, Number(e.target.value))}
                      className="w-16 p-1.5 text-center text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400 bg-slate-50 font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}"""

pm_content = pm_content.replace(old_ev_section, new_ev_section)

with open(pm_file, 'w', encoding='utf-8') as f:
    f.write(pm_content)

# 3. Update App.tsx to pass isOpponent
app_file = 'src/App.tsx'
with open(app_file, 'r', encoding='utf-8') as f:
    app_content = f.read()

old_app_call = """        <PokemonDetailModal
          pokemon={editingTeam === 'my' ? myTeam[editingIndex]! : opponentTeam[editingIndex]!}
          onClose={() => { setEditingTeam(null); setEditingIndex(null); }}
          onSave={(updatedPokemon) => {"""
new_app_call = """        <PokemonDetailModal
          isOpponent={editingTeam === 'opp'}
          pokemon={editingTeam === 'my' ? myTeam[editingIndex]! : opponentTeam[editingIndex]!}
          onClose={() => { setEditingTeam(null); setEditingIndex(null); }}
          onSave={(updatedPokemon) => {"""

app_content = app_content.replace(old_app_call, new_app_call)

app_content = app_content.replace('>v1.1.16</span>', '>v1.1.17</span>')

with open(app_file, 'w', encoding='utf-8') as f:
    f.write(app_content)
