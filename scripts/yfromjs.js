const fs = require('fs');
const path = require('path');
const argv = require('yargs')
    .usage('Usage: $0 --challenges <challenges file> --flags <flags file> --hints <hints file> --output <output file>')
    .alias('o', 'output')
    .alias('c', 'challenges')
    .alias('f', 'flags')
    .alias('h', 'hints')
    .argv;
const yaml = require('js-yaml');

var cf = argv.challenges.trim();
var ff = argv.flags.trim();
var hf = argv.hints.trim();
var of = argv.output.trim();

var challenges = JSON.parse(fs.readFileSync(cf));
var flags = JSON.parse(fs.readFileSync(ff));
var hints = JSON.parse(fs.readFileSync(hf));

var foo = challenges.results.map(c => {
    return { name: c.name, description: c.description, max_attempts: c.max_attempts, value: c.value, category: c.category, type: c.type, state: c.state,
        flags: flags.results.filter(x => x.challenge_id == c.id).map(f => {return {type: f.type, content: f.content, data: f.data}; }),
        hints: hints.results.filter(x => x.challenge_id == c.id).map(h => { return { type: h.type, content: h.content, cost: h.cost }})
    };
});

var y = yaml.safeDump(foo);

fs.writeFileSync(of, y);
console.log(`Wrote: ${of}`);