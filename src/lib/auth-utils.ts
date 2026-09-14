import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function checkAdminAccess() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || !session.user.email || !(session.user as any).id) {
    return { error: NextResponse.json({ error: "No autorizado" }, { status: 401 }), session: null };
  }

  const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : ['admin@demo.com'];
  if (!adminEmails.includes(session.user.email)) {
    return { error: NextResponse.json({ error: "Prohibido - Se requiere rol de administrador" }, { status: 403 }), session: null };
  }

  return { error: null, session };
}

export function verifyCsrfOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  
  if (origin && host) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host !== host) {
         return NextResponse.json({ error: "Invalid Origin" }, { status: 403 });
      }
    } catch {
       return NextResponse.json({ error: "Invalid Origin Header" }, { status: 403 });
    }
  }
  return null;
}
