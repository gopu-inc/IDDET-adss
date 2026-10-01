import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AdDraft, AdDraftInput, CompleteShopifyOAuthParams, HealthStatus, IddetAccount, IddetCommunity, IddetConnectInput, IddetSession, Overview, Product, ShopifyConnection, StartShopifyOAuthParams } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * @summary Health check
 */
export declare const healthCheck: (options?: Parameters<typeof customFetch>[1]) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetOverviewUrl: () => string;
/**
 * @summary Get the current shop overview
 */
export declare const getOverview: (options?: Parameters<typeof customFetch>[1]) => Promise<Overview>;
export declare const getGetOverviewQueryKey: () => readonly ["/api/overview"];
export declare const getGetOverviewQueryOptions: <TData = Awaited<ReturnType<typeof getOverview>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getOverview>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getOverview>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetOverviewQueryResult = NonNullable<Awaited<ReturnType<typeof getOverview>>>;
export type GetOverviewQueryError = ErrorType<void>;
/**
 * @summary Get the current shop overview
 */
export declare function useGetOverview<TData = Awaited<ReturnType<typeof getOverview>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getOverview>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetIddetSessionUrl: () => string;
/**
 * @summary Get the current IDDET login session
 */
export declare const getIddetSession: (options?: Parameters<typeof customFetch>[1]) => Promise<IddetSession>;
export declare const getGetIddetSessionQueryKey: () => readonly ["/api/auth/session"];
export declare const getGetIddetSessionQueryOptions: <TData = Awaited<ReturnType<typeof getIddetSession>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getIddetSession>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getIddetSession>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetIddetSessionQueryResult = NonNullable<Awaited<ReturnType<typeof getIddetSession>>>;
export type GetIddetSessionQueryError = ErrorType<unknown>;
/**
 * @summary Get the current IDDET login session
 */
export declare function useGetIddetSession<TData = Awaited<ReturnType<typeof getIddetSession>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getIddetSession>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getLoginWithIddetUrl: () => string;
/**
 * @summary Sign in with IDDET credentials
 */
export declare const loginWithIddet: (iddetConnectInput: IddetConnectInput, options?: Parameters<typeof customFetch>[1]) => Promise<IddetSession>;
export declare const getLoginWithIddetMutationKey: () => readonly ["loginWithIddet"];
export declare const getLoginWithIddetMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof loginWithIddet>>, TError, LoginWithIddetMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof loginWithIddet>>, TError, LoginWithIddetMutationVariables, TContext>;
export type LoginWithIddetMutationResult = NonNullable<Awaited<ReturnType<typeof loginWithIddet>>>;
export type LoginWithIddetMutationBody = BodyType<IddetConnectInput>;
export type LoginWithIddetMutationError = ErrorType<void>;
export type LoginWithIddetMutationVariables = {
    data: BodyType<IddetConnectInput>;
};
/**
* @summary Sign in with IDDET credentials
*/
export declare const useLoginWithIddet: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof loginWithIddet>>, TError, LoginWithIddetMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof loginWithIddet>>, TError, LoginWithIddetMutationVariables, TContext>;
export declare const getLogoutIddetUrl: () => string;
/**
 * @summary End the current IDDET session
 */
export declare const logoutIddet: (options?: Parameters<typeof customFetch>[1]) => Promise<IddetSession>;
export declare const getLogoutIddetMutationKey: () => readonly ["logoutIddet"];
export declare const getLogoutIddetMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logoutIddet>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof logoutIddet>>, TError, void, TContext>;
export type LogoutIddetMutationResult = NonNullable<Awaited<ReturnType<typeof logoutIddet>>>;
export type LogoutIddetMutationError = ErrorType<unknown>;
/**
* @summary End the current IDDET session
*/
export declare const useLogoutIddet: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logoutIddet>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof logoutIddet>>, TError, void, TContext>;
export declare const getStartShopifyOAuthUrl: (params: StartShopifyOAuthParams) => string;
/**
 * @summary Redirect the signed-in user to Shopify authorization
 */
