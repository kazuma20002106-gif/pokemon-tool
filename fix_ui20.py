import os

dc_file = 'src/components/DamageCalculator.tsx'

with open(dc_file, 'r', encoding='utf-8') as f:
    dc_content = f.read()

# 1. Update TooltipHelp and InfoTooltip
old_tooltip_help = """const TooltipHelp = ({ text }: { text: string }) => (
  <div className="group relative inline-flex items-center ml-1">
    <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
    <div className="hidden group-hover:block absolute z-50 w-56 p-2 text-xs text-white bg-slate-800 rounded-lg shadow-lg bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
    </div>
  </div>
);"""
new_tooltip_help = """const TooltipHelp = ({ text, align = 'center' }: { text: string, align?: 'center' | 'right' }) => (
  <div className="group relative inline-flex items-center ml-1">
    <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
    <div className={`hidden group-hover:block absolute z-[60] w-56 p-2 text-xs text-white bg-slate-800 rounded-lg shadow-lg bottom-full mb-2 pointer-events-none ${
      align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2'
    }`}>
      {text}
      <div className={`absolute top-full border-4 border-transparent border-t-slate-800 ${
        align === 'right' ? 'right-2' : 'left-1/2 -translate-x-1/2'
      }`}></div>
    </div>
  </div>
);"""
dc_content = dc_content.replace(old_tooltip_help, new_tooltip_help)

old_info_tooltip = """const InfoTooltip = ({ text, className = "w-48" }: { text: string, className?: string }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className="relative inline-flex items-center ml-1 align-middle">
      <button 
        type="button"
        onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="text-slate-400 hover:text-slate-600 transition-colors p-1 -m-1"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {isOpen && (
        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 ${className} p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl z-20 text-left font-normal leading-relaxed pointer-events-none`}>
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
        </div>
      )}
    </div>
  );
};"""
new_info_tooltip = """const InfoTooltip = ({ text, className = "w-48", align = 'center' }: { text: string, className?: string, align?: 'center' | 'right' }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className="relative inline-flex items-center ml-1 align-middle">
      <button 
        type="button"
        onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="text-slate-400 hover:text-slate-600 transition-colors p-1 -m-1"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {isOpen && (
        <div className={`absolute bottom-full mb-2 ${className} p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl z-50 text-left font-normal leading-relaxed pointer-events-none ${
          align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2'
        }`}>
          {text}
          <div className={`absolute top-full border-4 border-transparent border-t-slate-800 ${
            align === 'right' ? 'right-2' : 'left-1/2 -translate-x-1/2'
          }`}></div>
        </div>
      )}
    </div>
  );
};"""
dc_content = dc_content.replace(old_info_tooltip, new_info_tooltip)

# Add getTypeTextColor
type_color_helper = """
const getTypeTextColor = (type: string) => {
  const colors: Record<string, string> = {
    'ノーマル': 'text-stone-500', 'ほのお': 'text-red-500', 'みず': 'text-blue-500', 'くさ': 'text-green-600',
    'でんき': 'text-yellow-500', 'こおり': 'text-cyan-500', 'かくとう': 'text-orange-600', 'どく': 'text-purple-600',
    'じめん': 'text-amber-600', 'ひこう': 'text-sky-500', 'エスパー': 'text-pink-500', 'むし': 'text-lime-600',
    'いわ': 'text-yellow-700', 'ゴースト': 'text-violet-600', 'ドラゴン': 'text-indigo-600', 'あく': 'text-zinc-700',
    'はがね': 'text-slate-500', 'フェアリー': 'text-pink-400'
  };
  return colors[type] || 'text-slate-700';
};
"""
dc_content = dc_content.replace('export const DamageCalculator: React.FC<Props>', type_color_helper + '\nexport const DamageCalculator: React.FC<Props>')

