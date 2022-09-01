import type puppeteer  from "puppeteer";
import * as Glob from "@util/file-operation/common/glob";
import { createPdf } from "../create-pdf";
// @ts-ignore
import { loggerMock as untypedLoggerMock } from '../logging';
import { loggerMock as typedLoggerMock } from '../__mocks__/logging';
import { parse } from 'csv';
// @ts-ignore
import { mockWS as untypedMockWS } from '@util/file-operation/csv/write-into-csv';
import { mockWS as typedMockWS } from '@util/file-operation/csv/__mocks__/write-into-csv';
import { Readable } from "stream";

const txtTest="TEST-OF-'CREATE-PDF'";

jest.mock<Record<keyof Partial<typeof puppeteer>,any>>("puppeteer", () => {
    return {
        ...jest.requireActual("puppeteer"),
        launch:jest.fn().mockResolvedValue({
            close:jest.fn()
        })
    }
});

jest.mock("../logging");
const loggerMock = untypedLoggerMock as typeof typedLoggerMock;

jest.mock("@util/file-operation/common/glob");
jest.mock("@util/file-operation/csv/write-into-csv");

const mockWS = untypedMockWS as typeof typedMockWS;

const body = `https://example-robots/foo,OK
https://example-robots/bar,OK
https://example-robots/baz,OK`
const expectedOutput=[
    ["https://example-robots/foo", "OK",txtTest],
    ["https://example-robots/bar", "OK",txtTest],
    ["https://example-robots/baz", "OK",txtTest],
]

jest.mock("@util/file-operation/csv/get-parsed-as-stream", () => {
    return {
        __esModule: true,
        ...jest.requireActual("@util/file-operation/csv/get-parsed-as-stream"),
        getParsedAsStream: jest.fn().mockImplementation(()=>Readable.from(body).pipe(parse()))
    }

});

jest.mock("../scrape-and-save", () => {
    return {
        __esModule: true,
        ...jest.requireActual("../scrape-and-save"),
        scrapeAndSave: jest.fn().mockImplementation(async()=>txtTest)
    }
})

beforeEach(() => {
    mockWS.erase();
        });

afterEach(() => {
    jest.clearAllMocks();
});

it('should detect input file is missing and terminate the process ', async () => {
    jest.mocked(Glob.globFirstFilePathOfTgtExt).mockReturnValueOnce(null);
    const resultPdfCreation = await createPdf();
    expect(resultPdfCreation).toBeFalsy();
    expect(loggerMock.info).toHaveBeenCalledWith("Input CSV is not set.");
})
it('should record result of rows ', async () => {
    jest.mocked(Glob.globFirstFilePathOfTgtExt).mockReturnValueOnce("Not-empty-file-path");
    const resultPdfCreation = await createPdf();
    expect(resultPdfCreation).toBeTruthy();
    expect(loggerMock.info).not.toHaveBeenCalled();
    const results = mockWS.expose();
    expect(results).toEqual(expect.arrayContaining(expectedOutput));
    expect(results).toHaveLength(expectedOutput.length);
})