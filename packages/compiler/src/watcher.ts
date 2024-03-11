// https://gist.github.com/petehunt/bee47e20701329792153453409b1922b
import type { FSWatcher } from "chokidar";
import assert from "node:assert";

interface WatcherFsEvent {
  type: "add" | "unlink" | "change";
  path: string;
}

type WatcherEvent = WatcherFsEvent | { type: "ready" };

function createPromiseSignal<T>() {
  let resolve: undefined | ((value: T) => void);

  let promise = new Promise((r: (value: T) => void) => {
    resolve = r;
  });
  let resolved = false;

  return {
    promise,
    resolve(value: T) {
      assert(!resolved, "already resolved");
      resolved = true;
      resolve!(value);
    },
  };
}

export const createWatcher = (watcher: FSWatcher) => {
  let started = false;
  let ready = false;
  let eventQueue: WatcherEvent[] = [];
  let signal = createPromiseSignal<void>();
  let lastError: Error | null = null;
  function pushEvent(event: WatcherEvent) {
    eventQueue.push(event);
    if (eventQueue.length === 1) {
      signal.resolve();
    }
  }
  async function start() {
    assert(!started, "already started");
    started = true;

    ready = false;

    watcher.on("ready", () => {
      ready = true;
      pushEvent({ type: "ready" });
    });

    watcher.on("add", (path) => {
      if (!ready) {
        return;
      }

      pushEvent({ type: "add", path });
    });

    watcher.on("change", async (path) => {
      pushEvent({ type: "change", path });
    });

    watcher.on("unlink", (path) => {
      pushEvent({ type: "unlink", path });
    });

    watcher.on("error", (err) => {
      lastError = err;
    });
  }
  return async () => {
    if (lastError) {
      let err = lastError;
      lastError = null;
      throw err;
    }

    if (!started) {
      await start();
    }

    if (eventQueue.length === 0) {
      await signal.promise;
    }

    const currentEventQueue = eventQueue;
    eventQueue = [];
    signal = createPromiseSignal();

    return currentEventQueue;
  };
};