# Update TooltipHelp usage (worstcase)
old_worstcase_tooltip = '<TooltipHelp text="相手の攻撃に対して、考えられる最も硬いステータス（HP・防御/特防特化、および突撃チョッキなどの補正）を想定して計算します。下のボタンで相手の道具補正をオンオフできます。" />'
new_worstcase_tooltip = '<TooltipHelp align="right" text="相手の攻撃に対して、考えられる最も硬いステータス（HP・防御/特防特化、および突撃チョッキなどの補正）を想定して計算します。下のボタンで相手の道具補正をオンオフできます。" />'
dc_content = dc_content.replace(old_worstcase_tooltip, new_worstcase_tooltip)

# Update Pokemon header
old_poke_header = """              <div className="text-xs font-bold text-slate-800 mb-2 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center">
                  <span className="truncate">{myPoke.base.name}</span>
                  <span className="text-[10px] ml-2 font-normal text-slate-400 border border-slate-200 px-1 rounded">からの攻撃</span>"""
new_poke_header = """              <div className="text-xs font-bold text-slate-800 mb-3 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex flex-wrap items-center gap-1">
                  <div className="flex items-baseline bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">
                    <span className="font-black text-[15px] tracking-wide text-slate-800 truncate">{myPoke.base.name}</span>
                    <span className="text-[10px] ml-1 font-bold text-slate-400">からの攻撃</span>
                  </div>"""
dc_content = dc_content.replace(old_poke_header, new_poke_header)

# Update Move name coloring
old_move_name = """                          <div className="flex items-center flex-wrap gap-1">
                            {moveName} 
                            <span className="text-[10px] text-slate-400 font-normal">({moveData.type} / 威力{moveData.power})</span>"""
new_move_name = """                          <div className="flex items-center flex-wrap gap-1">
                            <span className={`text-[13px] font-black tracking-wide ${getTypeTextColor(moveData.type)}`}>{moveName}</span>
                            <span className="text-[10px] text-slate-400 font-bold ml-1">({moveData.type} / 威力{moveData.power})</span>"""
dc_content = dc_content.replace(old_move_name, new_move_name)

# Update InfoTooltip align="right" for hitsToKO and damage ranges
old_ko_tooltip = '<InfoTooltip text="相手のHPを削り切るのに必要な攻撃回数の目安です。「確定1発」なら一撃で倒せます。" className="w-40" />'
new_ko_tooltip = '<InfoTooltip align="right" text="相手のHPを削り切るのに必要な攻撃回数の目安です。「確定1発」なら一撃で倒せます。" className="w-40" />'
dc_content = dc_content.replace(old_ko_tooltip, new_ko_tooltip)

old_range_tooltip = '<InfoTooltip text="実際のダメージ量の数値（最低乱数 〜 最高乱数）です。" className="w-40" />'
new_range_tooltip = '<InfoTooltip align="right" text="実際のダメージ量の数値（最低乱数 〜 最高乱数）です。" className="w-40" />'
dc_content = dc_content.replace(old_range_tooltip, new_range_tooltip)

old_bar_tooltip = '<InfoTooltip text="ゲージ全体が相手の最大HP(100%)です。赤い部分は「最低乱数(最も運が悪い時のダメージ)」、オレンジの部分は「最高乱数までのブレ幅」を表しています。" className="w-56" />'
new_bar_tooltip = '<InfoTooltip align="right" text="ゲージ全体が相手の最大HP(100%)です。赤い部分は「最低乱数(最も運が悪い時のダメージ)」、オレンジの部分は「最高乱数までのブレ幅」を表しています。" className="w-56" />'
dc_content = dc_content.replace(old_bar_tooltip, new_bar_tooltip)


with open(dc_file, 'w', encoding='utf-8') as f:
    f.write(dc_content)

# Update App.tsx
app_file = 'src/App.tsx'
with open(app_file, 'r', encoding='utf-8') as f:
    app_content = f.read()
app_content = app_content.replace('>v1.1.13</span>', '>v1.1.14</span>')
with open(app_file, 'w', encoding='utf-8') as f:
    f.write(app_content)
