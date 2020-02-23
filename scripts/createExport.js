const fs = require('fs');
const path = require('path');
const argv = require('yargs')
    .usage('Usage: $0 --output <output file> --input <base input folder>')
    .alias('i', 'input')
    .alias('o', 'output')
    .argv;

const AdmZip = require('adm-zip');

var outFile = argv.output.trim();
var inFolder = argv.input.trim();

var zipOut = new AdmZip();
zipOut.addLocalFolder(path.join(inFolder, "db"), "db");
zipOut.addLocalFolder(path.join(inFolder, "uploads"), "uploads");

zipOut.writeZip(outFile);
console.log("Done.");




