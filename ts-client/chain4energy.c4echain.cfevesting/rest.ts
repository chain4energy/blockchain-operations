/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface CfevestingGenesisVestingType {
  /** vesting type name */
  name?: string;

  /**
   * period of locked coins from vesting start
   * @format int64
   */
  lockup_period?: string;
  lockup_period_unit?: string;

  /**
   * period of veesting coins from lockup period end
   * @format int64
   */
  vesting_period?: string;
  vesting_period_unit?: string;

  /**
   * units to select:
   *  days
   *  hours
   *  minutes
   *  seconds
   */
  free?: string;
}

export type CfevestingMsgCreateVestingAccountResponse = object;

export type CfevestingMsgCreateVestingPoolResponse = object;

export type CfevestingMsgMoveAvailableVestingByDenomsResponse = object;

export type CfevestingMsgMoveAvailableVestingResponse = object;

export type CfevestingMsgSendToVestingAccountResponse = object;

export type CfevestingMsgSplitVestingResponse = object;

export type CfevestingMsgUpdateDenomParamResponse = object;

export interface CfevestingMsgWithdrawAllAvailableResponse {
  withdrawn?: string;
}

/**
 * Params defines the parameters for the module.
 */
export interface CfevestingParams {
  denom?: string;
}

export interface CfevestingQueryGenesisVestingsSummaryResponse {
  vesting_all_amount?: string;
  vesting_in_pools_amount?: string;
  vesting_in_accounts_amount?: string;
  delegated_vesting_amount?: string;
}

/**
 * QueryParamsResponse is response type for the Query/Params RPC method.
 */
export interface CfevestingQueryParamsResponse {
  /** params holds all the parameters of this module. */
  params?: CfevestingParams;
}

export interface CfevestingQueryVestingPoolsResponse {
  vesting_pools?: CfevestingVestingPoolInfo[];
}

export interface CfevestingQueryVestingTypeResponse {
  vesting_types?: CfevestingGenesisVestingType[];
}

export interface CfevestingQueryVestingsSummaryResponse {
  vesting_all_amount?: string;
  vesting_in_pools_amount?: string;
  vesting_in_accounts_amount?: string;
  delegated_vesting_amount?: string;
}

export interface CfevestingVestingPoolInfo {
  name?: string;
  vesting_type?: string;

  /** @format date-time */
  lock_start?: string;

  /** @format date-time */
  lock_end?: string;
  withdrawable?: string;

  /**
   * Coin defines a token with a denomination and an amount.
   *
   * NOTE: The amount field is an Int which implements the custom method
   * signatures required by gogoproto.
   */
  initially_locked?: V1Beta1Coin;
  currently_locked?: string;
  sent_amount?: string;
}

export interface ProtobufAny {
  "@type"?: string;
}

export interface RpcStatus {
  /** @format int32 */
  code?: number;
  message?: string;
  details?: ProtobufAny[];
}

/**
* Coin defines a token with a denomination and an amount.

NOTE: The amount field is an Int which implements the custom method
signatures required by gogoproto.
*/
export interface V1Beta1Coin {
  denom?: string;
  amount?: string;
}

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, ResponseType } from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({ securityWorker, secure, format, ...axiosConfig }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({ ...axiosConfig, baseURL: axiosConfig.baseURL || "" });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  private mergeRequestParams(params1: AxiosRequestConfig, params2?: AxiosRequestConfig): AxiosRequestConfig {
    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.instance.defaults.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  private createFormData(input: Record<string, unknown>): FormData {
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      formData.append(
        key,
        property instanceof Blob
          ? property
          : typeof property === "object" && property !== null
          ? JSON.stringify(property)
          : `${property}`,
      );
      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = (format && this.format) || void 0;

    if (type === ContentType.FormData && body && body !== null && typeof body === "object") {
      requestParams.headers.common = { Accept: "*/*" };
      requestParams.headers.post = {};
      requestParams.headers.put = {};

      body = this.createFormData(body as Record<string, unknown>);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
        ...(requestParams.headers || {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title c4echain/cfevesting/account_vesting_pool.proto
 * @version version not set
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Query
   * @name QueryGenesisVestingsSummary
   * @summary Queries a list of GenesisVestingsSummary items.
   * @request GET:/c4e/vesting/v1beta1/genesis_summary
   */
  queryGenesisVestingsSummary = (params: RequestParams = {}) =>
    this.request<CfevestingQueryGenesisVestingsSummaryResponse, RpcStatus>({
      path: `/c4e/vesting/v1beta1/genesis_summary`,
      method: "GET",
      format: "json",
      ...params,
    });

  /**
   * No description
   *
   * @tags Query
   * @name QueryParams
   * @summary Parameters queries the parameters of the module.
   * @request GET:/c4e/vesting/v1beta1/params
   */
  queryParams = (params: RequestParams = {}) =>
    this.request<CfevestingQueryParamsResponse, RpcStatus>({
      path: `/c4e/vesting/v1beta1/params`,
      method: "GET",
      format: "json",
      ...params,
    });

  /**
   * No description
   *
   * @tags Query
   * @name QueryVestingsSummary
   * @summary Queries a summary of the entire vesting.
   * @request GET:/c4e/vesting/v1beta1/summary
   */
  queryVestingsSummary = (params: RequestParams = {}) =>
    this.request<CfevestingQueryVestingsSummaryResponse, RpcStatus>({
      path: `/c4e/vesting/v1beta1/summary`,
      method: "GET",
      format: "json",
      ...params,
    });

  /**
   * No description
   *
   * @tags Query
   * @name QueryVestingPools
   * @summary Queries a list of Vesting items.
   * @request GET:/c4e/vesting/v1beta1/vesting_pools/{owner}
   */
  queryVestingPools = (owner: string, params: RequestParams = {}) =>
    this.request<CfevestingQueryVestingPoolsResponse, RpcStatus>({
      path: `/c4e/vesting/v1beta1/vesting_pools/${owner}`,
      method: "GET",
      format: "json",
      ...params,
    });

  /**
   * No description
   *
   * @tags Query
   * @name QueryVestingType
   * @summary Queries a list of VestingType items.
   * @request GET:/c4e/vesting/v1beta1/vesting_type
   */
  queryVestingType = (params: RequestParams = {}) =>
    this.request<CfevestingQueryVestingTypeResponse, RpcStatus>({
      path: `/c4e/vesting/v1beta1/vesting_type`,
      method: "GET",
      format: "json",
      ...params,
    });
}
