import { TwitterAPIBrowser } from "./main.js";
import { createInterface } from "node:readline";

function prompt(question: string): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

function formatLog(...args: Parameters<typeof console.log>) {
  console.dir(args, { depth: null });
}

async function main(): Promise<void> {
  const userDataDir = "./.data";

  const browser = new TwitterAPIBrowser(userDataDir);
  console.log("Setup browser");
  await browser.setup();

  try {
    if (await browser.isLoggedIn()) {
      console.log("User is logged in");
    }else {
      console.log("User is not logged in, please login manually");
      await browser.manualLogin();
    }

    while (true) {
      console.log("=".repeat(20));
      const operation = await prompt(
        "Choose operation [CreateTweet, HomeTimeline, UserByScreenName, CreateRetweet, FavoriteTweet, SearchTimeline, UsersByRestIds, exit]: "
      );

      if (!operation || operation === "exit") {
        return;
      }

      const request = async () => {
        if (operation === "CreateTweet") {
          const res = await browser.request("CreateTweet", {
            tweet_text: `Hello, World! ${new Date().toISOString()}`,
            dark_request: false,
            media: { media_entities: [], possibly_sensitive: false },
            semantic_annotation_ids: [],
            disallowed_reply_options: null,
          });
          return res;
        } else if (operation === "HomeTimeline") {
          const res = await browser.request("HomeTimeline", {
            count: 20,
            includePromotedContent: true,
            latestControlAvailable: true,
            withCommunity: true,
          });
          return res;
        } else if (operation === "UserByScreenName") {
          const res = await browser.request(
            "UserByScreenName",
            {
              screen_name: "elonmusk",
              withSafetyModeUserFields: true,
              withSuperFollowsUserFields: true,
              withBirdwatchPivots: false,
            },
            {
              withAuxiliaryUserLabels: true,
            }
          );
          return res;
        } else if (operation === "CreateRetweet") {
          const res = await browser.request("CreateRetweet", {
            tweet_id: "1987547856664993831",
            dark_request: false,
          });
          return res;
        } else if (operation === "FavoriteTweet") {
          const res = await browser.request("FavoriteTweet", {
            tweet_id: "1987547856664993831",
          });
          return res;
        } else if (operation === "SearchTimeline") {
          const res = await browser.request("SearchTimeline", {
            rawQuery: "from:elonmusk",
            count: 20,
            querySource: "typed_query",
            product: "Top",
            withGrokTranslatedBio: false,
          });
          return res;
        } else if (operation === "UsersByRestIds") {
          const res = await browser.request("UsersByRestIds", {
            userIds: ["900282258736545792"],
          });
          return res;
        } else {
          console.log(`Unknown operation: ${operation}`);
        }
      };
      try {
        const res = await request();
        formatLog(res);
      } catch (e) {
        console.error(e);
      }
    }
  } finally {
    await browser.close();
  }
}

await main();
