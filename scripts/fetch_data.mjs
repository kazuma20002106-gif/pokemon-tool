import fs from 'fs';
import https from 'https';
import path from 'path';

const url = 'https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/pokedex.json';

const typeMap = {
  'Normal': 'ノーマル',
  'Fire': 'ほのお',
  'Water': 'みず',
  'Grass': 'くさ',
  'Electric': 'でんき',
  'Ice': 'こおり',
  'Fighting': 'かくとう',
  'Poison': 'どく',
  'Ground': 'じめん',
  'Flying': 'ひこう',
  'Psychic': 'エスパー',
  'Bug': 'むし',
  'Rock': 'いわ',
  'Ghost': 'ゴースト',
  'Dragon': 'ドラゴン',
  'Dark': 'あく',
  'Steel': 'はがね',
  'Fairy': 'フェアリー'
};

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const pokedex = JSON.parse(data);
      const formatted = pokedex.map(p => {
        return {
          id: p.id,
          name: p.name.japanese,
          types: p.type.map(t => typeMap[t] || t),
          speed: p.base.Speed
        };
      }).filter(p => p.name && p.speed); // 念のため日本語名が存在するものだけフィルタ

      const dataDir = path.resolve('src/data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // sv.jsonとchampions.jsonを別々に保存
      fs.writeFileSync(path.join(dataDir, 'sv.json'), JSON.stringify(formatted, null, 2));
      fs.writeFileSync(path.join(dataDir, 'champions.json'), JSON.stringify(formatted, null, 2));
      
      console.log(`Successfully wrote ${formatted.length} Pokemon to sv.json and champions.json!`);
    } catch (e) {
      console.error('Error parsing JSON:', e);
    }
  });
}).on('error', (e) => {
  console.error('Error fetching data:', e);
});
