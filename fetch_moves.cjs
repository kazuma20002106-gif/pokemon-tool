const https = require('https');
const fs = require('fs');

const query = `
query {
  pokemon_v2_move {
    power
    accuracy
    pokemon_v2_movedamageclass {
      name
    }
    pokemon_v2_type {
      name
    }
    pokemon_v2_movenames(where: {language_id: {_eq: 11}}) {
      name
    }
  }
}
`;

const options = {
  hostname: 'beta.pokeapi.co',
  path: '/graphql/v1beta',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'NodeJS'
  }
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
        const json = JSON.parse(data);
        const moves = json.data.pokemon_v2_move.map(m => {
            const jpName = m.pokemon_v2_movenames[0]?.name || 'Unknown';
            return {
                name: jpName,
                power: m.power,
                accuracy: m.accuracy,
                type: m.pokemon_v2_type?.name,
                category: m.pokemon_v2_movedamageclass?.name
            };
        }).filter(m => m.name !== 'Unknown');
        fs.writeFileSync('src/data/moves.json', JSON.stringify(moves, null, 2));
        console.log(`Saved ${moves.length} moves to src/data/moves.json`);
    } catch(e) {
        console.error("Error parsing response", e.message);
    }
  });
});
req.write(JSON.stringify({ query }));
req.end();
