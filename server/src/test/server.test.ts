/**
 * Express tests using Supertest Library and
 * Jest as the testing framework.
 */
import * as request from "supertest";
import Server, { StaticAssetPath } from "../srv/server";
import * as SPAs from "../../config/spa.config";
import { MathModel } from "../api/models/MathModel";
import { TestConfig } from "./TestConfig";
import {
  MathRequest,
  MathMedianData,
  MathMedianResult,
} from "../api/types/MathTypes";

const server = Server(StaticAssetPath.SOURCE);
const regexResponse = new RegExp(SPAs.appTitle);

const testMedians = [3, 5];

beforeAll(() => {
  jest
    .spyOn(MathModel.prototype, "fetch")
    .mockImplementation((_params: any) => {});

  jest
    .spyOn(MathModel.prototype, "MedianData", "get")
    .mockImplementation(() => {
      const data: MathMedianData = {
        medians: testMedians,
      };
      const ret = new MathMedianResult(data);
      return ret;
    });
});

// Test that webserver does serve SPA landing pages.
// If there are two SPAs in spa.config.js called 'first and 'second',
// then set the array to:  ["/", "/first", "/second"]
const statusCode200path = SPAs.getNames().map((name) => "/" + name);
statusCode200path.push("/");

// Test that webserver implements fallback to the SPA landing page for
// unknown (and presumably internal to SPA) pages. This is required from
// any webserver that supports an SPA.
const statusCode303path = ["/a", "/b", "/ABC"];

// Test that the fallback tolerance does have its limits.
const statusCode404path = [
  "/abc%xyz;",
  "/images/logo123.png",
  "/static/invalid",
];

describe("Test Express routes", () => {
  const config = TestConfig.getModelConfig();
  MathModel.Config = config;

  it("test URLs returning HTTP status 200", () => {
    statusCode200path.forEach(async (path) => {
      const response = await request(server).get(path);
      expect(response.status).toBe(200);
      expect(response.text).toMatch(regexResponse);
    });
  });

  it("test URLs causing fallback with HTTP status 303", () => {
    statusCode303path.forEach(async (path) => {
      const response = await request(server).get(path);
      expect(response.status).toBe(303);
      expect(response.get("Location")).toBe("/");
    });
  });

  it("test invalid URLs causing HTTP status 404", () => {
    statusCode404path.forEach(async (path) => {
      const response = await request(server).get(path);
      expect(response.status).toBe(404);
    });
  });
});

describe("Test API route to find median", () => {
  it("test delivery of fetched data", async () => {
    const strRequest = TestConfig.getMedianRequestAsString(
      TestConfig.getMedianStockTestRequest()
    );

    const response = await request(server)
      .get(`${MathRequest.MedianPath}?${strRequest}`)
      .set("Content-Type", "application/json")
      .send();

    const obj: MathMedianResult = Object.create(MathMedianResult.prototype);
    const data = Object.assign(obj, response.body);

    expect(data.response.medians).toEqual(expect.arrayContaining(testMedians));
  });
});
