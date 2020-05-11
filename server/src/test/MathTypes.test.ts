import { JsonParsingError, MathRequest } from "../api/types/MathTypes";
import { TestConfig } from "./TestConfig";

const validAddress = "10.10.10.10";

describe("Testing MathRequest with invalid data", () => {
  const errInfo: JsonParsingError = { message: undefined };

  it("should reject empty JSON object", () => {
    const obj: object = {};
    expect(MathRequest.fromLimit(obj, validAddress, errInfo)).not.toBeDefined();
  });

  it("should reject invalid JSON object", () => {
    const obj: object = {
      limit: "k",
    };
    expect(MathRequest.fromLimit(obj, validAddress, errInfo)).not.toBeDefined();
  });

  it("should reject invalid limit", () => {
    const reqJson = TestConfig.getMedianRequestAsJson(
      TestConfig.getMedianStockTestRequest()
    );
    TestConfig.getInvalidLimits().forEach((limit) => {
      reqJson.limit = limit;
      expect(TestConfig.getMedianRequest(reqJson)).not.toBeDefined();
    });
  });
});

describe("Testing MathRequest with valid data", () => {
  it("should accept valid names", () => {
    const reqJson = TestConfig.getMedianRequestAsJson(
      TestConfig.getMedianStockTestRequest()
    );
    TestConfig.getValidLimits().forEach((limit) => {
      reqJson.limit = limit;
      expect(TestConfig.getMedianRequest(reqJson)).toBeDefined();
    });
  });
});
