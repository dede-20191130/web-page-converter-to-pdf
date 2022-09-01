import puppeteer, { Browser } from "puppeteer";

export async function launch(): Promise<Browser> {
    return await puppeteer.launch({
        headless: true,
        args: [
            "--proxy-server='direct://'",
            '--proxy-bypass-list=*'
        ],
        timeout:0
    });
}