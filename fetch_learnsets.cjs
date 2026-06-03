const fs = require('fs');
const https = require('https');

async function fetchGraphQL(query) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'beta.pokeapi.co',
      path: '/graphql/v1beta',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify({ query }));
    req.end();
  });
}

async function main() {
  console.log("Loading local pokemon data...");
  const champions = JSON.parse(fs.readFileSync('src/data/champions.json', 'utf8'));
  const sv = JSON.parse(fs.readFileSync('src/data/sv.json', 'utf8'));
  
  const uniqueNames = new Set([...champions.map(p => p.name), ...sv.map(p => p.name)]);
  console.log(`Found ${uniqueNames.size} unique Pokemon to fetch.`);

  // To map Japanese names to IDs, let's fetch all species names
  console.log("Fetching all Japanese species names...");
  const speciesData = await fetchGraphQL(`
    query {
      pokemon_v2_pokemonspeciesname(where: {language_id: {_eq: 11}}) {
        name
        pokemon_species_id
      }
    }
  `);

  if (!speciesData.data) {
    console.error("Failed to fetch species data", speciesData);
    return;
  }

  const nameToId = {};
  for (const entry of speciesData.data.pokemon_v2_pokemonspeciesname) {
    nameToId[entry.name] = entry.pokemon_species_id;
  }

  // Handle Megas / Forms which don't have separate species but different default pokemon
  // For simplicity, we'll try to find the base species. 
  // Examples: "メガフシギバナ" -> base "フシギバナ"
  // "リザードン" -> base "リザードン"
  
  const learnsets = {};
  const batchSize = 30;
  const namesArray = Array.from(uniqueNames);

  for (let i = 0; i < namesArray.length; i += batchSize) {
    const batch = namesArray.slice(i, i + batchSize);
    console.log(`Fetching batch ${Math.floor(i/batchSize) + 1} / ${Math.ceil(namesArray.length/batchSize)}`);
    
    // Convert names to base species names if needed (strip "メガ" etc.)
    const speciesIds = [];
    const idToOriginalName = {};
    
    for (const name of batch) {
      let searchName = name;
      if (searchName.startsWith("メガ")) searchName = searchName.replace("メガ", "");
      if (searchName.includes("(")) searchName = searchName.split("(")[0].trim();
      
      const id = nameToId[searchName] || nameToId[name];
      if (id) {
        speciesIds.push(id);
        if (!idToOriginalName[id]) idToOriginalName[id] = [];
        idToOriginalName[id].push(name);
      } else {
        console.warn(`Could not find species ID for: ${name}`);
      }
    }

    if (speciesIds.length === 0) continue;

    // Fetch moves for these species
    const movesQuery = `
      query {
        pokemon_v2_pokemon(where: {pokemon_species_id: {_in: [${speciesIds.join(',')}]}}) {
          pokemon_species_id
          pokemon_v2_pokemonmoves {
            pokemon_v2_versiongroup {
              name
            }
            pokemon_v2_move {
              pokemon_v2_movenames(where: {language_id: {_eq: 11}}) {
                name
              }
            }
          }
        }
      }
    `;

    const movesData = await fetchGraphQL(movesQuery);
    
    if (!movesData.data) {
      console.error("Failed to fetch moves batch", movesData);
      continue;
    }

    for (const pokemon of movesData.data.pokemon_v2_pokemon) {
      const speciesId = pokemon.pokemon_species_id;
      const originalNames = idToOriginalName[speciesId] || [];
      
      // We want to extract all unique moves from the latest generation available for this pokemon
      // Let's just collect ALL moves it has ever learned in any generation to be safe, 
      // or specifically SV if we want to be strict.
      // But gathering ALL moves across all gens is actually safer for custom formats like "Champions".
      const movesSet = new Set();
      
      for (const m of pokemon.pokemon_v2_pokemonmoves) {
        // You could filter by m.pokemon_v2_versiongroup.name === 'scarlet-violet' here if strictly needed.
        // But collecting all is simpler and ensures no missing moves.
        const jpnNames = m.pokemon_v2_move?.pokemon_v2_movenames;
        if (jpnNames && jpnNames.length > 0) {
          movesSet.add(jpnNames[0].name);
        }
      }
      
      const movesArr = Array.from(movesSet);
      if (movesArr.length > 0) {
        for (const name of originalNames) {
          // If we have multiple forms, they might share the same base species ID here
          // We just assign the learnset
          learnsets[name] = movesArr;
        }
      }
    }
  }

  // Let's see if any Pokemon are missing
  for (const name of uniqueNames) {
    if (!learnsets[name]) {
      console.warn(`WARNING: No moves found for ${name}, creating empty array.`);
      learnsets[name] = [];
    }
  }

  fs.writeFileSync('src/data/learnsets.json', JSON.stringify(learnsets, null, 2));
  fs.writeFileSync('src/data/unimplemented_moves.json', JSON.stringify([], null, 2));
  console.log("Done! Wrote learnsets.json and unimplemented_moves.json");
}

main().catch(console.error);
