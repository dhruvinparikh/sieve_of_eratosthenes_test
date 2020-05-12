/*
  Define the shape of the request used to make API call.
*/
export interface IBackendMedianRequestData {
  readonly limit: string;
}

export class MedianBackendRequest {
  constructor(readonly requestData: IBackendMedianRequestData) {
    if (!this.requestData.limit) {
      // Can only happen if code is incorrectly modified
      throw new Error("Limit is missing");
    }
    if (!Number.isInteger(parseInt(this.requestData.limit, 10))) {
      throw new Error("Limit must be a number");
    }

    if (!(parseInt(this.requestData.limit, 10) > 1)) {
      throw new Error("Limit must be greater than 1");
    }
  }

  public readonly toString = (): string => {
    return `limit=${this.requestData.limit}`;
  };
}
