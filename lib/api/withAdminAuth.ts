import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/server";

type AdminUser = NonNullable<Awaited<ReturnType<typeof getAdminUser>>>;

export function withAdminAuth<TArgs extends unknown[]>(
  handler: (user: AdminUser, ...args: TArgs) => Promise<Response>,
) {
  return async (...args: TArgs): Promise<Response> => {
    const user = await getAdminUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return handler(user, ...args);
  };
}
