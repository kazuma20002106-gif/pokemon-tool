const fs = require('fs');

const KNOWN_TYPES = [
  "ノーマル", "ほのお", "みず", "くさ", "でんき", "こおり", "かくとう", "どく",
  "じめん", "ひこう", "エスパー", "むし", "いわ", "ゴースト", "ドラゴン", "あく",
  "はがね", "フェアリー"
];

function parseTypes(typeStr) {
  const result = [];
  let remaining = typeStr;
  while (remaining.length > 0) {
    const match = KNOWN_TYPES.find(t => remaining.startsWith(t));
    if (match) {
      result.push(match);
      remaining = remaining.slice(match.length);
    } else {
      break; 
    }
  }
  return result;
}

const csv = fs.readFileSync('champions_raw_list.csv', 'utf8').replace(/^\uFEFF/, '');
const targetRoster = csv.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('No,')).map(line => {
    const parts = line.split(',');
    return {
        id: parseInt(parts[0].replace('No.', ''), 10),
        name: parts[1],
        abilities: [parts[2], parts[3], parts[4]].filter(a => a && a.trim() !== '')
    };
});

const customMegas = fs.readFileSync('custom_megas.txt', 'utf8').replace(/^\uFEFF/, '').split('\n').filter(l => l).map(line => {
    const [name, typeStr, ability, statsStr] = line.split(',');
    const [hp, atk, def, spa, spd, spe] = statsStr.split('(')[0].split('-').map(s => parseInt(s.trim(), 10));
    return {
        name: name.trim(),
        types: parseTypes(typeStr.trim()),
        stats: { hp, attack: atk, defense: def, spAttack: spa, spDefense: spd, speed: spe }
    };
});

let oldChampStr = fs.readFileSync('src/data/champions.json', 'utf8');
if (oldChampStr.charCodeAt(0) === 0xFEFF) oldChampStr = oldChampStr.slice(1);
const oldChamp = JSON.parse(oldChampStr);

const pokeApi = JSON.parse(fs.readFileSync('pokeapi_dump.json', 'utf8'));

