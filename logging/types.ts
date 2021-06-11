export interface ILogger {
    debug(...args);
    info(...args);
    warn(...args);
    error(...args);     
}

export interface ILoggerOptions {
    env: string;
    service_name: string;
    service_version?: string;
    elastic_search_options?: {
        cloud_id: string;
        username: string;
        password: string;
        url: string;
    },
    console_logging: boolean;
}