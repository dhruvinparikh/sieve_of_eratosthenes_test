/*
  Construct class MathController to handle Express API route(s).
*/
import * as express from "express";
import { MathModel, MathModelConfig } from "../models/MathModel";
import {
  MathRequest,
  MathMedianResult,
  JsonParsingError,
} from "../types/MathTypes";
import { CustomError, isError, isCustomError } from "../../utils/error";

const jsonParser = express.json({
  inflate: true,
  limit: "1kb",
  strict: true,
  type: "application/json",
});

/*
  API route handler class
*/
export class MathController {
  static readonly addRoute = (app: express.Application): void => {
    app.get(
      MathRequest.MedianPath,
      jsonParser,
      (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        try {
          // Once-off configuration
          if (!MathController.s_configSet) {
            const config = new MathModelConfig();
            MathModel.Config = config;
            MathController.s_configSet = true;
          }

          // Request related error handling
          const errInfo: JsonParsingError = { message: undefined };
          const mathRequest = MathRequest.fromJSON(req.query, req.ip, errInfo);
          if (!mathRequest) {
            const err = new CustomError(
              400,
              MathController.s_ErrMsgParams,
              true
            );
            err.unobscuredMessage = `Invalid request from ${req.ip} with hostname ${req.hostname} using path ${req.originalUrl}. `;
            !!errInfo.message && (err.unobscuredMessage += errInfo.message);
            return next(err);
          }

          // Ask the static factory to create an instance of the model
          // and use it to get the data
          const model = MathModel.Factory;
          model.fetch(mathRequest);
          const data = model.MedianData;
          // Response related error handling
          if (data instanceof Error) {
            if (isCustomError(data)) {
              return next(data as CustomError);
            }

            const error = new CustomError(
              500,
              MathController.s_ErrMsgSample,
              true,
              true
            );
            // Can only be set to "<no data>" if code is incorrectly modified
            error.unobscuredMessage = (data as Error).message ?? "<no data>";
            return next(error);
          } else {
            res.status(200).json(data as MathMedianResult);
          }
        } catch (err) {
          if (isCustomError(err)) {
            return next(err);
          }
          const error = new CustomError(
            500,
            MathController.s_ErrMsgSample,
            true,
            true
          );
          const errMsg: string = isError(err)
            ? err.message
            : "Exception: <" +
              Object.keys(err)
                .map((key) => `${key}: ${err[key] ?? "no data"}`)
                .join("\n") +
              ">";
          error.unobscuredMessage = errMsg;
          return next(error);
        }
      }
    );
  };

  /********************** private data ************************/

  private static s_configSet = false;
  private static readonly s_ErrMsgSample =
    "Could not query Math API. Please retry later. If the problem persists contact Support";
  private static readonly s_ErrMsgParams =
    "Invalid data retrieval parameter(s). Please notify Support";
}
