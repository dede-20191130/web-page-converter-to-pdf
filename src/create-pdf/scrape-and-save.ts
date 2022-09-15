import type { Browser, Page } from "puppeteer";
import { TimeoutError } from "puppeteer";
import { getLogger } from "./logging";
import path from "path";
import sanitize from "sanitize-filename";
import RequestSetting from "@config/request-setting";
import { createdPdfDirPath } from "@config/conf-file";
import { generateRandomKey } from "@util/crypto/generate-random-key";
import { waitForTimeout } from "@util/async/wait";

export type STATUS =
    | "CREATE-PDF-SUCCESSFULLY"
    | "FAILED-TO-OPEN-PROPERLY"
    | "FAILED-BY-TIMEOUT-ERROR";

export async function scrapeAndSave(
    tgtUrl: string,
    browser: Browser
): Promise<STATUS> {
    let page: Page | null = null;
    try {
        page = await browser.newPage();
        page.setDefaultNavigationTimeout(0);
        const res = await page.goto(tgtUrl, {
            waitUntil: ["load", "networkidle2"],
        });
        if (res) {
            if (
                res.status() < 200 ||
                res.status() > 399 ||
                res.request().redirectChain().length > 0
            ) {
                getLogger().warn(
                    "The page of %s failed to open properly",
                    tgtUrl
                );
                return "FAILED-TO-OPEN-PROPERLY";
            }
        }
        await waitForTimeout(2000);
        const pageName = await page.title();
        await page.pdf({
            path: path.join(
                createdPdfDirPath,
                `${sanitize(pageName)}_${generateRandomKey()}.pdf`
            ),
            format: RequestSetting.printFormat,
            printBackground: true,
        });
    } catch (e) {
        if (e instanceof TimeoutError) {
            getLogger().error(e);
            return "FAILED-BY-TIMEOUT-ERROR";
        } else {
            throw e;
        }
    } finally {
        if (page) await page.close();
    }
    return "CREATE-PDF-SUCCESSFULLY";
}
