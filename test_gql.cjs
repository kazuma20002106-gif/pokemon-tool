const https = require('https');

const query = `
query { 
  pokemon_v2_pokemon(limit: 5) { 
    id 
    name 
    pokemon_v2_pokemonspecy { 
      pokemon_v2_pokemonspeciesnames(where: {language_id: {_eq: 11}}) { name } 
    } 
    pokemon_v2_pokemonmoves(where: {pokemon_v2_versiongroup: {name: {_eq: "scarlet-violet"}}}) { 
      pokemon_v2_move { 
        pokemon_v2_movenames(where: {language_id: {_eq: 11}}) { name } 
      } 
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
    'User-Agent': 'Node.js'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(JSON.stringify(JSON.parse(data), null, 2));
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.write(JSON.stringify({ query }));
req.end();
