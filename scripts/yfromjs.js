const fs = require('fs');
const path = require('path');
const argv = require('yargs').argv;
const yaml = require('js-yaml');

var cf = argv.challenge;
var ff = argv.flag;
var challenges = JSON.parse(fs.readFileSync(cf));
var flags = JSON.parse(fs.readFileSync(ff));

var foo = challenges.results.map(c => {
    return { name: c.name, description: c.description, max_attempts: c.max_attempts, value: c.value, category: c.category, type: c.type, state: c.state,
        flags: flags.results.filter(x => x.challenge_id == c.id).map(f => {return {type: f.type, content: f.content, data: f.data}; })
    };
});

var y = yaml.safeDump(foo);

fs.writeFileSync(argv.outfile, y);
console.log(y);