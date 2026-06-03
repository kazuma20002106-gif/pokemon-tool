const fs = require('fs');

const csv = fs.readFileSync('champions_raw_list.csv', 'utf8').replace(/^\uFEFF/, '');
const lines = csv.split('\n').map(l => l.trim()).filter(l => l && l !== 'No,ポケモン名,特性1,特性2,特性3');

const csvData = lines.map(line => {
    const parts = line.split(',');
    return {
        name: parts[1],
        abilities: [parts[2], parts[3], parts[4]].filter(a => a && a.trim() !== '')
    };
});

let championsJsonStr = fs.readFileSync('src/data/champions.json', 'utf8');
if (championsJsonStr.charCodeAt(0) === 0xFEFF) {
  championsJsonStr = championsJsonStr.slice(1);
}
const championsData = JSON.parse(championsJsonStr);

console.log("=== Checking for discrepancies ===");

let missingInJson = [];
let abilityDifferences = [];

csvData.forEach(csvPoke => {
    let jsonPoke = championsData.find(p => p.name === csvPoke.name);
    
    if (!jsonPoke) {
        const altFind = championsData.find(p => {
            const normalizedJsonName = p.name.replace(/（/g, '(').replace(/）/g, ')');
            return normalizedJsonName === csvPoke.name || 
                   normalizedJsonName.includes(csvPoke.name.replace('アローラ', '')) ||
                   normalizedJsonName.replace('（', '').replace('）', '').includes(csvPoke.name);
        });
        
        if (altFind) {
             missingInJson.push(`Name mismatch or missing: ${csvPoke.name} (Did you mean ${altFind.name}?)`);
        } else {
             missingInJson.push(`Completely missing in JSON: ${csvPoke.name}`);
        }
        return;
    }

    const jsonAbilities = [...jsonPoke.abilities, ...jsonPoke.hiddenAbilities];
    const csvAbilities = csvPoke.abilities;
    
    const jStr = jsonAbilities.slice().sort().join(', ');
    const cStr = csvAbilities.slice().sort().join(', ');
    
    if (jStr !== cStr) {
        abilityDifferences.push({
            name: csvPoke.name,
            jsonHas: jStr,
            csvHas: cStr
        });
    }
});

console.log(`\nFound ${missingInJson.length} missing/mismatched pokemon:`);
missingInJson.forEach(m => console.log(m));

console.log(`\nFound ${abilityDifferences.length} ability differences:`);
abilityDifferences.forEach(d => console.log(`${d.name}: JSON[${d.jsonHas}] vs CSV[${d.csvHas}]`));

