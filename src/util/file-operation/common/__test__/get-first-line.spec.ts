import path from 'path';
import { getFirstLine } from '../get-first-line';
const textTgtDir = path.join(__dirname, "test-file");

it('should not hang when reading empty file.', async () => {
    const line = await getFirstLine(path.join(textTgtDir, "empty-csv.csv"));
    expect(line).toBe("");

});
it('should get the first line of one-line text file.', async () => {
    const line = await getFirstLine(path.join(textTgtDir, "one-line-csv.csv"));
    expect(line).toBe("a,b,c,d");

});
it('should get the first line of multi-line text file.', async () => {
    const line = await getFirstLine(path.join(textTgtDir, "multi-line-csv.csv"));
    expect(line).toBe("a,b,c");

});