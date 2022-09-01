import { createPdf} from "./create-pdf";
import { setLogger } from "./logging";

async function main() {
    const logger = setLogger();

    logger.info("Main Start.");

    await (async () => {
        if (!(await createPdf())) return;
    })();

    logger.info("Main End.");
}

main();