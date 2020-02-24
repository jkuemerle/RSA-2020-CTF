const fs = require('fs');
const path = require('path');
const argv = require('yargs')
    .usage('Usage: $0 --output <output file> --input <input folder> ')
    .alias('o', 'output')
    .alias('i', 'input')
    .argv;
const targz = require('targz');

var outFile = argv.output.trim();
var inputFolder = argv.input.trim();

if(fs.existsSync(outFile)) {
    fs.unlinkSync(outFile);
}

targz.compress({
    src: inputFolder,
    dest: outFile,
    tar: {
        ignore: function(name) {
            return path.basename(name) === '.git' || path.basename(name) == ".github" // ignore .bin files when packing
        }
    },
}, function(err){
    if(err) {
        console.log(err);
    } else {
        console.log(`"Done: ${outFile}`);
    }
});