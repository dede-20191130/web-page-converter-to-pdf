import path from 'path';
import { globFirstFilePathOfTgtExt } from '../glob';

const textTgtDir = path.join(__dirname, "test-file");
const extcsv = "csv";
const extnotexistext = "notexistext";

it('should get the first file path specified in arguments', () => {
    const globedPath = globFirstFilePathOfTgtExt(textTgtDir, extcsv) as string;
    expect(path.extname(globedPath).slice(1)).toBe(extcsv);
});
it('should get the absolute file path', () => {
    const globedPath = globFirstFilePathOfTgtExt(textTgtDir, extcsv) as string;
    expect(path.isAbsolute(globedPath)).toBeTruthy();
});
it('should get null when no file of specified extension exests in the directory', () => {
    const globedPath = globFirstFilePathOfTgtExt(textTgtDir, extnotexistext);
    expect(globedPath).toBeNull();

});