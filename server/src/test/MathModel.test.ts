import { MathModel } from "../api/models/MathModel";
import { MathMedianRetrieval, MathMedianResult } from "../api/types/MathTypes";
import { TestConfig } from "./TestConfig";

describe("Testing MathModel", () => {
  const timeout = 5000; // 5 sec
  const config = TestConfig.getModelConfig();
  MathModel.Config = config;

  it(
    "tests median API call",
    async () => {
      const testReq = TestConfig.getMedianStockTestRequest();
      const model = MathModel.Factory;

      TestConfig.getMedianTuples().forEach((t) => {
        testReq.limit = t[1];
        const request = TestConfig.getMedianRequest(testReq);
        model.medianfetch(request!);
        const data: MathMedianRetrieval = model.MedianData;
        expect(data).toBeInstanceOf(MathMedianResult);

        const result = data as MathMedianResult;
        expect(result.response.medians).toEqual(expect.arrayContaining(t[0]));
      });
    },
    timeout
  );
});
