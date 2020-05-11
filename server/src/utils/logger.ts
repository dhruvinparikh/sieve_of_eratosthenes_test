/**
 * The Logger.
 * Prints logs (errors only by default) on console and optionally
 * into a file.
 */
import * as Winston from "winston";

const logFileName = "server.log";
const logDestinations: Winston.LoggerOptions["transports"] =
  [
    // On Google Cloud Run the console output can go into Stackdriver
    // Logging that could be automatically exported to BigQuery
    new (Winston.transports.Console)(),
  ];

logDestinations.push(new (Winston.transports.File)({ filename: logFileName }));

export const logger = Winston.createLogger({
  format: Winston.format.json({ replacer: undefined, space: 3 }),
  level: "error",
  transports: logDestinations
});
