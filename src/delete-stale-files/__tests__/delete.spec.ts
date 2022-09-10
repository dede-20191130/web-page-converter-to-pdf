import { opendir } from "fs/promises";
import path from "path";
import rimraf from "rimraf";
import * as DeleteStaleFiles from "../delete";

const gitIgnoreContent = `
/food
/beverage/tea
`;
jest.mock("fs", () => {
    return {
        ...jest.requireActual("fs"),
        readFileSync: jest.fn(() => {
            return gitIgnoreContent;
        }),
    };
});

jest.mock("fs/promises", () => {
    return {
        opendir: jest.fn(),
    };
});

jest.mock("rimraf");
jest.mocked(rimraf).mockImplementation((path, cb) => cb(null));

const storageMockedDirEntArr: { dir: string; ents: { name: string }[] }[] = [
    {
        dir: "food/chinese",
        ents: [{ name: "Peking-Roasted-Duck.txt" }],
    },
    {
        dir: "food/italian",
        ents: [{ name: "pizza.csv" }, { name: "pasta.dat" }],
    },
    {
        dir: "food/noodle",
        ents: [],
    },
    {
        dir: "beverage/tea/red-tea",
        ents: [
            { name: "spicy.xlsx" },
            { name: "tasty.xlsm" },
            { name: "mavellas.xlsm" },
        ],
    },
    {
        dir: "beverage/tea/yellow-tea",
        ents: [
            { name: "horrable.jpg" },
            { name: "stincky.png" },
            { name: "not-acceptable.gif" },
            { name: "too-hot.tiff" },
        ],
    },
];

let mockedOpenDir: jest.MockInstance<any, any> | null = null;

beforeEach(() => {});

afterEach(() => {
    if (mockedOpenDir) mockedOpenDir.mockReset();
});

let _DeleteStaleFiles: typeof DeleteStaleFiles;
describe("should filter out files managed by git", () => {
    beforeAll(() => {
        jest.isolateModules(async () => {
            jest.doMock("@config/conf-file", () => {
                return {
                    __esModule: true,
                    ...jest.requireActual("@config/conf-file"),
                    dirPathsHavingStale: [
                        "food/chinese/north-region",
                        "beverage/tea",
                        "vehicle/car",
                    ],
                };
            });
            _DeleteStaleFiles = await require("../delete");
        });
    });
    it("assertion", async () => {
        mockedOpenDir = jest.mocked(opendir).mockResolvedValue([] as any);
        const result = await _DeleteStaleFiles.deleteStaleFiles();
        expect(result).toBeTruthy();
        expect(mockedOpenDir).toHaveBeenCalledTimes(2);
        expect(
            mockedOpenDir.mock.calls.filter(
                (call) => call[0] === "food/chinese/north-region"
            )
        ).toHaveLength(1);
        expect(
            mockedOpenDir.mock.calls.filter(
                (call) => call[0] === "beverage/tea"
            )
        ).toHaveLength(1);
    });
});
describe("should delete all files in the directory specified by configuration", () => {
    beforeAll(() => {
        jest.isolateModules(async () => {
            jest.doMock("@config/conf-file", () => {
                return {
                    __esModule: true,
                    ...jest.requireActual("@config/conf-file"),
                    projectRootPath: "project-root-path",
                    dirPathsHavingStale: [
                        "food/chinese",
                        "food/italian",
                        "food/noodle",
                        "beverage/tea/red-tea",
                        "beverage/tea/yellow-tea",
                    ],
                };
            });
            _DeleteStaleFiles = await require("../delete");
        });
    });
    it("assertion", async () => {
        mockedOpenDir = jest
            .mocked(opendir)
            .mockImplementation(async function* (path, options): any {
                const ents = storageMockedDirEntArr.find(
                    (item) => item.dir === path
                )?.ents;
                if (!ents) return;

                for (const ent of ents) {
                    yield ent;
                }
            });
        const result = await _DeleteStaleFiles.deleteStaleFiles();
        expect(result).toBeTruthy();
        expect(rimraf).toHaveBeenCalledTimes(10);
        expect(
            jest
                .mocked(rimraf)
                .mock.calls.filter(
                    (call) =>
                        call[0] ===
                        [
                            "project-root-path",
                            "food",
                            "chinese",
                            "Peking-Roasted-Duck.txt",
                        ].join(path.sep)
                )
        ).toHaveLength(1);
        expect(
            jest
                .mocked(rimraf)
                .mock.calls.filter(
                    (call) =>
                        call[0] ===
                        [
                            "project-root-path",
                            "food",
                            "italian",
                            "pizza.csv",
                        ].join(path.sep)
                )
        ).toHaveLength(1);
        expect(
            jest
                .mocked(rimraf)
                .mock.calls.filter(
                    (call) =>
                        call[0] ===
                        [
                            "project-root-path",
                            "food",
                            "italian",
                            "pasta.dat",
                        ].join(path.sep)
                )
        ).toHaveLength(1);
        expect(
            jest
                .mocked(rimraf)
                .mock.calls.filter(
                    (call) =>
                        call[0] ===
                        [
                            "project-root-path",
                            "beverage",
                            "tea",
                            "red-tea",
                            "spicy.xlsx",
                        ].join(path.sep)
                )
        ).toHaveLength(1);
        expect(
            jest
                .mocked(rimraf)
                .mock.calls.filter(
                    (call) =>
                        call[0] ===
                        [
                            "project-root-path",
                            "beverage",
                            "tea",
                            "red-tea",
                            "tasty.xlsm",
                        ].join(path.sep)
                )
        ).toHaveLength(1);
        expect(
            jest
                .mocked(rimraf)
                .mock.calls.filter(
                    (call) =>
                        call[0] ===
                        [
                            "project-root-path",
                            "beverage",
                            "tea",
                            "red-tea",
                            "mavellas.xlsm",
                        ].join(path.sep)
                )
        ).toHaveLength(1);
        expect(
            jest
                .mocked(rimraf)
                .mock.calls.filter(
                    (call) =>
                        call[0] ===
                        [
                            "project-root-path",
                            "beverage",
                            "tea",
                            "yellow-tea",
                            "horrable.jpg",
                        ].join(path.sep)
                )
        ).toHaveLength(1);
        expect(
            jest
                .mocked(rimraf)
                .mock.calls.filter(
                    (call) =>
                        call[0] ===
                        [
                            "project-root-path",
                            "beverage",
                            "tea",
                            "yellow-tea",
                            "stincky.png",
                        ].join(path.sep)
                )
        ).toHaveLength(1);
        expect(
            jest
                .mocked(rimraf)
                .mock.calls.filter(
                    (call) =>
                        call[0] ===
                        [
                            "project-root-path",
                            "beverage",
                            "tea",
                            "yellow-tea",
                            "not-acceptable.gif",
                        ].join(path.sep)
                )
        ).toHaveLength(1);
        expect(
            jest
                .mocked(rimraf)
                .mock.calls.filter(
                    (call) =>
                        call[0] ===
                        [
                            "project-root-path",
                            "beverage",
                            "tea",
                            "yellow-tea",
                            "too-hot.tiff",
                        ].join(path.sep)
                )
        ).toHaveLength(1);
    });
});
