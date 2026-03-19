/* **************************************************
 * Shared Fetcher
 **************************************************/

export function createFetcher<T>(endpointName: string) {
  return async (url: string): Promise<T> => {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${endpointName}`);
    }

    return res.json();
  };
}
