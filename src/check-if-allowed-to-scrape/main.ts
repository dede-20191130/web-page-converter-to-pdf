import { checkRobots } from "./check-robots";
import { setLogger } from "./logging";

async function main() {
    const logger = setLogger();

    logger.info("Main Start.");

    await checkRobots();

    logger.info("Main End.");
}

main();