const fallbacks = {
    "ヒスイウインディ": { types: ["ほのお", "いわ"], stats: {hp:90, attack:115, defense:80, spAttack:95, spDefense:80, speed:90} },
    "ガラルヤドラン": { types: ["どく", "エスパー"], stats: {hp:95, attack:100, defense:95, spAttack:100, spDefense:70, speed:30} },
    "パルデアケンタロス(かくとう)": { types: ["かくとう"], stats: {hp:75, attack:110, defense:105, spAttack:30, spDefense:70, speed:100} },
    "パルデアケンタロス(ほのお)": { types: ["かくとう", "ほのお"], stats: {hp:75, attack:110, defense:105, spAttack:30, spDefense:70, speed:100} },
    "パルデアケンタロス(みず)": { types: ["かくとう", "みず"], stats: {hp:75, attack:110, defense:105, spAttack:30, spDefense:70, speed:100} },
    "ヒスイバクフーン": { types: ["ほのお", "ゴースト"], stats: {hp:73, attack:84, defense:78, spAttack:119, spDefense:85, speed:95} },
    "ガラルヤドキング": { types: ["どく", "エスパー"], stats: {hp:95, attack:65, defense:80, spAttack:110, spDefense:110, speed:30} },
    "ポワルン(たいようのすがた)": { types: ["ほのお"], stats: {hp:70, attack:70, defense:70, spAttack:70, spDefense:70, speed:70} },
    "ポワルン(あまみずのすがた)": { types: ["みず"], stats: {hp:70, attack:70, defense:70, spAttack:70, spDefense:70, speed:70} },
    "ポワルン(ゆきぐものすがた)": { types: ["こおり"], stats: {hp:70, attack:70, defense:70, spAttack:70, spDefense:70, speed:70} },
    "ヒスイダイケンキ": { types: ["みず", "あく"], stats: {hp:90, attack:108, defense:80, spAttack:100, spDefense:65, speed:85} },
    "ヒスイゾロアーク": { types: ["ノーマル", "ゴースト"], stats: {hp:55, attack:100, defense:60, spAttack:125, spDefense:60, speed:110} },
    "ガラルマッギョ": { types: ["じめん", "はがね"], stats: {hp:109, attack:81, defense:99, spAttack:66, spDefense:84, speed:32} },
    "フラエッテ(えいえんのはな)": { types: ["フェアリー"], stats: {hp:74, attack:65, defense:67, spAttack:125, spDefense:128, speed:92} },
    "ニャオニクス(オス)": { types: ["エスパー"], stats: {hp:74, attack:48, defense:76, spAttack:83, spDefense:81, speed:104} },
    "ニャオニクス(メス)": { types: ["エスパー"], stats: {hp:74, attack:48, defense:76, spAttack:83, spDefense:81, speed:104} },
    "ヒスイヌメルゴン": { types: ["はがね", "ドラゴン"], stats: {hp:80, attack:100, defense:100, spAttack:110, spDefense:150, speed:60} },
    "ヒスイクレベース": { types: ["こおり", "いわ"], stats: {hp:95, attack:127, defense:184, spAttack:34, spDefense:36, speed:38} },
    "ヒスイジュナイパー": { types: ["くさ", "かくとう"], stats: {hp:88, attack:112, defense:80, spAttack:95, spDefense:95, speed:60} },
    "ルガルガン(まひる)": { types: ["いわ"], stats: {hp:75, attack:115, defense:65, spAttack:55, spDefense:65, speed:112} },
    "ルガルガン(まよなか)": { types: ["いわ"], stats: {hp:85, attack:115, defense:75, spAttack:55, spDefense:75, speed:82} },
    "ルガルガン(たそがれ)": { types: ["いわ"], stats: {hp:75, attack:117, defense:65, spAttack:55, spDefense:65, speed:110} },
    "イダイトウ(オス)": { types: ["みず", "ゴースト"], stats: {hp:120, attack:112, defense:65, spAttack:80, spDefense:75, speed:78} },
    "イダイトウ(メス)": { types: ["みず", "ゴースト"], stats: {hp:120, attack:92, defense:65, spAttack:100, spDefense:75, speed:78} },
    "イッカネズミ(3びきかぞく)": { types: ["ノーマル"], stats: {hp:74, attack:75, defense:70, spAttack:65, spDefense:75, speed:111} },
    "イッカネズミ(4ひきかぞく)": { types: ["ノーマル"], stats: {hp:74, attack:75, defense:70, spAttack:65, spDefense:75, speed:111} },
    "イルカマン(ナイーブ)": { types: ["みず"], stats: {hp:100, attack:70, defense:65, spAttack:53, spDefense:62, speed:100} },
    "イルカマン(マイティ)": { types: ["みず"], stats: {hp:100, attack:160, defense:97, spAttack:106, spDefense:87, speed:100} },
    "パンプジン(こだましゅ)": { types: ["ゴースト", "くさ"], stats: {hp:55, attack:85, defense:122, spAttack:58, spDefense:75, speed:99} },
    "パンプジン(ちゅうだましゅ)": { types: ["ゴースト", "くさ"], stats: {hp:65, attack:90, defense:122, spAttack:58, spDefense:75, speed:84} },
    "パンプジン(おおだましゅ)": { types: ["ゴースト", "くさ"], stats: {hp:75, attack:95, defense:122, spAttack:58, spDefense:75, speed:69} },
    "パンプジン(ギガだましゅ)": { types: ["ゴースト", "くさ"], stats: {hp:85, attack:100, defense:122, spAttack:58, spDefense:75, speed:54} }
};

const finalDatabase = [];
const missingStats = [];

targetRoster.forEach(target => {
    let types = null;
    let stats = null;
    
    let cMega = customMegas.find(c => target.name.startsWith(c.name));
    if (cMega) {
        types = cMega.types;
        stats = cMega.stats;
    }
    
    if (!types && fallbacks[target.name]) {
        types = fallbacks[target.name].types;
        stats = fallbacks[target.name].stats;
    }

    if (!types) {
        let p = oldChamp.find(o => o.name === target.name);
        if (!p) {
            p = oldChamp.find(o => {
                const norm = o.name.replace(/（/g, '(').replace(/）/g, ')');
                return norm === target.name || norm.includes(target.name.replace('アローラ', '')) || norm.replace('(', '').replace(')', '').includes(target.name);
            });
        }
        if (p) {
            types = p.types;
            stats = p.stats;
        }
    }

    if (!types) {
        const p = pokeApi.find(o => o.name === target.name);
        if (p) {
            types = p.types;
            stats = p.stats;
        }
    }
    
    if (types && stats) {
        finalDatabase.push({
            id: target.id,
            name: target.name,
            types,
            abilities: target.abilities,
            hiddenAbilities: [], 
            stats,
            availableIn: ["champions"]
        });
    } else {
        missingStats.push(target.name);
    }
});

fs.writeFileSync('src/data/champions.json', JSON.stringify(finalDatabase, null, 2));

console.log(`Successfully merged ${finalDatabase.length} pokemon.`);
if (missingStats.length > 0) {
    console.log(`CRITICAL: Still missing types/stats for ${missingStats.length} pokemon:`);
    console.log(missingStats.join(', '));
}

