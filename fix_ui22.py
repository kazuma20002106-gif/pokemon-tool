import os

# 1. Update InfoTooltip in DamageCalculator.tsx
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
    print("WARNING: Could not find old_info_tooltip in DamageCalculator.tsx")

with open(dc_file, 'w', encoding='utf-8') as f:
    f.write(dc_content)

# 2. Update ClickTooltip in App.tsx
app_file = 'src/App.tsx'
with open(app_file, 'r', encoding='utf-8') as f:
    app_content = f.read()

old_click_tooltip = """const ClickTooltip = ({ text, className = "w-48" }: { text: React.ReactNode, className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
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
        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 ${className} p-3 bg-slate-800 text-white text-[11px] rounded shadow-xl z-[60] text-left font-normal leading-relaxed pointer-events-none`}>
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
        </div>
      )}
    </div>
  );
};"""

new_click_tooltip = """const ClickTooltip = ({ text, className = "w-48", align = 'center' }: { text: React.ReactNode, className?: string, align?: 'center' | 'right' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const [pos, setPos] = React.useState({ top: 0, left: 0 });

  useEffect(() => {
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
          className={`fixed z-[100] p-3 bg-slate-800 text-white text-[11px] rounded shadow-xl text-left font-normal leading-relaxed pointer-events-none ${className}`}
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

if old_click_tooltip in app_content:
    app_content = app_content.replace(old_click_tooltip, new_click_tooltip)
else:
    print("WARNING: Could not find old_click_tooltip in App.tsx")

app_content = app_content.replace('>v1.1.15</span>', '>v1.1.16</span>')

with open(app_file, 'w', encoding='utf-8') as f:
    f.write(app_content)
