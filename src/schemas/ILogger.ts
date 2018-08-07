
export interface ILogger {
    log: LogMethod
    error: LeveledLogMethod;
    warn: LeveledLogMethod;
    help: LeveledLogMethod;
    data: LeveledLogMethod;
    info: LeveledLogMethod;
    debug: LeveledLogMethod;

    add(transport: any): ILogger;
    remove(transport: any): ILogger;
    clear(): ILogger;
    close(): ILogger;
}

interface LogMethod {
    (level: string, message: string, callback: LogCallback): ILogger;
    (level: string, message: string, meta: any, callback: LogCallback): ILogger;
    (level: string, message: string, ...meta: any[]): ILogger;
    (entry: LogEntry): ILogger;
}

type LogCallback = (error?: any, level?: string, message?: string, meta?: any) => void;

interface LogEntry {
    level: string;
    message: string;
    [optionName: string]: any;
}

interface LeveledLogMethod {
    (message: string, callback: LogCallback): ILogger;
    (message: string, meta: any, callback: LogCallback): ILogger;
    (message: string, ...meta: any[]): ILogger;
    (infoObject: object): ILogger;
}
