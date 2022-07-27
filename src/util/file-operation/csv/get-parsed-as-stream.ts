import fs from 'fs';
import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';

export async function getParsedAsStream(csvPath: string) {
    return fs.createReadStream(csvPath).pipe(parse())
}

export function getStringifier() {
    return stringify({ delimiter: "," });
}