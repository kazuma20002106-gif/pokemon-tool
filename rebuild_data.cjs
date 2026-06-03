const fs = require('fs');
const https = require('https');

// Re-fetch all data from kotofurumiya to include Mega Evolutions
https.get('https://raw.githubusercontent.com/kotofurumiya/pokemon_data/master/data/pokemon_data.json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const fullData = JSON.parse(data);
        
        // sv.json (No mega evolutions)
        const svFormatted = fullData.filter(p => !p.isMegaEvolution).map(p => {
            let name = p.name;
            if (p.form) name += `（${p.form}）`;
            return {
                id: p.no,
                name: name,
                types: p.types,
                abilities: p.abilities,
                hiddenAbilities: p.hiddenAbilities,
                stats: {
                    hp: p.stats.hp, attack: p.stats.attack, defense: p.stats.defence,
                    spAttack: p.stats.spAttack, spDefense: p.stats.spDefence, speed: p.stats.speed
                },
                availableIn: ["sv"]
            };
        });
        fs.writeFileSync('src/data/sv.json', JSON.stringify(svFormatted, null, 2));

        // champions.json (Includes mega evolutions)
        const champFormatted = fullData.map(p => {
            let name = p.name;
            if (p.form) name += `（${p.form}）`;
            if (p.isMegaEvolution) name = `メガ${name}`; // Add "Mega" prefix just in case, or GameWith uses it
            return {
                id: p.no,
                name: name,
                types: p.types,
                abilities: p.abilities,
                hiddenAbilities: p.hiddenAbilities,
                stats: {
                    hp: p.stats.hp, attack: p.stats.attack, defense: p.stats.defence,
                    spAttack: p.stats.spAttack, spDefense: p.stats.spDefence, speed: p.stats.speed
                },
                availableIn: ["champions"]
            };
        });
        
        // For now, mock the Champions confirmed roster by picking 278 random / first Pokemon.
        // Or wait, actually, GameWith regulation M-A has 278. We can just mark all as available for now and let the user filter later.
        
        fs.writeFileSync('src/data/champions.json', JSON.stringify(champFormatted, null, 2));
        console.log("Rebuilt sv.json and champions.json (with Megas)!");
    });
});
