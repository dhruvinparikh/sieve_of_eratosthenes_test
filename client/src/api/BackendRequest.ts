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
  }

  public readonly toString = (): string => {
    return `limit=${this.requestData.limit}`;
  };
}
