import { format, loggers, transports } from "winston";
import path from 'path';

export const logDirectoryPath = "log";
const commonWarnLogFilePath = path.join(logDirectoryPath, "warnCommon.log");
const commonUncaughtLogFilePath = path.join(logDirectoryPath, "uncaughtCommon.log");

export function setLogger(loggerId: string, serviceId: string,
    warnFilename: string = commonWarnLogFilePath, uncaugthFilename: string = commonUncaughtLogFilePath) {
    return loggers.add(loggerId, {
        level: 'info',
        format: format.combine(
            format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }),
            format.errors({ stack: true }),
            format.splat(),
            format.json()
        ),
        defaultMeta: { service: serviceId },
        transports: [
            new transports.File({ filename: warnFilename, level: 'warn' }),
            new transports.Console({
                format: format.combine(
                    format.colorize(),
                    format.simple()
                )
            })
        ],
        exceptionHandlers: [
            new transports.File({ filename: uncaugthFilename })
        ],
        rejectionHandlers: [
            new transports.File({ filename: uncaugthFilename })
        ]
    })
}


