/**
 * Tests for Overview using React Testing Library
 * with Jest adaptors.
 */
import { MathBackendManager, MathMedianRetrieval } from "../api/BackendManager";
import { TestConfig } from "./TestConfig";

const mockMessage = "test-mock";
let spyInstance: jest.SpyInstance | undefined;
let spyInstance1: jest.SpyInstance | undefined;

beforeAll(() => {
  spyInstance1 = jest
    .spyOn(MathBackendManager.prototype, "fetch")
    .mockImplementation(async (_params: any) => {
      return Promise.resolve(true);
    });
  spyInstance = jest
    .spyOn(MathBackendManager.prototype, "getMedianData")
    .mockImplementation(() => {
      return new Error(mockMessage);
    });
});

afterAll(() => {
  expect(spyInstance).toBeDefined();
  expect(spyInstance1).toHaveBeenCalledTimes(1);
  jest.restoreAllMocks();
});

describe("Test mocking", () => {
  it("Mocks selected methods of BackendManager class", async () => {
    const bqRequest = TestConfig.getRequest(TestConfig.getStockTestRequest());
    expect(bqRequest).toBeDefined();
    const abortController = new AbortController();
    const backendMgr = new MathBackendManager(abortController.signal);
    await backendMgr.fetch(bqRequest!);
    const data: MathMedianRetrieval = backendMgr.getMedianData();
    expect(data).toBeInstanceOf(Error);
    const err = data as Error;
    expect(err.message).toContain(mockMessage);
  });
});
