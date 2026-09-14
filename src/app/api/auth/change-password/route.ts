import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/route";
import { UserRepository } from "@/repositories/UserRepository";
import { UserService } from "@/services/UserService";
import { verifyCsrfOrigin } from "@/lib/auth-utils";
import { z } from "zod";

const changePasswordSchema = z.object({
  newPassword: z.string()
    .min(12, "La contraseña debe tener al menos 12 caracteres")
    .regex(/[A-Z]/, "La contraseña debe tener al menos una letra mayúscula")
    .regex(/[0-9]/, "La contraseña debe tener al menos un número")
    .regex(/[^A-Za-z0-9]/, "La contraseña debe tener al menos un símbolo"),
});

export async function POST(request: Request) {
  try {
    const csrfError = verifyCsrfOrigin(request);
    if (csrfError) return csrfError;

    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const result = changePasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const userId = (session.user as any).id;
    const { newPassword } = result.data;

    const userRepository = new UserRepository();
    const userService = new UserService(userRepository);

    await userService.changePassword(userId, newPassword);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error cambiando contraseña:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
