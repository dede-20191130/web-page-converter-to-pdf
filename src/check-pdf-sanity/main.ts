import { checkSanity } from "./check-sanity";
import { setLogger } from "./logging";
import { removePdfFileSuffix } from "./remove-pdf-file-suffix";

async function main() {
    const logger = setLogger();

    logger.info("Main Start.");

    await (async () => {
        if (!(await checkSanity())) return;
        if (!(await removePdfFileSuffix())) return;
    })();

    logger.info("Main End.");
}

main();
