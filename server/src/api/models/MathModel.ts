/*
  The Model.
  May be used to make an api call to cloud service.
*/
import * as NodeCache from "node-cache";
import { logger } from "../../utils/logger";
import { CustomError } from "../../utils/error";
import {
  IMathMedianData,
  MathRequest,
  MathMedianData,
  MathMedianResult,
  MathMedianRetrieval,
} from "../types/MathTypes";
import { median } from "../../utils/misc";

/*
  Model configuration.
*/
export class MathModelConfig {
  constructor(
    // Daily limit on API requests per client address
    private limitDailyClient = MathModelConfig.s_limitDailyClient,
    // Daily limit on API requests per backend instance
    private limitDailyInstance = MathModelConfig.s_limitDailyInstance
  ) {
    if (
      limitDailyClient <= 0 ||
      limitDailyClient > MathModelConfig.s_limitDailyClient
    ) {
      throw new RangeError("Client API call limit is invalid");
    }

    if (
      limitDailyInstance <= 0 ||
      limitDailyInstance > MathModelConfig.s_limitDailyInstance
    ) {
      throw new RangeError("Instance API call limit is invalid");
    }
  }

  public readonly setClientDailyLiImit = (limit: number) => {
    if (typeof limit !== "number" || !Number.isInteger(limit)) {
      throw new TypeError("Client API call limit is not an integer");
    }

    if (limit <= 0 || limit > MathModelConfig.s_limitDailyClient) {
      throw new RangeError("Client API call limit is invalid");
    }

    this.limitDailyClient = limit;
  };

  public readonly getClientDailyLimit = (): number => {
    return this.limitDailyClient;
  };

  public readonly getInstanceDailyLimit = (): number => {
    return this.limitDailyInstance;
  };

  // Default daily API call limit per client address
  private static readonly s_limitDailyClient = 10;
  // Default daily API call limit per backend instance
  private static readonly s_limitDailyInstance = 1000;
}

/*
  Model interface.
  Extends the data storage interface by adding data fetching capability.
*/
export interface IMathFetcher extends IMathMedianData {
  readonly fetch: (param: MathRequest) => void;
}

export class MathModel implements IMathFetcher {
  // Use .Config setter once to set the configuration.
  static set Config(config: MathModelConfig) {
    MathModel.s_config = config;
    MathModel.s_instance = undefined;
  }

  // Use .Factory getter one or many times to get an instance of the class.
  static get Factory(): MathModel {
    if (!MathModel.s_instance) {
      MathModel.s_instance = new MathModel();
    }
    return MathModel.s_instance;
  }

  public fetch(quoteRequest: MathRequest): void {
    this.m_request = quoteRequest;

    const dataUsage = this.getDataUsage(quoteRequest.ClientAddress);
    // Check data usage per client
    if (dataUsage.client_data >= MathModel.s_config!.getClientDailyLimit()) {
      const custErr = new CustomError(
        509,
        MathModel.s_errLimitClient,
        false,
        false
      );
      custErr.unobscuredMessage = `Client ${quoteRequest.ClientAddress} has reached daily limit`;
      this.m_median_result = custErr;
      return;
    }
    // Check data usage by the backend instance
    if (
      dataUsage.instance_data >= MathModel.s_config!.getInstanceDailyLimit()
    ) {
      const custErr = new CustomError(
        509,
        MathModel.s_errLimitInstance,
        false,
        false
      );
      custErr.unobscuredMessage = `Client ${quoteRequest.ClientAddress} request denied due to backend reaching its daily limit`;
      this.m_median_result = custErr;
      return;
    }

    this.sieveOfEratosthenes();
  }

  // Use .MedianData getter to get either the data fetched or an Error object.
  get MedianData(): MathMedianRetrieval {
    return this.m_median_result;
  }

  public getMedianData(): MathMedianRetrieval {
    return this.m_median_result;
  }

  /********************** private methods and data ************************/

  private constructor() {
    if (!MathModel.s_config) {
      throw new Error("MathModelConfig is undefined");
    }
    this.m_cache.on("expired", this.handleCacheExpiry);
  }

