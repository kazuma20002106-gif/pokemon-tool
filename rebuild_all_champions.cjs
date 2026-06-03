const fs = require('fs');

const oldChampStr = fs.readFileSync('src/data/champions.json', 'utf8');
const currentDb = JSON.parse(oldChampStr); // Currently has 279 Custom/Implemented Pokemon

const pokeApi = JSON.parse(fs.readFileSync('pokeapi_dump.json', 'utf8'));

// We need to merge the rest of the Pokemon from PokeAPI into currentDb, but WITHOUT 'champions' in availableIn.
// Actually, it's easier to just push the ones from pokeApi that don't already exist in currentDb.

const existingNames = new Set(currentDb.map(p => p.name));

for (const p of pokeApi) {
    if (!existingNames.has(p.name)) {
        currentDb.push({
            id: p.id,
            name: p.name,
            types: p.types,
            abilities: [], // Since we don't have perfect abilities for standard non-implemented ones, just leave empty or try to fetch. Actually we can just leave it empty. The user only cares that they can "search" them but see they are unimplemented.
            hiddenAbilities: [],
            stats: p.stats,
            availableIn: [] // Not in champions!
        });
        existingNames.add(p.name);
    }
}

// Sort by ID
currentDb.sort((a, b) => a.id - b.id);

fs.writeFileSync('src/data/champions.json', JSON.stringify(currentDb, null, 2));
console.log(`Rebuilt champions.json with all ${currentDb.length} Pokemon! Unimplemented ones have empty availableIn.`);
