/*
  The implementation of low level fetchAdapter() function.
  Provides extended error handling.
*/
import { isError, isDOMException } from "./typeguards";
import { CustomError } from "./error";

export interface IFetch {
  targetPath: string;
  method: "POST" | "GET";
  isJson?: boolean;
  body?: string;
  query?: string;
  abortSignal: AbortSignal;
  successHandler: (data: any) => void;
  errorHandler: (err: CustomError) => void;
  // User oriented error message for resp.ok === false
  errorMessage?: string;
  // User oriented error message for no response due to exception
  exceptionMessage?: string;
  // An additional suggestion to the above e.g. to imply the
  // exception is network related.
  exceptionExtraMessageNetwork?: string;
}

export const fetchAdapter = async (props: IFetch) => {
  let isResponseJson: boolean | undefined;
  let isResponseText: boolean | undefined;
  let isResponseOk: boolean | undefined;
  let responseStatus: number | undefined;

  await fetch(props.targetPath, {
    credentials: "same-origin",
    method: props.method,
    mode: "same-origin",
    ...(props.isJson && { headers: { "Content-Type": "application/json" } }),
    signal: props.abortSignal,
    ...(props.body && { body: props.body }),
  })
    .then((resp) => {
      const contentType = resp.headers.get("Content-Type");
      isResponseJson = contentType?.includes("application/json") ? true : false;
      isResponseText =
        contentType?.includes("text/plain") ||
        contentType?.includes("text/html")
          ? true
          : false;
      const ret = isResponseJson ? resp.json() : resp.text();
      isResponseOk = resp.ok;
      responseStatus = resp.status;
      return ret;
    })
    .then((respData) => {
      if (isResponseOk) {
        props.successHandler(respData);
      } else {
        let errMsg =
          props.errorMessage ?? "Could not get data from the backend.";
        if (
          isResponseText === true &&
          isResponseJson === false &&
          responseStatus &&
          responseStatus >= 400
        ) {
          errMsg += ` Error: ${respData}`;
        }
        const detailMsg = `Fetch error ${responseStatus} for URL ${props.targetPath}, details: ${respData}`;
        props.errorHandler(new CustomError(errMsg, detailMsg));
      }
    })
    .catch((err: any) => {
      if (isDOMException(err)) {
        if (err.code === 20 || err.name === "AbortError") {
          props.errorHandler(
            new CustomError(
              "Data retrieval in progress failed due to user initiated cancellation",
              `Fetch aborted for URL ${props.targetPath}`
            )
          );
        } else {
          props.errorHandler(
            new CustomError(
              `Data retrieval failure due to exception: ${err.message}`,
              `DOMException for URL ${props.targetPath}: code ${err.code}, name ${err.name}, message ${err.message}`
            )
          );
        }
      } else {
        let errMsg =
          props.exceptionMessage ?? "Failed to get data from the backend.";
        if (isResponseOk === undefined) {
          errMsg +=
            props.exceptionExtraMessageNetwork ??
            " Please check the Internet connection.";
          const detailMsg = `Fetch exception for URL ${props.targetPath} likely due to network connectivity`;
          props.errorHandler(new CustomError(err, detailMsg));
        } else {
          let detailMsg: string;
          if (isError(err)) {
            detailMsg = `Fetch exception for URL ${
              props.targetPath
            }, details: ${err.message ?? "<undefined>"}`;
          } else {
            const msg = Object.getOwnPropertyNames(err)
              .map((key) => `${key}: ${err[key] ?? "no data"}`)
              .join("\n");
            detailMsg = `Fetch exception for URL ${props.targetPath}, details: ${msg}`;
          }
          props.errorHandler(new CustomError(errMsg, detailMsg));
        }
      }
    });
};
