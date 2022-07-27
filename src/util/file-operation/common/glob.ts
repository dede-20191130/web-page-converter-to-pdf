import { sync } from 'glob';
import path from 'path';

export function globFirstFilePathOfTgtExt(dirPath: string, ext: string) {
    const filePath: string | undefined = sync(path.join(dirPath, `*.${ext}`).replace(/\\/g, '/'), { nodir: true, absolute: true })[0];
    return filePath ? filePath : null;
}