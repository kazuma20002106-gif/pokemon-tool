const fs = require('fs');

const officialMegas = [
    "メガフシギバナ", "メガリザードンX", "メガリザードンY", "メガカメックス",
    "メガスピアー", "メガピジョット", "メガフーディン", "メガヤドラン",
    "メガゲンガー", "メガガルーラ", "メガカイロス", "メガギャラドス",
    "メガプテラ", "メガミュウツーX", "メガミュウツーY", "メガデンリュウ",
    "メガハガネール", "メガハッサム", "メガヘラクロス", "メガヘルガー",
    "メガバンギラス", "メガジュカイン", "メガバシャーモ", "メガラグラージ",
    "メガサーナイト", "メガヤミラミ", "メガクチート", "メガボスゴドラ",
    "メガチャーレム", "メガライボルト", "メガサメハダー", "メガバクーダ",
    "メガチルタリス", "メガジュペッタ", "メガアブソル", "メガオニゴーリ",
    "メガボーマンダ", "メガメタグロス", "メガラティアス", "メガラティオス",
    "メガレックウザ", "メガミミロップ", "メガガブリアス", "メガルカリオ",
    "メガユキノオー", "メガエルレイド", "メガタブンネ", "メガディアンシー"
];

const csv = fs.readFileSync('champions_raw_list.csv', 'utf8').replace(/^\uFEFF/, '');
const lines = csv.split('\n').map(l => l.trim()).filter(l => l && l !== 'No,ポケモン名,特性1,特性2,特性3');

const customPokemons = [];

lines.forEach(line => {
    const parts = line.split(',');
    const name = parts[1];
    
    if (name.startsWith('メガ') && !officialMegas.includes(name)) {
        customPokemons.push(name);
    }
});

// Any other obvious customs? 
// イルカマン(ナイーブ) is zero form, イルカマン(マイティ) is hero form (Official)
// フラエッテ(えいえんのはな) is AZ's Floette (Official technically, but unreleased)
// パンプジン forms are official.

console.log(customPokemons.join('\n'));
