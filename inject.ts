import {
  INITIAL_STATE_GLOBAL_KEY,
  INITIAL_STATE_PROP_KEY,
  METHOD_MAP,
  OPERATIONS_GLOBAL_KEY,
  REQUEST_FUNC_GLOBAL_KEY,
} from "./consts.js";
import { LooseType } from "./twitter-types.js";

export const SETUP_SCRIPT = `
(async () => {
  if (globalThis.${REQUEST_FUNC_GLOBAL_KEY}) {
    return;
  }
  const __origApply = Function.prototype.apply;
  const client = await new Promise((resolve) => {
    Function.prototype.apply = function (thisArg, argsArray) {
      if (thisArg && typeof thisArg === "object" && thisArg.dispatch === this) {
        resolve(thisArg);
      }
      return __origApply.bind(this)(thisArg, argsArray);
    };
  });
  Function.prototype.apply = __origApply;
  globalThis.${REQUEST_FUNC_GLOBAL_KEY} = (query) => {
    return client.dispatch.apply(client, [query]);
  };
})();
`;

export const INITIAL_STATE_SCRIPT = `
(async () => {
  const init_state_promise = new Promise((resolve) => {
    Object.defineProperty(window, "${INITIAL_STATE_PROP_KEY}", {
      configurable: true,
      enumerable: true,
      get() {
        return undefined;
      },
      set(v) {
        resolve(v);
        Object.defineProperty(window, "${INITIAL_STATE_PROP_KEY}", {
          value: v,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      },
    });
  });

  globalThis.${INITIAL_STATE_GLOBAL_KEY} = init_state_promise;
})();
`;

export const OPERATIONS_SCRIPT = `
(async () => {
  globalThis.${OPERATIONS_GLOBAL_KEY} = [];
  const origCall = Function.prototype.call;
  Function.prototype.call = function (thisArg, ...args) {
    const module = args[0];
    const ret = origCall.bind(this)(thisArg, ...args);
    try {
      const exp = module.exports;
      if (exp.operationName) {
        globalThis.${OPERATIONS_GLOBAL_KEY}.push(exp);
      }
    } catch (_) {}
    return ret;
  };
  await new Promise((resolve) => setTimeout(resolve, 5000));
  Function.prototype.call = origCall;
})();
`;

export type Operation = {
  operationName: string;
  queryId: string;
  operationType: keyof typeof METHOD_MAP;
  metadata: {
    featureSwitches: string[];
    allowFieldToggles: string[];
    fieldToggles: string[];
  };
} & Record<string, LooseType>;

type FeatureSwitchValue = {
  value: boolean;
} & Record<string, LooseType>;

export type InitialState = {
  featureSwitch: {
    defaultConfig: Record<string, FeatureSwitchValue>;
    user: Record<string, FeatureSwitchValue>;
    debug: Record<string, FeatureSwitchValue>;
    customOverrides: Record<string, FeatureSwitchValue>;
  };
} & Record<string, LooseType>;
