const winston = require("winston");
import {
  ElasticsearchTransport,
  ElasticsearchTransportOptions,
} from "winston-elasticsearch";
import * as internalIp from "internal-ip";
import { ILogger, ILoggerOptions } from "./types";

export function createLogger(options: ILoggerOptions): ILogger {
  const transformer = (logData: Record<string, any>) => {
    const fields = {
      env: options.env,
      ipv4: internalIp.v4.sync(),
      ipv6: internalIp.v6.sync(),
      service_name: options.service_name,
      service_version: options.service_version,
    };
    const transformed = {
      message: logData.message,
      severity: logData.level,
      fields: { ...logData.meta, ...fields },
      transaction: {},
      trace: {},
      span: {},
    };
    // @ts-ignore
    transformed["@timestamp"] = logData.timestamp || new Date().toISOString();
    const meta = logData.meta;
    if (meta.transaction?.id) {
      transformed.transaction = { id: meta.transaction?.id };
    }
    if (meta.trace?.id) {
      transformed.trace = { id: meta.trace?.id };
    }
    if (meta.span?.id) {
      transformed.span = { id: meta.span?.id };
    }
    return transformed;
  };

  const elasticSearchTransportOptions: ElasticsearchTransportOptions =
    options.elastic_search_options && {
      level: "info",
      clientOpts: {
        cloud: {
          id: options.elastic_search_options.cloud_id,
        },
        auth: {
          username: options.elastic_search_options.username,
          password: options.elastic_search_options.password,
        },
        node: options.elastic_search_options.url,
      },
      transformer,
    };

  const transports = [];
  if (options.console_logging) {
    transports.push(
      new winston.transports.Console({ format: winston.format.simple() })
    );
  }

  if (elasticSearchTransportOptions) {
    transports.push(new ElasticsearchTransport(elasticSearchTransportOptions));
  }

  const baseLogger = winston.createLogger({ transports });

  baseLogger.on('error', (error) => {
    console.error('Elastic search log error', error);
  });

  const log =
    (type: string) =>
    (...data: unknown[]) => {
      let args = Array.prototype.slice.call(data);
      args = args.map((value) => {
        return value instanceof Object ? JSON.stringify(value) : value;
      });
      const str = args.join(" ");
      baseLogger[type](str);
    };

  return {
    debug: log("debug"),
    info: log("info"),
    warn: log("warn"),
    error: log("error"),
  };
}
