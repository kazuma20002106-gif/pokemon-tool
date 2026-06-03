const fs = require('fs');
const https = require('https');

const svData = JSON.parse(fs.readFileSync('src/data/sv.json', 'utf8'));
const allPokemonNames = Array.from(new Set(svData.map(p => p.name.replace(/（.*）/, ''))));

https.get('https://gamewith.jp/pokemon-champions/546414', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        const found = allPokemonNames.filter(name => data.includes(name));
        console.log(`Found ${found.length} pokemon in HTML`);
        fs.writeFileSync('champions_roster.json', JSON.stringify(found, null, 2));
    });
});
