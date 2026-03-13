import { createClient } from "redis";

type RedisClient = ReturnType<typeof createClient>;

const REDIS_CLIENT_SYMBOL = Symbol.for("middleware.redis.client");
const REDIS_CONNECT_PROMISE_SYMBOL = Symbol.for("middleware.redis.connectPromise");

type GlobalWithRedis = typeof globalThis & {
  [REDIS_CLIENT_SYMBOL]?: RedisClient;
  [REDIS_CONNECT_PROMISE_SYMBOL]?: Promise<RedisClient | null>;
};

export async function getRedisClient(): Promise<RedisClient | null> {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    return null;
  }

  const globalWithRedis = globalThis as GlobalWithRedis;

  if (globalWithRedis[REDIS_CLIENT_SYMBOL]?.isOpen) {
    return globalWithRedis[REDIS_CLIENT_SYMBOL];
  }

  if (globalWithRedis[REDIS_CONNECT_PROMISE_SYMBOL]) {
    return globalWithRedis[REDIS_CONNECT_PROMISE_SYMBOL];
  }

  globalWithRedis[REDIS_CONNECT_PROMISE_SYMBOL] = (async () => {
    try {
      const client = createClient({ url: redisUrl });
      client.on("error", (error) => {
        console.error("Redis client error", error);
      });

      await client.connect();
      globalWithRedis[REDIS_CLIENT_SYMBOL] = client;
      return client;
    } catch (error) {
      console.error("Failed to connect Redis client", error);
      return null;
    } finally {
      globalWithRedis[REDIS_CONNECT_PROMISE_SYMBOL] = undefined;
    }
  })();

  return globalWithRedis[REDIS_CONNECT_PROMISE_SYMBOL] ?? null;
}
