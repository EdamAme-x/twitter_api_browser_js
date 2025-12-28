import { TwitterAPIBrowser } from "./main.ts";

async function main(): Promise<void> {
  const userDataDir = "./.data";
  
  console.log("Creating browser...");
  const browser = new TwitterAPIBrowser(userDataDir);
  console.log("Browser created");
  await browser.setup();
  
  try {
    console.log("Logging in...");
    await browser.manualLogin();
    console.log("Logged in successfully");
    
    while (true) {
      console.log("=".repeat(20));
      const operation = prompt(
        "Choose operation [CreateTweet, HomeTimeline, UserByScreenName, CreateRetweet, FavoriteTweet, SearchTimeline, UsersByRestIds, exit]: "
      );
      
      if (!operation || operation === "exit") {
        return;
      }
      
      let res: Response;
      
      if (operation === "CreateTweet") {
        res = await browser.request(
          "CreateTweet",
          {
            tweet_text: `Hello, World! ${new Date().toISOString()}`,
            dark_request: false,
            media: { media_entities: [], possibly_sensitive: false },
            semantic_annotation_ids: [],
            disallowed_reply_options: null,
          },
        );
        console.log(await res.json());
      } else if (operation === "HomeTimeline") {
        res = await browser.request(
          "HomeTimeline",
          {
            count: 20,
            includePromotedContent: true,
            latestControlAvailable: true,
            withCommunity: true,
          },
        );
        console.log(await res.json());
      } else if (operation === "UserByScreenName") {
        res = await browser.request(
          "UserByScreenName",
          {
            screen_name: "elonmusk",
            withSafetyModeUserFields: true,
            withSuperFollowsUserFields: true,
            withBirdwatchPivots: false,
          },
          {
            withAuxiliaryUserLabels: true,
          },
        );
        console.log(await res.json());
      } else if (operation === "CreateRetweet") {
        res = await browser.request(
          "CreateRetweet",
          {
            tweet_id: "1987547856664993831",
            dark_request: false,
          },
        );
        console.log(await res.json());
      } else if (operation === "FavoriteTweet") {
        res = await browser.request(
          "FavoriteTweet",
          { tweet_id: "1987547856664993831" },
        );
        console.log(await res.json());
      } else if (operation === "SearchTimeline") {
        res = await browser.request(
          "SearchTimeline",
          {
            rawQuery: "from:elonmusk",
            count: 20,
            querySource: "typed_query",
            product: "Top",
            withGrokTranslatedBio: false,
          },
        );
        console.log(await res.json());
      } else if (operation === "UsersByRestIds") {
        res = await browser.request(
          "UsersByRestIds",
          {
            userIds: ["900282258736545792"],
          },
        );
        console.log(await res.json());
      } else {
        console.log(`Unknown operation: ${operation}`);
      }
    }
  } finally {
    await browser.close();
  }
}

if (import.meta.main) {
  await main();
}
