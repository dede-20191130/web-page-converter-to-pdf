import path from "path";
export const projectRootPath = path.resolve(__dirname, "../..");

export type outputRobotsCsvRow = [string, "OK" | "NG"];
export type outputResultOfScrapingRow = [...outputRobotsCsvRow, string];
export type outputRobotsCsvFormat = outputRobotsCsvRow[];
export type outputResultOfScrapingFormat = outputResultOfScrapingRow[];

const inputCsvDirRelPath = "file/input";
export const inputCsvDirPath = path.join(projectRootPath, inputCsvDirRelPath);
const outputRobotsCsvDirRelPath = "file/output-robots";
export const outputRobotsCsvDirPath = path.join(
    projectRootPath,
    outputRobotsCsvDirRelPath
);
const outputPickedTargetCsvDirRelPath = "file/output-picked-target";
export const outputPickedTargetCsvDirPath = path.join(
    projectRootPath,
    outputPickedTargetCsvDirRelPath
);
const outputResultOfScrapingDirRelPath = "file/output-result-of-scraping";
export const outputResultOfScrapingDirPath = path.join(
    projectRootPath,
    outputResultOfScrapingDirRelPath
);
const createdPdfDirRelPath = "file/created-pdf";
export const createdPdfDirPath = path.join(
    projectRootPath,
    createdPdfDirRelPath
);
const outputResultOfCheckingPdfSanityRel = "file/output-result-of-pdf-sanity";
export const outputResultOfCheckingPdfSanity = path.join(
    projectRootPath,
    outputResultOfCheckingPdfSanityRel
);

export const dirPathsHavingStale: string[] = [
    inputCsvDirRelPath,
    outputRobotsCsvDirRelPath,
    outputPickedTargetCsvDirRelPath,
    outputResultOfScrapingDirRelPath,
    createdPdfDirRelPath,
    outputResultOfCheckingPdfSanityRel,
];
