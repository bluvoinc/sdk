import type { RequestResult } from "../generated/client/types.gen";

export const transformResponse = <T extends Awaited<RequestResult<unknown, unknown, false>>>(response: T) => {
	return {
        data: response.data as T["data"],
        error: response.error as T["error"],
        success: !response.error,
        rawResponse: response.response as T["response"],
    }
};
