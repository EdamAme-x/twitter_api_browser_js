/**
 * Twitter API Browser for JavaScript
 * @module
 * @exports TwitterAPIBrowser
 */
import * as fs from "node:fs";
import {
  INITIAL_STATE_SCRIPT,
  OPERATIONS_SCRIPT,
  SETUP_SCRIPT,
} from "./inject.ts";
import {
  DEFAULT_USER_DATA_DIR,
  INITIAL_STATE_GLOBAL_KEY,
  METHOD_MAP,
  OPERATIONS_GLOBAL_KEY,
  REQUEST_FUNC_GLOBAL_KEY,
} from "./consts.ts";
import { type BrowserContext, chromium, type Page } from "playwright";
import { pickFirstItem, removeNullRecursively, sleep } from "./utils.ts";
import type { LooseType } from "@evex/loose-types";
import type { InitialState, Operation } from "./inject.ts";

/**
 * @classdesc Base class for operating Twitter API Browser
 */
export class TwitterAPIBrowser {
  /**
   * @description Constructor for TwitterAPIBrowser.
   * @param userDataDir - The directory to store the user data for the browser (example: "./.user_data")
   */
  constructor(private readonly userDataDir: string = DEFAULT_USER_DATA_DIR) {
    if (!fs.existsSync(userDataDir)) {
      fs.mkdirSync(userDataDir, { recursive: true });
    }
  }

  private browser: BrowserContext | undefined;
  private page: Page | undefined;

  private operations: Operation[] | undefined;
  private initialState: InitialState | undefined;

  /**
   * @description Launches a new browser context and page, and then injects scripts.
   * @param waitForReady - The number of seconds to wait for the browser to be ready.
   */
  public async setup(waitForReady: number = 5): Promise<void> {
    const {
      resolve,
      reject,
      promise: browserPromise,
    } = Promise.withResolvers<BrowserContext>();

    chromium
      .launchPersistentContext(this.userDataDir, {
        headless: false,
        viewport: null,
        args: [
          "--disable-blink-features=AutomationControlled",
          "--no-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
        ],
      })
      .then(resolve)
      .catch(reject);

    const raceResult = await Promise.race([
      browserPromise,
      sleep(waitForReady * 1000, new Error("Browser launch timed out")),
    ]);

    if (raceResult instanceof Error) {
      throw raceResult;
    }

    this.browser = raceResult;
    console.log("Browser Created!!");

    this.page = await this.browser.newPage();
    console.log("Page Created");

    await this.page.addInitScript(SETUP_SCRIPT);
    await this.page.addInitScript(OPERATIONS_SCRIPT);
    await this.page.addInitScript(INITIAL_STATE_SCRIPT);
    await this.page.goto("https://x.com/home");
    console.log("Page Initialized");
    await sleep(waitForReady * 1000);
    this.operations = await this.page.evaluate(
      `globalThis.${OPERATIONS_GLOBAL_KEY}`
    );
    this.initialState = await this.page.evaluate(
      `globalThis.${INITIAL_STATE_GLOBAL_KEY}`
    );
  }

  /**
   * @description Closes the browser context and page.
   */
  public async close(): Promise<void> {
    if (this.browser && this.page) {
      await this.page.close();
      await this.browser.close();
    }

    // NOTE: Patch memory leak
    this.browser = undefined;
    this.page = undefined;
  }

  [Symbol.asyncDispose] = this.close;

  /**
   * @description Manually login to Twitter.
   */
  public async manualLogin(): Promise<void> {
    if (!this.page) {
      throw new Error("Maybe you forgot to call setup()?");
    }

    await this.page.goto("https://x.com/login");
    await sleep(1000);
    // NOTE: Wait for the page to load the home page after login
    await this.page.waitForURL("https://x.com/home", {
      timeout: 0,
    });
  }

  /**
   * @description Send a GraphQL request to the Twitter API
   * @param method - The method of the request
   * @param path - The path of the request
   * @param body - The body of the request
   * @returns Response of the request
   */
  public async graphql(
    method: string,
    path: string,
    body: LooseType
  ): Promise<Response> {
    if (!this.page) {
      throw new Error("Maybe you forgot to call setup()?");
    }

    const args = {
      headers: {
        "Content-Type": "application/json",
      },
      method,
      path,
      params: null as Record<string, string> | null,
      data: null as typeof body | null,
    };

    if (method === "GET") {
      const params = Object.fromEntries(
        Object.entries(body).map(([k, v]) => [k, JSON.stringify(v)])
      );
      args["params"] = params;
    } else if (method === "POST") {
      args["data"] = body;
    }

    console.log("SETUP_SCRIPT");

    await this.page.evaluate(SETUP_SCRIPT);

    console.log("args", JSON.stringify(removeNullRecursively(args)));
    await sleep(500);
    const response = await this.page.evaluate(
      `globalThis.${REQUEST_FUNC_GLOBAL_KEY}(${JSON.stringify(
        removeNullRecursively(args)
      )})`
    );

    console.log("response", response);

    if (!(response instanceof Response)) {
      throw new Error(`Unexpected result from '${REQUEST_FUNC_GLOBAL_KEY}'`);
    }

    return response;
  }

  /**
   * Sends a request to the Twitter API
   * @param operationName - The name of the operation to request
   * @param variables - The variables to pass to the operation
   * @param fieldToggles - The fields to toggle on or off in the operation
   * @returns Response of the request
   */
  public async request(
    operationName: string,
    variables: LooseType,
    fieldToggles: Record<string, boolean> = {}
  ) {
    if (!this.page || !this.operations) {
      throw new Error("Maybe you forgot to call setup()?");
    }

    const exp = pickFirstItem(
      this.operations.filter((x) => x.operationName === operationName) ?? [],
      "operation"
    );

    if (exp instanceof Error) {
      throw exp;
    }

    const queryId = exp.queryId;
    const operationType = exp.operationType;
    const featureSwitches = exp.metadata.featureSwitches;
    const allowFieldToggles = exp.metadata.allowFieldToggles;
    const fieldToggle = {} as Record<string, boolean>;

    for (const [k, v] of Object.entries(fieldToggles)) {
      if (allowFieldToggles.includes(k)) {
        fieldToggle[k] = v;
      }
    }

    const method = METHOD_MAP[operationType];

    const featureSwitch = {
      ...this.initialState?.featureSwitch?.defaultConfig,
      ...this.initialState?.featureSwitch?.user,
      ...this.initialState?.featureSwitch?.debug,
      ...this.initialState?.featureSwitch?.customOverrides,
    };

    const featureSwitchesMap = Object.fromEntries(
      Object.entries(featureSwitch).filter(([k]) => featureSwitches.includes(k))
    );

    const body = {
      variables: variables,
      queryId: queryId,
      features: null as null | typeof featureSwitchesMap,
      fieldToggle: null as null | typeof fieldToggle,
    };

    if (featureSwitchesMap) {
      body.features = featureSwitchesMap;
    }

    if (fieldToggle) {
      body.fieldToggle = fieldToggle;
    }

    return await this.graphql(
      method,
      `/graphql/${queryId}/${operationName}`,
      body
    );
  }
}
