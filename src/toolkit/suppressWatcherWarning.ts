const WATCHER_WARNING_NAME = "MaxListenersExceededWarning";
const WATCHER_WARNING_MESSAGE = "Possible EventTarget memory leak detected.";
const WATCHER_WARNING_TARGET = "[FSWatcher]";
const FILTER_FLAG = "__astroShokaxProcessWarningFilterInstalled__";

export function shouldSuppressProcessWarning(
  warning: string | Error,
  typeOrOptions?: string | { type?: string },
): boolean {
  const message = typeof warning === "string" ? warning : warning.message;
  const type =
    typeof warning !== "string"
      ? warning.name
      : typeof typeOrOptions === "string"
        ? typeOrOptions
        : typeOrOptions?.type;

  return (
    type === WATCHER_WARNING_NAME &&
    message.includes(WATCHER_WARNING_MESSAGE) &&
    message.includes(WATCHER_WARNING_TARGET)
  );
}

export function installProcessWarningFilter() {
  const processWithFlag = process as typeof process & {
    [FILTER_FLAG]?: boolean;
  };

  if (processWithFlag[FILTER_FLAG]) {
    return;
  }

  const originalEmitWarning = process.emitWarning.bind(process);

  process.emitWarning = ((warning: string | Error, ...args: unknown[]) => {
    // eslint-disable-next-line no-unsafe-type-assertion
    if (shouldSuppressProcessWarning(warning, args[0] as string | { type?: string } | undefined)) {
      return;
    }

    originalEmitWarning(
      warning,
      // eslint-disable-next-line no-unsafe-type-assertion
      ...(args as Parameters<typeof process.emitWarning> extends [unknown, ...infer Rest]
        ? Rest
        : never),
    );
  }) as typeof process.emitWarning;

  processWithFlag[FILTER_FLAG] = true;
}
