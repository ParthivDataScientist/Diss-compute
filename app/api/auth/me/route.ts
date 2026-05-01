import { getSession } from "@/lib/auth/session";
import { userService } from "@/lib/services/user-service";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json(null, { status: 401 });

  const user = await userService.getUserById(session.userId);
  if (!user || !user.active) return Response.json(null, { status: 401 });

  const { password, ...safeUser } = user;
  void password;
  return Response.json(safeUser);
}
