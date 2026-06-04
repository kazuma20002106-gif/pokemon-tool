import os

card_file = 'src/components/BattlePokemonCard.tsx'
with open(card_file, 'r', encoding='utf-8') as f:
    content = f.read()

# 3. Change gear icon to a button
content = content.replace(
"""            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm text-slate-800">{pokemon.base.name}</h3>
              <button onClick={onEdit} className="text-slate-400 hover:text-slate-600 p-1">
                <Settings2 className="w-4 h-4" />
              </button>
            </div>""",
"""            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm text-slate-800">{pokemon.base.name}</h3>
              <button onClick={onEdit} className="text-[9px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded shadow-sm border border-slate-200">
                ステータス・技を変更
              </button>
            </div>"""
)

# 4. Change Rank labels
content = content.replace("""        <RankSelector label="A" value={ranks.attack} onChange={(v) => onRankChange('attack', v)} />
        <RankSelector label="B" value={ranks.defense} onChange={(v) => onRankChange('defense', v)} />
        <RankSelector label="C" value={ranks.spAttack} onChange={(v) => onRankChange('spAttack', v)} />
        <RankSelector label="D" value={ranks.spDefense} onChange={(v) => onRankChange('spDefense', v)} />
        <RankSelector label="S" value={ranks.speed} onChange={(v) => onRankChange('speed', v)} />""",
"""        <RankSelector label="攻撃" value={ranks.attack} onChange={(v) => onRankChange('attack', v)} />
        <RankSelector label="防御" value={ranks.defense} onChange={(v) => onRankChange('defense', v)} />
        <RankSelector label="特攻" value={ranks.spAttack} onChange={(v) => onRankChange('spAttack', v)} />
        <RankSelector label="特防" value={ranks.spDefense} onChange={(v) => onRankChange('spDefense', v)} />
        <RankSelector label="素早" value={ranks.speed} onChange={(v) => onRankChange('speed', v)} />""")

content = content.replace("""    <div className="flex items-center justify-between bg-white rounded border border-slate-200 px-1 py-0.5">
      <span className="text-[9px] font-bold text-slate-500 w-4">{label}</span>""",
"""    <div className="flex items-center justify-between bg-white rounded border border-slate-200 px-1 py-0.5">
      <span className="text-[9px] font-bold text-slate-500 w-5">{label}</span>""")

with open(card_file, 'w', encoding='utf-8') as f:
    f.write(content)
