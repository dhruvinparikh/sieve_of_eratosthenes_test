/*
  BackendManager calls the API endpoint exposed by the backend.
*/
import { fetchAdapter, IFetch } from "../utils/fetch";
import { CustomError } from "../utils/error";
import { isError, isCustomError, isString } from "../utils/typeguards";
import {
  IBackendMedianRequestData,
  MedianBackendRequest,
} from "./BackendRequest";
import {
  IMathMedianData,
  MathMedianRetrieval,
  MathMedianResult,
  MathRequest,
} from "@backend/types/MathTypes";

export {
  MathMedianRetrieval,
  MathMedianResult,
};

// Extend data storage interface and add data fetching capability.
interface IMathBackendClient extends IMathMedianData {
  readonly fetch: (request: IBackendMedianRequestData) => Promise<boolean>;
}

export class MathBackendManager implements IMathBackendClient {
  constructor(signal: AbortSignal) {
    this.m_signal = signal;
  }

  get MedianData(): MathMedianRetrieval {
    return this.m_queryResult;
  }

  public readonly fetch = async (
    request: IBackendMedianRequestData
  ): Promise<boolean> => {
    try {
      this.m_queryParams = new MedianBackendRequest(request);
      await this.fetchData();
    } catch (err) {
      if (isError(err)) {
        this.m_queryResult = err;
      } else {
        throw err;
      }
    }
    // Returns 'true' to facilitate timeout handling (implemented as
    // racing with another Promise that returns 'false').
    return Promise.resolve(true);
  };

  /********************** private methods and data ************************/

  private fetchData = async (): Promise<void> => {
    const fetchProps: IFetch = {
      abortSignal: this.m_signal,
      errorHandler: this.errorHandler,
      isJson: true,
      method: "GET",
      successHandler: this.successHandler,
      targetPath: `${
        MathBackendManager.s_targetPath
      }?${this.m_queryParams.toString()}`,
    };

    await fetchAdapter(fetchProps);
  };

  private successHandler = (data: any): void => {
    const result = MathBackendManager.parser(data);

    if (result) {
      this.m_queryResult = result;
    } else if (isError(data)) {
      this.m_queryResult = data as Error;
    } else if (isString(data)) {
      this.m_queryResult = new Error(data as string);
    } else {
      this.m_queryResult = new CustomError(
        "Unexpected backend responce data, please contact Support.",
        "Details: " +
          Object.getOwnPropertyNames(data)
            .map((key) => `${key}: ${data[key] || "no data"}`)
            .join("\n")
      );
    }
  };

  private errorHandler = (err: CustomError): void => {
    if (isCustomError(err)) {
      this.m_queryResult = err;
    } else {
      this.m_queryResult = new CustomError(
        "Unexpected backend error data, please contact Support.",
        "Details: " +
          Object.getOwnPropertyNames(err)
            .map((key) => `${key}: ${err[key] || "no data"}`)
            .join("\n")
      );
    }
  };

  private static parser = (inputObj: object): MathMedianResult | undefined => {
    const obj: MathMedianResult = Object.create(MathMedianResult.prototype);
    const ret = Object.assign(obj, inputObj);
    const propNames = ["response"];
    const hasProps = propNames.every((prop) => ret.hasOwnProperty(prop));

    return hasProps ? ret : undefined;
  };

  private m_queryParams: MedianBackendRequest;
  private m_queryResult: MathMedianRetrieval = new Error(
    "<query not attempted>"
  );
  private readonly m_signal: AbortSignal;
  private static readonly s_targetPath = MathRequest.MedianPath;
}
