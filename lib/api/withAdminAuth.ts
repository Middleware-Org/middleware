import { getAdminUser } from "@/lib/auth/server";
import { apiUnauthorized } from "@/lib/api/responses";

type AdminUser = NonNullable<Awaited<ReturnType<typeof getAdminUser>>>;

export function withAdminAuth<TArgs extends unknown[]>(
  handler: (user: AdminUser, ...args: TArgs) => Promise<Response>,
) {
  return async (...args: TArgs): Promise<Response> => {
    const user = await getAdminUser();

    if (!user) {
      return apiUnauthorized();
    }

    return handler(user, ...args);
  };
}
