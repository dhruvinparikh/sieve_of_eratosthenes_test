import {
  MedianBackendRequest,
  IBackendMedianRequestData,
} from "../api/BackendRequest";

describe("Testing BackendRequest with invalid data", () => {
  it("should reject limit less than two", () => {
    const data: IBackendMedianRequestData = {
      limit: "1",
    };
    /* tslint:disable:no-unused-expression */
    function testCreate() {
      new MedianBackendRequest(data);
    }
    expect(testCreate).toThrowError(/greater than 1/i);
  });

  it("should reject if limit is not a number", () => {
    const data: IBackendMedianRequestData = {
      limit: "kl",
    };
    /* tslint:disable:no-unused-expression */
    function testCreate() {
      new MedianBackendRequest(data);
    }
    /* tslint:enable:no-unused-expression */
    expect(testCreate).toThrowError(/must be a number/);
  });
});

describe("Testing BackendRequest with valid data", () => {
  it("should accept valid limit", () => {
    const data: IBackendMedianRequestData = {
      limit: "18"
    };
    const request = new MedianBackendRequest(data);
    expect(request).toBeDefined();
  });
});
