/**
 * @jest-environment ./src/test-util/correct-error-instanceof-env
 */

import { globFirstFilePathOfTgtExt } from "@util/file-operation/common/glob";
import { LeveledLogMethod } from "winston";
import { checkRobots } from "../check-robots";
import * as GetFirstLine from "@util/file-operation/common/get-first-line";
import fetch, { RequestInfo, RequestInit, Response } from "node-fetch";
import { getParsedAsStream } from "@util/file-operation/csv/get-parsed-as-stream";
import { Readable, Writable } from "stream";
import { parse } from 'csv-parse';

interface fetchFunc {
    (
        url: RequestInfo,
        init?: RequestInit
    ): Promise<Response>
};

const robotsTxtContent = `
User-agent: *
Allow: /foo
Allow: /bar
Disallow: /apple
Disallow: /lemon/*
Disallow: /*/grape
`
const txtListRequiredChecked = `https://example-robots/foo
https://example-robots/apple
https://example-robots/lemon/juice
https://example-robots/hokkaido/grape
`
let globFlag: "dir-for-missing" | "correct-dir";
let firstLine: "invalid-robots-url" | "https://example-not-found" | "https://example-robots" | "empty";

jest.mock("node-fetch", () => {
    return {
        __esModule: true,
        ...jest.requireActual("node-fetch"),
        default: (jest.fn() as jest.MockedFunction<fetchFunc>).mockImplementation(
            async (...args) => {
                switch (firstLine) {
                    case "https://example-not-found":
                        return new Response(undefined, { status: 404 });

                    case "https://example-robots":
                        return new Response(robotsTxtContent, { status: 200 });
                    default:
                        throw new Error("Wrong setting.")
                }
            }
        )
    }
})

jest.mock("@util/file-operation/common/glob", () => {
    return {
        __esModule: true,
        ...jest.requireActual("@util/file-operation/common/glob"),
        globFirstFilePathOfTgtExt: (jest.fn() as jest.MockedFunction<typeof globFirstFilePathOfTgtExt>).mockImplementation(
            (d, e) => {
                switch (globFlag) {
                    case "dir-for-missing":
                        return null;

                    case "correct-dir":
                        return "Drivename:/Username/target.csv";
                }
            }
        )
    }
});
jest.mock("@util/file-operation/common/get-first-line", () => {
    return {
        __esModule: true,
        ...jest.requireActual("@util/file-operation/common/get-first-line"),
        getFirstLine: (jest.fn() as jest.MockedFunction<typeof GetFirstLine.getFirstLine>).mockImplementation(
            async (p) => {
                switch (firstLine) {
                    case "empty":
                        return "";
                    default:
                        return firstLine;
                }
            }
        )
    }

});

let loggerMock = {
    info: jest.fn<void, Parameters<LeveledLogMethod>>(),
    error: jest.fn<void, Parameters<LeveledLogMethod>>(),
}
jest.mock("../logging", () => {
    return {
        __esModule: true,
        getLogger: jest.fn().mockImplementation(() => loggerMock)
    }

})

jest.mock("@util/file-operation/csv/get-parsed-as-stream", () => {
    return {
        __esModule: true,
        ...jest.requireActual("@util/file-operation/csv/get-parsed-as-stream"),
        getParsedAsStream: (jest.fn() as jest.MockedFunction<typeof getParsedAsStream>).mockImplementation(async (...args) => {
            return Readable.from(txtListRequiredChecked).pipe(parse());
        })
    }

});

class MockWriteStream extends Writable {
    private stored: string[][] = [];

    write(chunk: unknown, encoding?: unknown, callback?: unknown): boolean {
        this.stored.push((chunk + "").replace(/\n$/,"").split(","));
        return true;
    }

    expose() {
        return this.stored;
    }


}
const mockWS = new MockWriteStream();
jest.mock("@util/file-operation/csv/write-into-csv", () => {
    return {
        __esModule: true,
        ...jest.requireActual("@util/file-operation/csv/write-into-csv"),
        getWSIntoCsv: jest.fn<Writable, any>().mockImplementation((...args) => {
            return mockWS;
        })
    }

});



beforeEach(() => {
    globFlag = "correct-dir";
});

afterEach(() => {
    jest.clearAllMocks();
});

it('should detect input file is missing and terminate the process ', async () => {
    globFlag = "dir-for-missing";
    const spiedGFL = jest.spyOn(GetFirstLine, "getFirstLine");
    const resultCheckRobots = await checkRobots();
    expect(resultCheckRobots).toBeFalsy();
    expect(globFirstFilePathOfTgtExt).toHaveBeenCalled();
    expect(spiedGFL).not.toHaveBeenCalled();
    expect(loggerMock.info).toHaveBeenCalledWith("Input CSV is not set.");
});
it('should detect input file is empty and terminate the process ', async () => {
    firstLine = "empty";
    const spiedGFL = jest.spyOn(GetFirstLine, "getFirstLine");
    const spiedURL = jest.spyOn(globalThis, "URL");
    const resultCheckRobots = await checkRobots();
    expect(resultCheckRobots).toBeFalsy();
    expect(spiedGFL).toHaveBeenCalled();
    expect(loggerMock.info).toHaveBeenCalledWith("Target CSV is not of valid format.");
    expect(spiedURL).not.toHaveBeenCalled();
    spiedGFL.mockClear();
    spiedURL.mockRestore();
});
it('should detect target sites url is not valid and terminate the process ', async () => {
    firstLine = "invalid-robots-url";
    const resultCheckRobots = await checkRobots();
    expect(resultCheckRobots).toBeFalsy();
    expect(loggerMock.info).toHaveBeenCalledWith("Target CSV does not contain valid URL.");

});
it('should detect robots.txt is missing and terminate the process ', async () => {
    firstLine = "https://example-not-found";
    const resultCheckRobots = await checkRobots();
    expect(resultCheckRobots).toBeFalsy();
    expect(loggerMock.info).toHaveBeenCalledWith("There is no Robots.txt.");

});
it('should get an output csv and contain allowed pages and disallowed pages', async () => {
    firstLine = "https://example-robots";
    const resultCheckRobots = await checkRobots();
    expect(resultCheckRobots).toBeTruthy();
    expect(loggerMock.info).not.toHaveBeenCalled();
    const results = mockWS.expose();
    expect(results).toEqual(expect.arrayContaining(
        [["https://example-robots/foo", "OK"],
        ["https://example-robots/apple", "NG"],
        ["https://example-robots/lemon/juice", "NG"],
        ["https://example-robots/hokkaido/grape", "NG"]]
    ));
    expect(results).toHaveLength(4);
});