import {parse} from 'csv';
import * as Glob from "@util/file-operation/common/glob";
import {getParsedAsStream} from "@util/file-operation/csv/get-parsed-as-stream";
import { pickTarget } from "../pick-target";
// @ts-ignore
import { loggerMock } from '../logging';
// @ts-ignore
import { mockWS as untypedMockWS } from '@util/file-operation/csv/write-into-csv';
import { mockWS as typedMockWS } from '@util/file-operation/csv/__mocks__/write-into-csv';
import { Readable } from "stream";


const mockWS = untypedMockWS as typeof typedMockWS;

const setOfDummyCsvRows: { testname: string, body: string, expectedOutput: string[][], expectedRowNum: number }[] = [
    {
        testname: "for empty csv",
        body: "",
        expectedOutput: [],
        expectedRowNum: 0
    },
    {
        testname: "for only OK row csv",
        body: `https://example-robots/foo,OK
https://example-robots/bar,OK
https://example-robots/baz,OK`,
        expectedOutput: [
            ["https://example-robots/foo", "OK"],
            ["https://example-robots/bar", "OK"],
            ["https://example-robots/baz", "OK"],
        ],
        expectedRowNum: 3
    },
    {
        testname: "for only NG row csv",
        body: `https://example-robots/foo,NG
https://example-robots/bar,NG
https://example-robots/baz,NG`,
        expectedOutput: [],
        expectedRowNum: 0
    },
    {
        testname: "for mixture row csv",
        body: `https://example-robots/foo,NG
https://example-robots/bar,OK
https://example-robots/baz,OK
https://example-robots/dog,NG
https://example-robots/cat,NG
https://example-robots/horse,OK
https://example-robots/cow,OK`,
        expectedOutput: [
            ["https://example-robots/bar", "OK"],
            ["https://example-robots/baz", "OK"],
            ["https://example-robots/horse", "OK"],
            ["https://example-robots/cow", "OK"],
        ],
        expectedRowNum: 4
    },
]

jest.mock("../logging");
jest.mock("@util/file-operation/common/glob");
jest.mock("@util/file-operation/csv/write-into-csv");

jest.mock("@util/file-operation/csv/get-parsed-as-stream", () => {
    return {
        __esModule: true,
        ...jest.requireActual("@util/file-operation/csv/get-parsed-as-stream"),
        getParsedAsStream: jest.fn()
    }

});

afterEach(() => {
    jest.clearAllMocks();
});

it('should detect input file is missing and terminate the process ', async () => {
    jest.mocked(Glob.globFirstFilePathOfTgtExt).mockReturnValueOnce(null);
    const resultPicking = await pickTarget();
    expect(resultPicking).toBeFalsy();
    expect(loggerMock.info).toHaveBeenCalledWith("Input CSV is not set.");
})

describe('filtering the url list correctly', () => {

beforeAll(() => {
    jest.mocked(Glob.globFirstFilePathOfTgtExt).mockReturnValue("Not-empty-file-path");
    
});

    beforeEach(() => {
mockWS.erase();
    });

    it.each(setOfDummyCsvRows)(
        'the case $testname',
        async ({ testname, body, expectedOutput, expectedRowNum }) => {
            jest.mocked(getParsedAsStream).mockImplementationOnce((...args) => {
                return Readable.from(body).pipe(parse());
            })
            const resultPicking = await pickTarget();
    expect(resultPicking).toBeTruthy();
    expect(loggerMock.info).not.toHaveBeenCalled();
    const results = mockWS.expose();
    expect(results).toEqual(expect.arrayContaining(expectedOutput));
    expect(results).toHaveLength(expectedRowNum);
        }
    );

});
