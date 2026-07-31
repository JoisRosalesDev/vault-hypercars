export class TimeoutError extends Error {
  status: number;
  constructor(message = "Request execution timed out") {
    super(message);
    this.name = "TimeoutError";
    this.status = 504;
  }
}

/**
 * Wraps an async Promise execution with a timeout limit.
 * If the promise does not resolve within `ms` milliseconds, rejects with a TimeoutError.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms = 9000,
  customErrorMsg = "Operation timed out"
): Promise<T> {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new TimeoutError(customErrorMsg));
    }, ms);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}
