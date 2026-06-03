const https = require('https');
const fs = require('fs');

const query = `
query {
  pokemon_v2_pokemon(where: {is_default: {_eq: true}}) {
    id
    name
    pokemon_v2_pokemonstats {
      base_stat
      pokemon_v2_stat { name }
    }
    pokemon_v2_pokemontypes {
      pokemon_v2_type {
        pokemon_v2_typenames(where: {language_id: {_eq: 11}}) { name }
      }
    }
    pokemon_v2_pokemonspecy {
      pokemon_v2_pokemonspeciesnames(where: {language_id: {_eq: 11}}) { name }
    }
  }
}
`;

const options = {
  hostname: 'beta.pokeapi.co',
  path: '/graphql/v1beta',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'User-Agent': 'NodeJS' }
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const output = json.data.pokemon_v2_pokemon.map(p => {
        const jpName = p.pokemon_v2_pokemonspecy?.pokemon_v2_pokemonspeciesnames[0]?.name;
        if (!jpName) return null;
        
        const types = p.pokemon_v2_pokemontypes.map(t => t.pokemon_v2_type.pokemon_v2_typenames[0]?.name).filter(Boolean);
        
        const stats = {};
        p.pokemon_v2_pokemonstats.forEach(s => {
          if (s.pokemon_v2_stat.name === 'hp') stats.hp = s.base_stat;
          if (s.pokemon_v2_stat.name === 'attack') stats.attack = s.base_stat;
          if (s.pokemon_v2_stat.name === 'defense') stats.defense = s.base_stat;
          if (s.pokemon_v2_stat.name === 'special-attack') stats.spAttack = s.base_stat;
          if (s.pokemon_v2_stat.name === 'special-defense') stats.spDefense = s.base_stat;
          if (s.pokemon_v2_stat.name === 'speed') stats.speed = s.base_stat;
        });

        return { id: p.id, name: jpName, types, stats };
      }).filter(Boolean);
      
      fs.writeFileSync('pokeapi_dump.json', JSON.stringify(output, null, 2));
      console.log(`Saved ${output.length} pokemon from PokeAPI!`);
    } catch (e) {
      console.error(e.message);
    }
  });
});
req.write(JSON.stringify({ query }));
req.end();
