const fs = require('fs');
const path = require('path');
const argv = require('yargs')
    .usage('Usage: $0 -output <output folder> --input <one or more input files>')
    .option('input', {alias: 'i', default: null, type: 'array'} )
    //.alias('i', 'input')
    .alias('o', 'output')
    //.array('input')
    //.option('input', {type: 'array', desc: 'One or more input files.'})
    //.command('input [files..]', 'input files')
    //.demandOption(['output', 'input'])
    .argv;
const yaml = require('js-yaml');

var outFolder = argv.output.trim();
var inputFiles = argv.input.map((x) => { return x.trim(); });

var challenge_id = 1;
var flag_id = 1;
var hint_id = 1;
var challenges = { results: [] };
var flags = { results: [] };
var hints = { results: [] }; 
for(var i=0; i < inputFiles.length; i++) {
    console.log(`Processing ${inputFiles[i]}`)
    var fn = inputFiles[i]; //.replace(/"/g,'');
    var fc = fs.readFileSync(fn);
    //var work = yaml.load(fc);
    var work = yaml.safeLoad(fc);
    for(var w=0; w < work.length; w++){
        if(work[w].name && work[w].description && work[w].category && work[w].type ) {
            chal = {id: challenge_id, name: work[w].name, description: work[w].description, max_attempts: work[w].max_attempts ? work[w].max_attempts :  0, 
                value: work[w].value, category: work[w].category, type: work[w].type, state: work[w].state 
            };
            challenges.results.push(chal);
            if(work[w].flags) {
                for(var f=0;f < work[w].flags.length; f++){
                    flag = {id: flag_id, challenge_id: challenge_id, type: work[w].flags[f].type, content: work[w].flags[f].content, data: work[w].flags[f].data ? work[w].flags[f].data : "case_insensitive" };
                    flags.results.push(flag);
                    flag_id++;
                }    
            }
            if(work[w].hints) {
                for(var h=0;h < work[w].hints.length; h++){
                    hint = {id: hint_id, challenge_id: challenge_id, type: work[w].hints[h].type, content: work[w].hints[h].content, cost: work[w].hints[h].cost, requirements: work[w].hints[h].requirements };
                    hints.results.push(hint);
                    hint_id++;
                }    
            }
            challenge_id++;    
        }
    }
}

var ct = JSON.stringify(challenges);
var ft = JSON.stringify(flags);
var ht = JSON.stringify(hints);
var challengeOutFile = path.join(outFolder, "challenges.json" );
var flagsOutFile = path.join(outFolder, "flags.json");
var hintsOutFile = path.join(outFolder, "hints.json");
fs.writeFileSync(challengeOutFile, ct);
fs.writeFileSync(flagsOutFile, ft);
fs.writeFileSync(hintsOutFile, ht);

console.log(outFolder);

