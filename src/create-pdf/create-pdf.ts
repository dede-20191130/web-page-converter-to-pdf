import type {
    outputResultOfScrapingRow,
    outputRobotsCsvRow,
} from "@config/conf-file";
import type { Browser } from "puppeteer";
import type { HandlerCallback } from "stream-transform";
import {
    outputPickedTargetCsvDirPath,
    outputResultOfScrapingDirPath,
} from "@config/conf-file";

import { globFirstFilePathOfTgtExt } from "@util/file-operation/common/glob";
import {
    getParsedAsStream,
    getStringifier,
} from "@util/file-operation/csv/get-parsed-as-stream";
import { getWSIntoCsv } from "@util/file-operation/csv/write-into-csv";
import { finished } from "stream/promises";
import { getLogger } from "./logging";
import { transform } from "csv";
import { scrapeAndSave } from "./scrape-and-save";
import { launch } from "@util/scraping/browser";

export async function createPdf(): Promise<boolean> {
    const tgtCsvPath = globFirstFilePathOfTgtExt(
        outputPickedTargetCsvDirPath,
        "csv"
    );
    if (!tgtCsvPath) {
        getLogger().info("Input CSV is not set.");
        return false;
    }

    let browser: Browser | null = null;
    try {
        browser = await launch();
        const csvParser = getParsedAsStream(tgtCsvPath);
        const transformer = transform<outputRobotsCsvRow, unknown>(
            async (
                record,
                callback: HandlerCallback<outputResultOfScrapingRow>
            ) => {
                if (browser === null)
                    throw new TypeError("Browser is unintentionally null.");
                const scrapingResult = await scrapeAndSave(record[0], browser);
                callback(null, [...record, scrapingResult]);
            }
        );
        const csvStringifier = getStringifier();
        const csvWriter = getWSIntoCsv(
            outputResultOfScrapingDirPath,
            "scraping-result-output.csv"
        );

        csvParser.pipe(transformer).pipe(csvStringifier).pipe(csvWriter);

        await finished(csvWriter);
    } catch (error) {
        throw error;
    } finally {
        if (browser) await browser.close();
    }

    return true;
}
