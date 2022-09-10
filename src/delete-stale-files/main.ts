import { deleteStaleFiles } from "./delete";
import { setLogger } from "./logging";

async function main() {
    const logger = setLogger();

    logger.info("Main Start.");

    await (async () => {
        if (!(await deleteStaleFiles())) return;
    })();

    logger.info("Main End.");
}

main();