  private sieveOfEratosthenes(): void {
    const request = this.m_request as MathRequest;

    try {
      const limit = request.Limit;
      const isPrime: boolean[] = new Array(limit + 1).fill(true);
      isPrime[0] = false;
      isPrime[1] = false;

      const primes = [];

      for (let num = 2; num <= limit; num += 1) {
        if (isPrime[num] === true) {
          primes.push(num);

          /*
           * Optimisation.
           * Start marking multiples of `p` from `p * p`, and not from `2 * p`.
           * The reason why this works is because, at that point, smaller multiples
           * of `p` will have already been marked `false`.
           *
           * Warning: When working with really big numbers, the following line may cause overflow
           * In that case, it can be changed to:
           * let nextNumber = 2 * number;
           */
          let nextNumber = num * num;

          while (nextNumber <= limit) {
            isPrime[nextNumber] = false;
            nextNumber += num;
          }
        }
      }

      const data: MathMedianData = { medians: median(primes) };
      this.m_median_result = new MathMedianResult(data);
      this.adjustDataUsage(request.ClientAddress);
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Exception: <" +
            Object.keys(err)
              .map((key) => `${key}: ${err[key] ?? "no data"}`)
              .join("\n") +
            ">";
      logger.error({ message: `API server call failed, error: ${errorMsg}` });
      this.m_median_result = new Error(MathModel.s_errMsg);
    }
  }

  private handleCacheExpiry = (cache_key: string, _value: any) => {
    if (!cache_key) {
      return;
    }

    logger.info({ msg: `Cache key ${cache_key} has expired` });
  };

  // TODO Use durable cache
  private getDataUsage(
    clientAddress: string
  ): {
    // Client address
    client_key: string;
    // Count of API calls made by the client
    client_data: number;
    // Count of API calls made by the backend instanc
    instance_data: number;
  } {
    if (!clientAddress) {
      const errMsg = "MathModel.getDataUsage - missing clientAddress";
      logger.error({ message: errMsg });
      throw new Error(errMsg);
    }

    const clientKey = MathModel.s_limitPrefix + clientAddress;
    const cacheData = this.m_cache.mget([clientKey, MathModel.s_limitInstance]);
    const clientData =
      typeof cacheData[clientKey] === "number"
        ? (cacheData[clientKey] as number)
        : 0;
    const instanceData =
      typeof cacheData[MathModel.s_limitInstance] === "number"
        ? (cacheData[MathModel.s_limitInstance] as number)
        : 0;
    return {
      client_key: clientKey,
      client_data: clientData,
      instance_data: instanceData,
    };
  }

  // TODO Use durable cache
  private adjustDataUsage(clientAddress: string, usageCount: number = 1) {
    if (usageCount === 0) {
      return;
    }

    const { client_key, client_data, instance_data } = this.getDataUsage(
      clientAddress
    );

    const ret = this.m_cache.mset([
      {
        key: client_key,
        ttl: MathModel.s_limitCleanupInterval,
        val: client_data + usageCount,
      },
      {
        key: MathModel.s_limitInstance,
        ttl: MathModel.s_limitCleanupInterval,
        val: instance_data + usageCount,
      },
    ]);

    if (!ret) {
      const errMsg = "Failed to store API call counts in the cache";
      logger.error({ message: errMsg });
      throw new Error(errMsg);
    }
  }

  private m_request?: MathRequest = undefined;
  private m_median_result: MathMedianRetrieval = new Error(
    "API server call not attempted"
  );

  private readonly m_cache = new NodeCache({
    checkperiod: 900,
    deleteOnExpire: true,
    stdTTL: MathModel.s_limitCleanupInterval,
    useClones: false,
  });

  private static s_instance?: MathModel = undefined;
  private static s_config?: MathModelConfig = undefined;
  private static readonly s_errMsg =
    "Failed to query the API server. Please retry later. If the problem persists contact Support";
  private static readonly s_errLimitClient =
    "The daily API call limit has been reached. Please contact Support if you feel this limit is inadequate.";
  private static readonly s_errLimitInstance =
    "Temporary unable to call the API server. Please contact Support.";
  private static readonly s_limitPrefix = "apilimit_";
  private static readonly s_limitInstance = "apilimit_instance";
  private static readonly s_limitCleanupInterval = 3600 * 24;
}
