import fs from 'fs';
import path from 'path';
export function getWSIntoCsv(dirPath: string, csvname: string) {
    return fs.createWriteStream(path.join(dirPath, csvname));
}