import { Dirent } from "fs";
import { opendir, rename } from "fs/promises";
import { removePdfFileSuffix } from "../remove-pdf-file-suffix";

jest.mock("fs/promises");

jest.mock("path", () => {
    return {
        ...jest.requireActual("path"),
        join() {
            return arguments[1];
        },
    };
});

afterEach(() => {
    jest.clearAllMocks();
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
        name: "mocked-pdf-file-apple_suffixzzzz.pdf",
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
    mockedPdfFile2: {
        name: "mocked-pdf-file-lemon_suffix2zzz.pdf",
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
    mockedPdfFileWhoseNameAAA: {
        name: "a_aaaaaaaaaa_suffixofaa.pdf",
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
    mockedPdfFileWhoseSuffixAAA: {
        name: "a_aaaaaaaaaa.pdf",
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
    mockedPdfFileWhoseNameAppleVer1: {
        name: "myapple_suffixaaaa.pdf",
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
    mockedPdfFileWhoseNameAppleVer2: {
        name: "myapple_suffixbbbb.pdf",
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
    mockedPdfFileWhoseNameAppleVer3: {
        name: "myapple_suffixcccc.pdf",
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

it("should disregard non-pdf files", async () => {
    jest.mocked(opendir).mockImplementationOnce(function* (path): any {
        yield storageMockedDirEnt.mockedSubDirectory;
        yield storageMockedDirEnt.mockedSymlink;
        yield storageMockedDirEnt.mockedTextFile;
        yield storageMockedDirEnt.mockedPdfFile;
    });
    const result = await removePdfFileSuffix();
    expect(result).toBeTruthy();
    expect(rename).toHaveBeenCalledTimes(1);
    expect(rename).toHaveBeenCalledWith(
        "mocked-pdf-file-apple_suffixzzzz.pdf",
        "mocked-pdf-file-apple.pdf"
    );
});
it("should remove suffix of the pdf file-s name", async () => {
    jest.mocked(opendir).mockImplementationOnce(function* (path): any {
        yield storageMockedDirEnt.mockedPdfFile;
        yield storageMockedDirEnt.mockedPdfFile2;
    });
    const result = await removePdfFileSuffix();
    expect(result).toBeTruthy();
    expect(rename).toHaveBeenCalledTimes(2);
    expect(rename).toHaveBeenNthCalledWith(
        1,
        "mocked-pdf-file-apple_suffixzzzz.pdf",
        "mocked-pdf-file-apple.pdf"
    );
    expect(rename).toHaveBeenNthCalledWith(
        2,
        "mocked-pdf-file-lemon_suffix2zzz.pdf",
        "mocked-pdf-file-lemon.pdf"
    );
});
it("should leave the name whose suffix-removed name already exists in target directory", async () => {
    jest.mocked(opendir).mockImplementationOnce(function* (path): any {
        yield storageMockedDirEnt.mockedPdfFileWhoseNameAAA;
        yield storageMockedDirEnt.mockedPdfFileWhoseSuffixAAA;
    });
    const result = await removePdfFileSuffix();
    expect(result).toBeTruthy();
    expect(rename).toHaveBeenCalledTimes(1);
    expect(rename).toHaveBeenCalledWith("a_aaaaaaaaaa.pdf", "a.pdf");
});

it("should leave the name whose suffix-removed name have been already processed", async () => {
    jest.mocked(opendir).mockImplementationOnce(function* (path): any {
        yield storageMockedDirEnt.mockedPdfFileWhoseNameAppleVer1;
        yield storageMockedDirEnt.mockedPdfFileWhoseNameAppleVer2;
        yield storageMockedDirEnt.mockedPdfFileWhoseNameAppleVer3;
    });
    const result = await removePdfFileSuffix();
    expect(result).toBeTruthy();
    expect(rename).toHaveBeenCalledTimes(1);
    expect(rename).toHaveBeenCalledWith(
        "myapple_suffixaaaa.pdf",
        "myapple.pdf"
    );
});
