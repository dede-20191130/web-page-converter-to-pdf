import { outputPickedTargetCsvDirPath, outputRobotsCsvDirPath, outputRobotsCsvRow } from "@config/conf-file";
import { globFirstFilePathOfTgtExt } from "@util/file-operation/common/glob";
import { getParsedAsStream, getStringifier } from "@util/file-operation/csv/get-parsed-as-stream";
import { getWSIntoCsv } from "@util/file-operation/csv/write-into-csv";
import { getLogger } from "./logging";
import { transform } from 'csv';
import { finished } from "stream/promises";


function isGoodRow(record: outputRobotsCsvRow): boolean {
    if (record[1] === "NG") return false;
    return true;
}

export async function pickTarget(): Promise<Boolean> {
    const tgtCsvPath = globFirstFilePathOfTgtExt(outputRobotsCsvDirPath, "csv");
    if (!tgtCsvPath) {
        getLogger().info("Input CSV is not set.");
        return false;
    }

    const csvParser = getParsedAsStream(tgtCsvPath);
    const transformer = transform((record: outputRobotsCsvRow) => {
        return isGoodRow(record) ? record : null;
    })
    const csvStringifier = getStringifier();
    const csvWriter = getWSIntoCsv(outputPickedTargetCsvDirPath, "picked-target-output.csv");

    csvParser.pipe(transformer).pipe(csvStringifier).pipe(csvWriter);

    await finished(csvWriter);

    return true;

}