export declare const startShopifyOAuth: (params: StartShopifyOAuthParams, options?: Parameters<typeof customFetch>[1]) => Promise<unknown>;
export declare const getStartShopifyOAuthQueryKey: (params?: StartShopifyOAuthParams) => readonly ["/api/shopify/oauth/start", ...StartShopifyOAuthParams[]];
export declare const getStartShopifyOAuthQueryOptions: <TData = Awaited<ReturnType<typeof startShopifyOAuth>>, TError = ErrorType<void>>(params: StartShopifyOAuthParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof startShopifyOAuth>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof startShopifyOAuth>>, TError, TData> & {
    queryKey: QueryKey;
};
export type StartShopifyOAuthQueryResult = NonNullable<Awaited<ReturnType<typeof startShopifyOAuth>>>;
export type StartShopifyOAuthQueryError = ErrorType<void>;
/**
 * @summary Redirect the signed-in user to Shopify authorization
 */
export declare function useStartShopifyOAuth<TData = Awaited<ReturnType<typeof startShopifyOAuth>>, TError = ErrorType<void>>(params: StartShopifyOAuthParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof startShopifyOAuth>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCompleteShopifyOAuthUrl: (params: CompleteShopifyOAuthParams) => string;
/**
 * @summary Complete Shopify authorization and return to the dashboard
 */
export declare const completeShopifyOAuth: (params: CompleteShopifyOAuthParams, options?: Parameters<typeof customFetch>[1]) => Promise<unknown>;
export declare const getCompleteShopifyOAuthQueryKey: (params?: CompleteShopifyOAuthParams) => readonly ["/api/shopify/oauth/callback", ...CompleteShopifyOAuthParams[]];
export declare const getCompleteShopifyOAuthQueryOptions: <TData = Awaited<ReturnType<typeof completeShopifyOAuth>>, TError = ErrorType<void>>(params: CompleteShopifyOAuthParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof completeShopifyOAuth>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof completeShopifyOAuth>>, TError, TData> & {
    queryKey: QueryKey;
};
export type CompleteShopifyOAuthQueryResult = NonNullable<Awaited<ReturnType<typeof completeShopifyOAuth>>>;
export type CompleteShopifyOAuthQueryError = ErrorType<void>;
/**
 * @summary Complete Shopify authorization and return to the dashboard
 */
export declare function useCompleteShopifyOAuth<TData = Awaited<ReturnType<typeof completeShopifyOAuth>>, TError = ErrorType<void>>(params: CompleteShopifyOAuthParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof completeShopifyOAuth>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetShopifyConnectionUrl: () => string;
/**
 * @summary Get Shopify managed-installation status for the current shop
 */
export declare const getShopifyConnection: (options?: Parameters<typeof customFetch>[1]) => Promise<ShopifyConnection>;
export declare const getGetShopifyConnectionQueryKey: () => readonly ["/api/shopify/connection"];
export declare const getGetShopifyConnectionQueryOptions: <TData = Awaited<ReturnType<typeof getShopifyConnection>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getShopifyConnection>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getShopifyConnection>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetShopifyConnectionQueryResult = NonNullable<Awaited<ReturnType<typeof getShopifyConnection>>>;
export type GetShopifyConnectionQueryError = ErrorType<void>;
/**
 * @summary Get Shopify managed-installation status for the current shop
 */
export declare function useGetShopifyConnection<TData = Awaited<ReturnType<typeof getShopifyConnection>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getShopifyConnection>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getSyncShopifyProductsUrl: () => string;
/**
 * @summary Sync products from the current Shopify shop through the Admin GraphQL API
 */
export declare const syncShopifyProducts: (options?: Parameters<typeof customFetch>[1]) => Promise<Product[]>;
export declare const getSyncShopifyProductsMutationKey: () => readonly ["syncShopifyProducts"];
export declare const getSyncShopifyProductsMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof syncShopifyProducts>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof syncShopifyProducts>>, TError, void, TContext>;
export type SyncShopifyProductsMutationResult = NonNullable<Awaited<ReturnType<typeof syncShopifyProducts>>>;
export type SyncShopifyProductsMutationError = ErrorType<void>;
/**
* @summary Sync products from the current Shopify shop through the Admin GraphQL API
*/
export declare const useSyncShopifyProducts: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof syncShopifyProducts>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof syncShopifyProducts>>, TError, void, TContext>;
export declare const getListProductsUrl: () => string;
/**
 * @summary List catalog products for the current shop
 */
export declare const listProducts: (options?: Parameters<typeof customFetch>[1]) => Promise<Product[]>;
export declare const getListProductsQueryKey: () => readonly ["/api/products"];
export declare const getListProductsQueryOptions: <TData = Awaited<ReturnType<typeof listProducts>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listProducts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListProductsQueryResult = NonNullable<Awaited<ReturnType<typeof listProducts>>>;
export type ListProductsQueryError = ErrorType<void>;
/**
 * @summary List catalog products for the current shop
 */
export declare function useListProducts<TData = Awaited<ReturnType<typeof listProducts>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListIddetAccountsUrl: () => string;
/**
 * @summary List IDDET accounts connected to the current shop
 */
export declare const listIddetAccounts: (options?: Parameters<typeof customFetch>[1]) => Promise<IddetAccount[]>;
export declare const getListIddetAccountsQueryKey: () => readonly ["/api/iddet/accounts"];
export declare const getListIddetAccountsQueryOptions: <TData = Awaited<ReturnType<typeof listIddetAccounts>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listIddetAccounts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listIddetAccounts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListIddetAccountsQueryResult = NonNullable<Awaited<ReturnType<typeof listIddetAccounts>>>;
export type ListIddetAccountsQueryError = ErrorType<void>;
/**
 * @summary List IDDET accounts connected to the current shop
 */
export declare function useListIddetAccounts<TData = Awaited<ReturnType<typeof listIddetAccounts>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listIddetAccounts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getConnectIddetAccountUrl: () => string;
/**
 * @summary Connect an IDDET publishing account for the current shop
 */
export declare const connectIddetAccount: (iddetConnectInput: IddetConnectInput, options?: Parameters<typeof customFetch>[1]) => Promise<IddetAccount>;
export declare const getConnectIddetAccountMutationKey: () => readonly ["connectIddetAccount"];
export declare const getConnectIddetAccountMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof connectIddetAccount>>, TError, ConnectIddetAccountMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof connectIddetAccount>>, TError, ConnectIddetAccountMutationVariables, TContext>;
export type ConnectIddetAccountMutationResult = NonNullable<Awaited<ReturnType<typeof connectIddetAccount>>>;
export type ConnectIddetAccountMutationBody = BodyType<IddetConnectInput>;
export type ConnectIddetAccountMutationError = ErrorType<void>;
export type ConnectIddetAccountMutationVariables = {
    data: BodyType<IddetConnectInput>;
};
/**
* @summary Connect an IDDET publishing account for the current shop
*/
export declare const useConnectIddetAccount: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof connectIddetAccount>>, TError, ConnectIddetAccountMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof connectIddetAccount>>, TError, ConnectIddetAccountMutationVariables, TContext>;
export declare const getListIddetCommunitiesUrl: () => string;
/**
 * @summary List IDDET communities for the current shop
 */
export declare const listIddetCommunities: (options?: Parameters<typeof customFetch>[1]) => Promise<IddetCommunity[]>;
export declare const getListIddetCommunitiesQueryKey: () => readonly ["/api/iddet/communities"];
export declare const getListIddetCommunitiesQueryOptions: <TData = Awaited<ReturnType<typeof listIddetCommunities>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listIddetCommunities>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listIddetCommunities>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListIddetCommunitiesQueryResult = NonNullable<Awaited<ReturnType<typeof listIddetCommunities>>>;
export type ListIddetCommunitiesQueryError = ErrorType<void>;
/**
 * @summary List IDDET communities for the current shop
 */
export declare function useListIddetCommunities<TData = Awaited<ReturnType<typeof listIddetCommunities>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listIddetCommunities>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListAdDraftsUrl: () => string;
/**
 * @summary List ad drafts and published ads for the current shop
 */
export declare const listAdDrafts: (options?: Parameters<typeof customFetch>[1]) => Promise<AdDraft[]>;
export declare const getListAdDraftsQueryKey: () => readonly ["/api/ad-drafts"];
export declare const getListAdDraftsQueryOptions: <TData = Awaited<ReturnType<typeof listAdDrafts>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAdDrafts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAdDrafts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAdDraftsQueryResult = NonNullable<Awaited<ReturnType<typeof listAdDrafts>>>;
export type ListAdDraftsQueryError = ErrorType<void>;
/**
 * @summary List ad drafts and published ads for the current shop
 */
export declare function useListAdDrafts<TData = Awaited<ReturnType<typeof listAdDrafts>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAdDrafts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateAdDraftUrl: () => string;
/**
 * @summary Create an ad draft from a product
 */
export declare const createAdDraft: (adDraftInput: AdDraftInput, options?: Parameters<typeof customFetch>[1]) => Promise<AdDraft>;
export declare const getCreateAdDraftMutationKey: () => readonly ["createAdDraft"];
export declare const getCreateAdDraftMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAdDraft>>, TError, CreateAdDraftMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createAdDraft>>, TError, CreateAdDraftMutationVariables, TContext>;
export type CreateAdDraftMutationResult = NonNullable<Awaited<ReturnType<typeof createAdDraft>>>;
export type CreateAdDraftMutationBody = BodyType<AdDraftInput>;
export type CreateAdDraftMutationError = ErrorType<void>;
export type CreateAdDraftMutationVariables = {
    data: BodyType<AdDraftInput>;
};
/**
* @summary Create an ad draft from a product
*/
export declare const useCreateAdDraft: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAdDraft>>, TError, CreateAdDraftMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createAdDraft>>, TError, CreateAdDraftMutationVariables, TContext>;
export declare const getPublishAdDraftUrl: (id: string) => string;
/**
 * @summary Publish an ad draft to an IDDET community
 */
export declare const publishAdDraft: (id: string, options?: Parameters<typeof customFetch>[1]) => Promise<AdDraft>;
export declare const getPublishAdDraftMutationKey: () => readonly ["publishAdDraft"];
export declare const getPublishAdDraftMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof publishAdDraft>>, TError, PublishAdDraftMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof publishAdDraft>>, TError, PublishAdDraftMutationVariables, TContext>;
export type PublishAdDraftMutationResult = NonNullable<Awaited<ReturnType<typeof publishAdDraft>>>;
export type PublishAdDraftMutationError = ErrorType<void>;
export type PublishAdDraftMutationVariables = {
    id: string;
};
/**
* @summary Publish an ad draft to an IDDET community
*/
export declare const usePublishAdDraft: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof publishAdDraft>>, TError, PublishAdDraftMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof publishAdDraft>>, TError, PublishAdDraftMutationVariables, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map