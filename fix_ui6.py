import os

app_file = 'src/App.tsx'
with open(app_file, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '<h1 className="text-xl font-black italic tracking-wider">BATTLE HUB</h1>',
    '<div className="flex items-baseline gap-2"><h1 className="text-xl font-black italic tracking-wider">BATTLE HUB</h1><span className="text-[10px] font-bold opacity-80 bg-black/20 px-1.5 py-0.5 rounded">v1.1.0</span></div>'
)

with open(app_file, 'w', encoding='utf-8') as f:
    f.write(content)
