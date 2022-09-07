import path from "path";
const projectRootPath = path.resolve(__dirname, "../..");

export type outputRobotsCsvRow = [string, "OK" | "NG"];
export type outputResultOfScrapingRow = [...outputRobotsCsvRow, string];
export type outputRobotsCsvFormat = outputRobotsCsvRow[];
export type outputResultOfScrapingFormat = outputResultOfScrapingRow[];

export const inputCsvDirPath = path.join(projectRootPath, "file/input");
export const outputRobotsCsvDirPath = path.join(
    projectRootPath,
    "file/output-robots"
);
export const outputPickedTargetCsvDirPath = path.join(
    projectRootPath,
    "file/output-picked-target"
);
export const outputResultOfScrapingDirPath = path.join(
    projectRootPath,
    "file/output-result-of-scraping"
);
export const createdPdfDirPath = path.join(projectRootPath, "file/created-pdf");
export const outputResultOfCheckingPdfSanity = path.join(
    projectRootPath,
    "file/output-result-of-pdf-sanity"
);
