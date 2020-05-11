/***********************************************************************
 *  Types related to result received from function to find medians
 ***********************************************************************/

// The 'main' or 'central' data piece from the result provided by median function
export class MathMedianData {
  readonly medians?: Array<number>;
}

// API response. Contains the 'main' piece of data
// and auxillary response data which in this project is none.
export class MathMedianResult {
  constructor(public response: MathMedianData) {}
}

/*
   API data
*/
export type MathMedianRetrieval = MathMedianResult | Error;

/*
   Function response data storage interface.
   A component that implements this interface can store result
   and return it via '.MedianData' getter.
*/
export interface IMathMedianData {
  readonly MedianData: MathMedianRetrieval;
}

/******************************************************************************
 *  Types related to constructing a request used to get result from function
 ******************************************************************************/

interface IMathRequest {
  readonly limit: number;
  readonly clientAddress: string;
}

export type JsonParsingError = { message?: string };

/*
  Class MathRequest used to parse and validate a JSON request received from the client.
*/
export class MathRequest {
  // Factory method. Returns undefined when fails in which case _errInfo
  // is set to a meaningful value.
  // Keeping constructor private ensures all attempts to instantiate the
  // class have to use this method (and the input data validation it uses).
  static fromJSON(
    objJson: any,
    clientAddress: string,
    errInfo: JsonParsingError
  ): MathRequest | undefined {
    try {
      // Security considerations driven approach: assume every piece of data
      // in the incoming API request is malicious until proven otherwise.
      const dataJson: IMathRequest = {
        clientAddress: MathRequest.getClientAddress(clientAddress),
        // the query params from the client is of type 'string'
        limit: MathRequest.getLimit(parseInt(objJson.limit)),
      };
      MathRequest.validateRequestParams(dataJson);
      return new MathRequest(dataJson);
    } catch (err) {
      const errMsg =
        err instanceof Error
          ? err.message
          : "Exception: <" +
            Object.keys(err)
              .map((key) => `${key}: ${err[key] ?? "no data"}`)
              .join("\n") +
            ">";

      errInfo.message = `Request parsing failed, error: ${errMsg}`;
      return undefined;
    }
  }

  get Limit(): number {
    return this.m_limit;
  }

  get ClientAddress(): string {
    return this.m_clientAddress;
  }

  static get MedianPath(): string {
    return MathRequest.m_paramPath;
  }

  /********************** private methods and data ************************/

  private constructor(data: IMathRequest) {
    this.m_limit = data.limit;
    this.m_clientAddress = data.clientAddress;
  }

  private static validateRequestParams(params: IMathRequest): void {
    if (MathRequest.isUndefined(params.limit)) {
      throw new Error("Parameter 'limit' is invalid");
    }
  }

  private static isNumber(x: any): x is number {
    return typeof x === "number" && x > 0;
  }

  private static isUndefined(x: any): boolean {
    return typeof x === "undefined" ? true : false;
  }

  private static isClientAddressValid(str: string): boolean {
    // Comes from server and not from client, therefore apply
    // simplified validation without Regex
    return !!str;
  }

  private static isLimitValid(lmt: number): boolean {
    if (MathRequest.isNumber(lmt)) {
      return true;
    }
    return false;
  }

  private static getClientAddress(str: string): string {
    if (!str) {
      throw new TypeError("Parameter 'clientAddress' is missing");
    }
    if (!MathRequest.isClientAddressValid(str)) {
      throw new EvalError("Parameter 'clientAddress' is invalid");
    }
    return str;
  }

  private static getLimit(lmt: number): number {
    const err = "Parameter 'limit' is missing";
    if (!lmt) {
      throw new EvalError(err);
    }
    if (!MathRequest.isLimitValid(lmt)) {
      throw new EvalError("Parameter 'limit' is invalid");
    }
    return lmt;
  }

  private readonly m_limit: number;
  private readonly m_clientAddress: string;

  private static readonly m_paramPath = "/api/median/1.0";
}
