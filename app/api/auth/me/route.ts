import { getSession } from "@/lib/auth/session";
import { getUserById } from "@/lib/auth/users";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json(null, { status: 401 });

  const user = getUserById(session.userId);
  if (!user || !user.active) return Response.json(null, { status: 401 });

  // Never expose password
  const { password: _, ...safeUser } = user;
  return Response.json(safeUser);
}
