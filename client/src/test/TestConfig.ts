import { IBackendMedianRequestData } from "../api/BackendManager";

type TestRequest = {
  limit: string;
};

type MedianTuple = [number, Array<number>];

export class TestConfig {
  static readonly getValidLimits = () => {
    const limits = ["20", "30"];

    return limits;
  };

  static readonly getInvalidLimits = () => {
    const limits = [
      "Tim#",
      "to<m",
      "Alice$1234567890",
      "1",
      "0",
      "name(alias)version",
      "delete * from users",
      "drop&nbsp;users",
      undefined,
    ];

    return limits;
  };

  static readonly getMedianTuple = (): ReadonlyArray<MedianTuple> => {
    const tuples = [[20, [3, 4]] as MedianTuple, [30, [3, 4]] as MedianTuple];

    return tuples;
  };

  static readonly getStockTestRequest = (): TestRequest => {
    return {
      limit: "20",
    };
  };

  static readonly getRequestAsString = (req: TestRequest): string => {
    const obj = JSON.stringify({
      limit: req.limit,
    });
    return obj;
  };

  static readonly getRequestAsJson = (req: TestRequest): any | undefined => {
    const ret = JSON.parse(TestConfig.getRequestAsString(req));
    return ret;
  };

  static readonly getRequest = (
    req: TestRequest
  ): IBackendMedianRequestData | undefined => {
    const ret = TestConfig.getRequestAsJson(req);
    return ret;
  };
}
