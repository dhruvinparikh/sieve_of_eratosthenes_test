import { MathModelConfig } from "../api/models/MathModel";
import { JsonParsingError, MathRequest } from "../api/types/MathTypes";

type MedianTestRequest = {
  limit: number;
};

type MedianTuple = [
  // medians
  Array<number>,
  //limit
  number
];

export class TestConfig {
  static readonly getValidLimits = () => {
    const limits = [10, 18, 200];

    return limits;
  };

  static readonly getInvalidLimits = () => {
    const names = [
      "#",
      "to<m",
      "$1234567890",
      "-1",
      "delete * from users",
      "drop&nbsp;users",
      "0",
      "1",
      undefined,
    ];

    return names;
  };

  static readonly getMedianTuples = (): ReadonlyArray<MedianTuple> => {
    const tuples = [[[3, 5], 10] as MedianTuple, [[7], 18] as MedianTuple];

    return tuples;
  };

  static readonly getMedianStockTestRequest = (): MedianTestRequest => {
    return {
      limit: 10,
    };
  };

  static readonly getMedianRequestAsString = (
    req: MedianTestRequest
  ): string => {
    return `limit=${req.limit}`;
  };

  static readonly getMedianRequestAsJSONString = (
    req: MedianTestRequest
  ): string => {
    const obj = JSON.stringify({
      limit: req.limit,
    });
    return obj;
  };

  static readonly getMedianRequestAsJson = (
    req: MedianTestRequest
  ): any | undefined => {
    const ret = JSON.parse(TestConfig.getMedianRequestAsJSONString(req));
    return ret;
  };

  static readonly getMedianRequest = (
    req: MedianTestRequest,
    clientAddress = "10.10.11.12"
  ): MathRequest | undefined => {
    const ret = TestConfig.getMedianRequestAsJson(req);
    const errInfo: JsonParsingError = { message: undefined };
    return ret ? MathRequest.fromJSON(ret, clientAddress, errInfo) : undefined;
  };

  static readonly getModelConfig = (
    dataLimitClient: number | undefined = undefined,
    dataLimitInstance: number | undefined = undefined
  ): MathModelConfig => {
    return new MathModelConfig(dataLimitClient, dataLimitInstance);
  };
}
