/**
 * @jest-environment ./src/test-util/correct-error-instanceof-env
 */
import {
    createdPdfDirPath,
    outputResultOfCheckingPdfSanity,
} from "@config/conf-file";
import { Dirent, readFileSync } from "fs";
import { opendir } from "fs/promises";
import { Readable, Transform } from "stream";
import path from "path";
import { getLogger } from "./logging";
import { getWSIntoCsv } from "@util/file-operation/csv/write-into-csv";
import { finished } from "stream/promises";
import { PDFDocument } from "pdf-lib";
import { getStringifier } from "@util/file-operation/csv/get-parsed-as-stream";
import { isPdf } from "@util/file-operation/pdf/check-if-pdf";

export async function checkSanity(): Promise<boolean> {
    const pdfStorage = await opendir(createdPdfDirPath, { bufferSize: 4 });
    const readable = Readable.from(pdfStorage, {
        objectMode: true,
    });
    const pdfFilter = new Transform({
        objectMode: true,
        transform(this, dirent: Dirent, encoding, callback) {
            if (isPdf(dirent)) {
                callback(null, dirent.name);
            } else {
                callback();
            }
        },
    });
    const pdfCheckingReturner = new Transform({
        objectMode: true,
        transform(this, filename: string, encoding, callback) {
            (async () => {
                let isError = false;
                try {
                    const pdfPath = path.join(createdPdfDirPath, filename);
                    await PDFDocument.load(readFileSync(pdfPath), {
                        updateMetadata: false,
                    });
                } catch (error) {
                    isError = true;
                    if (error instanceof Error) {
                        getLogger().error(error.toString());
                        callback(null, [filename, "NG"]);
                    } else {
                        throw new Error(String(error));
                    }
                } finally {
                    if (!isError) callback(null, [filename, "OK"]);
                }
            })();
        },
    });
    const csvStringifier = getStringifier();
    const csvWriter = getWSIntoCsv(
        outputResultOfCheckingPdfSanity,
        "pdf-sanity-output.csv"
    );

    readable
        .pipe(pdfFilter)
        .pipe(pdfCheckingReturner)
        .pipe(csvStringifier)
        .pipe(csvWriter);

    await finished(csvWriter);

    return true;
}
