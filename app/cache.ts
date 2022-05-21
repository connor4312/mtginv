export const appCache = <T>(duration: number, fn: () => Promise<T>) => {
  let previous: { value: Promise<T>; at: number } | undefined;

  return async () => {
    const now = Date.now();
    if (previous && now - previous.at < duration) {
      return previous.value;
    }

    previous = { value: fn(), at: now };

    try {
      return await previous.value;
    } catch (e) {
      previous = undefined;
      throw e;
    }
  };
};
