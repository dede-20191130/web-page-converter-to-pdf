import puppeteer, { Browser } from "puppeteer";

export async function launch() {
    return await puppeteer.launch({
        headless: true,
        args: [
            "--disable-gpu",
            "--no-first-run",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--no-zygote",
            // '--single-process',
            "--proxy-server='direct://'",
            "--proxy-bypass-list=*",
        ],
        timeout: 0,
        ignoreDefaultArgs: ["--disable-extensions"],
    });
}
