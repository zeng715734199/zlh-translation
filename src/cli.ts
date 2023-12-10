import {Command} from 'commander';
import {translate} from "./main";

const program = new Command();

program
    .version('0.0.2')
    .name('fy')
    .usage('<English>')
    .argument('<English>', 'input English words')
    .action((word) => {   //word 就是命令 ts-node-dev src/cli.ts hello 中的hello
        translate(word);
    });


program.parse(process.argv);
