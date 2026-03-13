import { getUser } from "@/lib/auth/server";
import { apiUnauthorized } from "@/lib/api/responses";

type AuthenticatedUser = NonNullable<Awaited<ReturnType<typeof getUser>>>;

export function withAuth<TArgs extends unknown[]>(
  handler: (user: AuthenticatedUser, ...args: TArgs) => Promise<Response>,
) {
  return async (...args: TArgs): Promise<Response> => {
    const user = await getUser();

    if (!user) {
      return apiUnauthorized();
    }

    return handler(user, ...args);
  };
}
