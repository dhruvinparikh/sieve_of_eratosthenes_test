/*
  Demonstates mocking
*/
import { MathModel } from "../api/models/MathModel";
import {
  MathMedianRetrieval,
} from "../api/types/MathTypes";
import { TestConfig } from "./TestConfig";

const mockMessage = "test-mock";
let spyInstance: jest.SpyInstance | undefined;

beforeAll(() => {
  spyInstance = jest
    .spyOn(MathModel.prototype, "getMedianData")
    .mockImplementation(() => {
      return new Error(mockMessage);
    });
});

afterAll(() => {
  expect(spyInstance).toBeDefined();
  expect(spyInstance).toHaveBeenCalledTimes(1);
  jest.restoreAllMocks();
});

describe("Test mocking", () => {
  const config = TestConfig.getModelConfig();
  MathModel.Config = config;

  it("Mocks selected methods of MathModel class", async () => {
    const bqRequest = TestConfig.getMedianRequest(
      TestConfig.getMedianStockTestRequest()
    );
    expect(bqRequest).toBeDefined();

    const model = MathModel.Factory;
    model.medianfetch(bqRequest!);
    const data: MathMedianRetrieval = model.getMedianData();

    expect(data).toBeInstanceOf(Error);
    const err = data as Error;
    expect(err.message).toContain(mockMessage);
  });
});
