#!/usr/bin/env node
import {Command} from 'commander';
import {translate} from "./main";

const program = new Command();

program
    .version('0.0.2')
    .name('fy')
    .usage('<English>')
    .argument('<English>', 'input English words')
    .action((word) => {
        translate(word);
    });


program.parse(process.argv);
