import * as _Logging from "../logging";
import { LeveledLogMethod } from "winston";

const Logging = jest.createMockFromModule<typeof _Logging>("../logging");
const ActualLogging = jest.requireActual<typeof _Logging>("../logging");

export let loggerMock = {
    info: jest.fn<void, Parameters<LeveledLogMethod>>(),
    error: jest.fn<void, Parameters<LeveledLogMethod>>(),
}

Logging.getLogger = jest.fn().mockImplementation(() => loggerMock);

export const getLogger = Logging.getLogger;
export const setLogger = ActualLogging.setLogger;
export let loggerId = ActualLogging.loggerId;
