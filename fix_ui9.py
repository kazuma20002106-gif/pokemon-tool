import os

app_file = 'src/App.tsx'
pd_file = 'src/components/PokemonDetailModal.tsx'

# 1. Update App.tsx version to v1.1.3
with open(app_file, 'r', encoding='utf-8') as f:
    app_content = f.read()

app_content = app_content.replace('>v1.1.2</span>', '>v1.1.3</span>')

with open(app_file, 'w', encoding='utf-8') as f:
    f.write(app_content)

# 2. Update PokemonDetailModal.tsx NATURES and UI
with open(pd_file, 'r', encoding='utf-8') as f:
    pd_content = f.read()

old_natures = """export const NATURES = [
  "いじっぱり (攻↑ 特攻↓)", "やんちゃ (攻↑ 特防↓)", "ゆうかん (攻↑ 速↓)", "さみしがり (攻↑ 防↓)",
  "ひかえめ (特攻↑ 攻↓)", "おっとり (特攻↑ 防↓)", "れいせい (特攻↑ 速↓)", "うっかりや (特攻↑ 特防↓)",
  "おくびょう (速↑ 攻↓)", "せっかち (速↑ 防↓)", "ようき (速↑ 特攻↓)", "むじゃき (速↑ 特防↓)",
  "ずぶとい (防↑ 攻↓)", "のんき (防↑ 速↓)", "わんぱく (防↑ 特攻↓)", "のうてんき (防↑ 特防↓)",
  "おだやか (特防↑ 攻↓)", "おとなしい (特防↑ 防↓)", "なまいき (特防↑ 速↓)", "しんちょう (特防↑ 特攻↓)",
  "てれや (補正なし)", "がんばりや (補正なし)", "すなお (補正なし)", "きまぐれ (補正なし)", "まじめ (補正なし)"
];"""

new_natures = """export const NATURES = [
  // 攻撃↑
  "いじっぱり (攻↑ 特攻↓)", "さみしがり (攻↑ 防↓)", "やんちゃ (攻↑ 特防↓)", "ゆうかん (攻↑ 速↓)",
  // 防御↑
  "ずぶとい (防↑ 攻↓)", "わんぱく (防↑ 特攻↓)", "のうてんき (防↑ 特防↓)", "のんき (防↑ 速↓)",
  // 特攻↑
  "ひかえめ (特攻↑ 攻↓)", "おっとり (特攻↑ 防↓)", "うっかりや (特攻↑ 特防↓)", "れいせい (特攻↑ 速↓)",
  // 特防↑
  "おだやか (特防↑ 攻↓)", "おとなしい (特防↑ 防↓)", "しんちょう (特防↑ 特攻↓)", "なまいき (特防↑ 速↓)",
  // 素早さ↑
  "おくびょう (速↑ 攻↓)", "せっかち (速↑ 防↓)", "ようき (速↑ 特攻↓)", "むじゃき (速↑ 特防↓)",
  // 補正なし
  "てれや (補正なし)", "がんばりや (補正なし)", "すなお (補正なし)", "きまぐれ (補正なし)", "まじめ (補正なし)"
];"""

pd_content = pd_content.replace(old_natures, new_natures)

old_nature_ui = """            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">性格</label>"""

new_nature_ui = """            <div>
              <label className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                <span>性格</span>
                {nature.includes('↑') ? (
                  <span className="text-[10px] font-normal scale-90 origin-right whitespace-nowrap">
                    <span className="text-red-500">{nature.match(/\((.+)↑/)?.[1]}↑</span>
                    <span className="text-blue-500 ml-1">{nature.match(/ (.+)↓\)/)?.[1]}↓</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-normal scale-90 origin-right text-slate-400">補正なし</span>
                )}
              </label>"""

pd_content = pd_content.replace(old_nature_ui, new_nature_ui)

with open(pd_file, 'w', encoding='utf-8') as f:
    f.write(pd_content)
