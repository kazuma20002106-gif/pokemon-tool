import os

dc_file = 'src/components/DamageCalculator.tsx'
with open(dc_file, 'r', encoding='utf-8') as f:
    dc_content = f.read()

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
        <div className={`absolute top-full mt-2 ${className} p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl z-[70] text-left font-normal leading-relaxed pointer-events-none ${
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

new_info_tooltip = """const InfoTooltip = ({ text, className = "w-48", align = 'center' }: { text: string, className?: string, align?: 'center' | 'right' }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const [pos, setPos] = React.useState({ top: 0, left: 0 });

  React.useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({
        top: rect.top,
        left: align === 'right' ? rect.right : rect.left + rect.width / 2
      });
      const handleScroll = () => setIsOpen(false);
      window.addEventListener('scroll', handleScroll, true);
      return () => window.removeEventListener('scroll', handleScroll, true);
    }
  }, [isOpen, align]);

  return (
    <div className="relative inline-flex items-center ml-1 align-middle">
      <button 
        ref={buttonRef}
        type="button"
        onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="text-slate-400 hover:text-slate-600 transition-colors p-1 -m-1"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {isOpen && (
        <div 
          className={`fixed z-[100] p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl text-left font-normal leading-relaxed pointer-events-none ${className}`}
          style={{ 
            top: pos.top - 6,
            left: pos.left,
            transform: align === 'right' ? 'translate(-100%, -100%)' : 'translate(-50%, -100%)'
          }}
        >
          {text}
          <div 
            className={`absolute top-full border-4 border-transparent border-t-slate-800 ${
              align === 'right' ? 'right-2' : 'left-1/2 -translate-x-1/2'
            }`}
          ></div>
        </div>
      )}
    </div>
  );
};"""

if old_info_tooltip in dc_content:
    dc_content = dc_content.replace(old_info_tooltip, new_info_tooltip)
else:
    print("WARNING: Could not find old_info_tooltip in DamageCalculator.tsx again")

with open(dc_file, 'w', encoding='utf-8') as f:
    f.write(dc_content)

