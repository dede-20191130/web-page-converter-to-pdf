import { setLogger as setLoggerCommon } from "@util/log/logging";
import { Logger, loggers } from "winston";

export const loggerId = "delete-stale-files";
let logger: Logger;

export function setLogger() {
    return setLoggerCommon(loggerId, loggerId);
}

export function getLogger() {
    if (!logger) logger = loggers.get(loggerId);
    return logger;
}
