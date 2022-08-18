import { Writable } from 'stream';
import * as _WriteIntoCsv from '../write-into-csv';

const writeIntoCsv = jest.createMockFromModule<typeof _WriteIntoCsv>("../write-into-csv");

class MockWriteStream extends Writable {
    private stored: string[][] = [];

    write(chunk: unknown, encoding?: unknown, callback?: unknown): boolean {
        this.stored.push((chunk + "").replace(/\n$/, "").split(","));
        return true;
    }

    expose() {
        return this.stored;
    }

    erase() {
        this.stored.splice(0, this.stored.length);
    }


}
export const mockWS = new MockWriteStream();

writeIntoCsv.getWSIntoCsv = jest.fn<any, any>().mockImplementation((...args) => {
    return mockWS;
})

export const getWSIntoCsv = writeIntoCsv.getWSIntoCsv;