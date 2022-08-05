import { pathsToModuleNameMapper } from 'ts-jest';
// import { compilerOptions } from './tsconfig.json';
import { parse } from 'json5';
import type { Config } from '@jest/types';
import { readFileSync } from 'fs';

const { compilerOptions } = parse(readFileSync("./tsconfig.json").toString());

const config: Config.InitialOptions = {
    roots: [
        "<rootDir>/src"
    ],
    preset: "ts-jest",
    moduleFileExtensions: [
        "ts",
        "js"
    ],
    transform: {
        "^.+\\.ts$": "ts-jest"
    },
    globals: {
        "ts-jest": {
            "tsconfig": "tsconfig.json"
        }
    },
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths , { prefix: '<rootDir>/' } )

};

module.exports = config;
