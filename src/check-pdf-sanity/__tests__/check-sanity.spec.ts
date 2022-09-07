import fs, { Dirent } from "fs";
import { opendir } from "fs/promises";
// @ts-ignore
import { loggerMock as untypedLoggerMock } from "../logging";
import { loggerMock as typedLoggerMock } from "../__mocks__/logging";
// @ts-ignore
import { mockWS as untypedMockWS } from "@util/file-operation/csv/write-into-csv";
import { mockWS as typedMockWS } from "@util/file-operation/csv/__mocks__/write-into-csv";
import { checkSanity } from "../check-sanity";

jest.mock<typeof fs>("fs", () => {
    return {
        ...jest.requireActual("fs"),
        readFileSync: jest.fn(),
    };
});
jest.mock("fs/promises");
jest.mock("@util/file-operation/csv/write-into-csv");
const mockWS = untypedMockWS as typeof typedMockWS;

jest.mock("../logging");
const loggerMock = untypedLoggerMock as typeof typedLoggerMock;

const mockedPDFDocumentLoad = jest.fn();
jest.mock("pdf-lib", () => {
    const mockedPDFDocument: jest.Mock & { load?: Function } = jest
        .fn()
        .mockImplementation(() => ({}));
    mockedPDFDocument.load = async () => {
        return mockedPDFDocumentLoad();
    };

    return {
        PDFDocument: mockedPDFDocument,
    };
});

const storageMockedDirEnt: { [p: string]: Partial<Dirent> } = {
    mockedSubDirectory: {
        name: "mocked-sub-directory",
        isFile() {
            return false;
        },
        isDirectory() {
            return true;
        },
        isSymbolicLink() {
            return false;
        },
    },
    mockedSymlink: {
        name: "mocked-symlink.lnk",
        isFile() {
            return true;
        },
        isDirectory() {
            return false;
        },
        isSymbolicLink() {
            return true;
        },
    },
    mockedTextFile: {
        name: "mocked-text-file.txt",
        isFile() {
            return true;
        },
        isDirectory() {
            return false;
        },
        isSymbolicLink() {
            return false;
        },
    },
    mockedPdfFile: {
        name: "mocked-pdf-file.pdf",
        isFile() {
            return true;
        },
        isDirectory() {
            return false;
        },
        isSymbolicLink() {
            return false;
        },
    },
};

beforeEach(() => {
    mockWS.erase();
});

afterEach(() => {
    jest.clearAllMocks();
});

it("should disregard non-pdf files", async () => {
    jest.mocked(opendir).mockImplementationOnce(function* (path): any {
        yield storageMockedDirEnt.mockedSubDirectory;
        yield storageMockedDirEnt.mockedSymlink;
        yield storageMockedDirEnt.mockedTextFile;
        yield storageMockedDirEnt.mockedPdfFile;
    });

    const result = await checkSanity();
    expect(result).toBeTruthy();
    expect(loggerMock.error).not.toHaveBeenCalled();
    const results = mockWS.expose();
    expect(results).toEqual(
        expect.arrayContaining([[storageMockedDirEnt.mockedPdfFile.name, "OK"]])
    );
    expect(results).toHaveLength(1);
});
it("should return true if all pdf are ok", async () => {
    jest.mocked(opendir).mockImplementationOnce(function* (path): any {
        yield storageMockedDirEnt.mockedPdfFile;
        yield storageMockedDirEnt.mockedPdfFile;
        yield storageMockedDirEnt.mockedPdfFile;
    });

    mockedPDFDocumentLoad
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(undefined);
    const result = await checkSanity();
    expect(result).toBeTruthy();
    expect(loggerMock.error).not.toHaveBeenCalled();
    const results = mockWS.expose();
    expect(results).toEqual(
        expect.arrayContaining([
            [storageMockedDirEnt.mockedPdfFile.name, "OK"],
            [storageMockedDirEnt.mockedPdfFile.name, "OK"],
            [storageMockedDirEnt.mockedPdfFile.name, "OK"],
        ])
    );
    expect(results).toHaveLength(3);
});
it("should raise a error when the pdf have been broken", async () => {
    jest.mocked(opendir).mockImplementationOnce(function* (path): any {
        yield storageMockedDirEnt.mockedPdfFile;
        yield storageMockedDirEnt.mockedPdfFile;
        yield storageMockedDirEnt.mockedPdfFile;
    });
    mockedPDFDocumentLoad
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(undefined)
        .mockImplementationOnce(() => {
            throw new Error(
                "should raise a error when the pdf have been broken"
            );
        });

    const result = await checkSanity();
    expect(result).toBeTruthy();
    expect(loggerMock.error).toHaveBeenCalledWith(
        "Error: should raise a error when the pdf have been broken"
    );
    const results = mockWS.expose();
    expect(results).toEqual(
        expect.arrayContaining([
            [storageMockedDirEnt.mockedPdfFile.name, "OK"],
            [storageMockedDirEnt.mockedPdfFile.name, "OK"],
            [storageMockedDirEnt.mockedPdfFile.name, "NG"],
        ])
    );
    expect(results).toHaveLength(3);
});
