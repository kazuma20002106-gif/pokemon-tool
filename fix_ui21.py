import os

dc_file = 'src/components/DamageCalculator.tsx'

with open(dc_file, 'r', encoding='utf-8') as f:
    dc_content = f.read()

# 1. Remove overflow-hidden from DamageCalculator main container
old_main_container = '<div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-4">'
new_main_container = '<div className="bg-white rounded-2xl shadow-sm border border-slate-200 mt-4">'
dc_content = dc_content.replace(old_main_container, new_main_container)

# 2. Add rounded-t-2xl to the inner header
old_inner_header = '<div className="bg-slate-100 p-3 border-b border-slate-200 flex flex-col gap-2">'
new_inner_header = '<div className="bg-slate-100 p-3 border-b border-slate-200 flex flex-col gap-2 rounded-t-2xl">'
dc_content = dc_content.replace(old_inner_header, new_inner_header)

# 3. Change InfoTooltip to open downwards to avoid hitting the top of the scroll container
old_info_tooltip = """const InfoTooltip = ({ text, className = "w-48", align = 'center' }: { text: string, className?: string, align?: 'center' | 'right' }) => {
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
        <div className={`absolute top-full mt-2 ${className} p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl z-[60] text-left font-normal leading-relaxed pointer-events-none ${
          align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2'
        }`}>
          <div className={`absolute bottom-full border-4 border-transparent border-b-slate-800 ${
            align === 'right' ? 'right-2' : 'left-1/2 -translate-x-1/2'
          }`}></div>
          {text}
        </div>
      )}
    </div>
  );
};"""
dc_content = dc_content.replace(old_info_tooltip, new_info_tooltip)

# 4. Add pb-32 to the overflow container so the downward tooltips don't get clipped at the bottom
old_space_y_3 = '<div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-100">'
new_space_y_3 = '<div className="space-y-3 max-h-[600px] overflow-y-auto pb-32 pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-100">'
dc_content = dc_content.replace(old_space_y_3, new_space_y_3)

# If it didn't find old_space_y_3 because of some formatting, I'll do a partial replace
if '<div className="space-y-3 max-h-[600px] overflow-y-auto pr-2' in dc_content:
    dc_content = dc_content.replace('<div className="space-y-3 max-h-[600px] overflow-y-auto pr-2', '<div className="space-y-3 max-h-[600px] overflow-y-auto pb-32 pr-2')


# TooltipHelp opens upwards and is now fine since we removed overflow-hidden.
# However, we should make sure TooltipHelp z-index is higher just in case.
old_tooltip_help = 'z-[60]'
new_tooltip_help = 'z-[70]'
dc_content = dc_content.replace(old_tooltip_help, new_tooltip_help, 1) # Only first occurrence, which should be TooltipHelp

with open(dc_file, 'w', encoding='utf-8') as f:
    f.write(dc_content)

# Update App.tsx
app_file = 'src/App.tsx'
with open(app_file, 'r', encoding='utf-8') as f:
    app_content = f.read()
app_content = app_content.replace('>v1.1.14</span>', '>v1.1.15</span>')
with open(app_file, 'w', encoding='utf-8') as f:
    f.write(app_content)
