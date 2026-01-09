import type * as TwitterOpenAPIModels from "twitter-openapi-typescript-generated/dist/models/index.d.ts";

export type LooseType = any;

export type TwitterOpenAPIModelsMapping = {
    "CreateTweet": TwitterOpenAPIModels.CreateTweet,
    "HomeTimeline": TwitterOpenAPIModels.HomeTimelineHome,
    "UserByScreenName": TwitterOpenAPIModels.UserResultByScreenName,
    "CreateRetweet": TwitterOpenAPIModels.CreateRetweet,
    "FavoriteTweet": TwitterOpenAPIModels.FavoriteTweet,
    "SearchTimeline": TwitterOpenAPIModels.SearchTimeline,
    "UsersByRestIds": TwitterOpenAPIModels.UsersResponse,
} & Record<string, LooseType>;

export type SuccessResponse<T extends string> = TwitterOpenAPIModelsMapping[T];

// TODO
export type LooseErrorResponse = {
    errors: TwitterOpenAPIModels.ErrorResponse[],
    data: {}
} & Record<string, LooseType>;
