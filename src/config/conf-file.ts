import path from 'path';
const projectRootPath = path.resolve(__dirname, "../..");

export interface outputRobotsCsvRow {
    0: string,
    1: "OK" | "NG"
}
export type outputRobotsCsvFormat = outputRobotsCsvRow[];

export const inputCsvDirPath = path.join(projectRootPath, "file/input");
export const outputRobotsCsvDirPath = path.join(projectRootPath, "file/output-robots");
export const outputPickedTargetCsvDirPath = path.join(projectRootPath, "file/output-picked-target");