import { checkRobots } from "./check-robots";
import { setLogger } from "./logging";
import { pickTarget } from "./pick-target";

async function main() {
    const logger = setLogger();

    logger.info("Main Start.");

    await (async () => {
        if (!(await checkRobots())) return;
        if (!(await pickTarget())) return;
    })();

    logger.info("Main End.");
}

main();