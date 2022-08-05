import { inputCsvDirPath, outputRobotsCsvDirPath } from "@config/conf-file";
import { getFirstLine } from "@util/file-operation/common/get-first-line";
import { globFirstFilePathOfTgtExt } from "@util/file-operation/common/glob";
import { getLogger } from "./logging";
import fetch, { FetchError } from 'node-fetch';
import robotsParser, { Robot } from "robots-parser";
import { getParsedAsStream, getStringifier } from "@util/file-operation/csv/get-parsed-as-stream";
import { getWSIntoCsv } from "@util/file-operation/csv/write-into-csv";
import { finished } from "stream/promises";

async function fetchRobots(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) return "";
    const txt = await response.text();
    return txt;
}

async function checkOneRecord(record: any[], robot: Robot) {
    const okOrNg = robot.isAllowed(record[0]) ? "OK" : "NG";
    return [...record, okOrNg];
}

export async function checkRobots(): Promise<Boolean> {
    const tgtCsvPath = globFirstFilePathOfTgtExt(inputCsvDirPath, "csv");
    if (!tgtCsvPath) {
        getLogger().info("Input CSV is not set.");
        return false;
    }

    const firstLine = await getFirstLine(tgtCsvPath);
    if (!firstLine) {
        getLogger().info("Target CSV is not of valid format.");
        return false;
    }

    let originURL: string | undefined;
    let robotsTxtUrl: string | undefined;
    let robotsTxt;
    try {
        originURL = new URL(firstLine.trim()).origin;
        robotsTxtUrl = `${originURL}/robots.txt`;
        robotsTxt = await fetchRobots(robotsTxtUrl);
    } catch (error) {
        if (error instanceof Error) {
            if (error instanceof TypeError) {
                getLogger().info("Target CSV does not contain valid URL.");
            } else if (error.name === 'AbortError' || error instanceof FetchError) {
                getLogger().error("Robots.txt of URL %s access failed.", (robotsTxtUrl ? robotsTxtUrl : ""));
            }
            else {
                throw error;
            }
            return false;
        } else {
            throw new Error(String(error));
        }
    }
    if (!robotsTxt) {
        getLogger().info("There is no Robots.txt.");
        return false;
    }

    const tgtRobot = robotsParser(robotsTxtUrl, robotsTxt);
    const csvParser = await getParsedAsStream(tgtCsvPath);
    const csvStringifier = getStringifier();
    const csvWriter = getWSIntoCsv(outputRobotsCsvDirPath, "robots-output.csv");
    csvStringifier.pipe(csvWriter);

    for await (let record of csvParser) {
        if (!Array.isArray(record)) record = [String(record)];
        const checkedRecord = await checkOneRecord(record, tgtRobot);
        csvStringifier.write(checkedRecord);
    }
    csvWriter.end();

    await finished(csvWriter);

    return true;
}