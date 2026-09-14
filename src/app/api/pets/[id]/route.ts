import { NextResponse } from "next/server";
import { checkAdminAccess, verifyCsrfOrigin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { petProfileSchema } from "@/lib/schemas";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const csrfError = verifyCsrfOrigin(request);
    if (csrfError) return csrfError;

    const { error, session } = await checkAdminAccess();
    if (error) return error;

    const body = await request.json();
    const result = petProfileSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { id } = await params;

    // Verificar slug único excluyendo este mismo ID
    const existing = await prisma.petProfile.findUnique({ where: { slug: result.data.slug } });
    if (existing && existing.id !== id) {
      return NextResponse.json({ error: { fieldErrors: { slug: ["El identificador ya está en uso"] } } }, { status: 400 });
    }

    const updated = await prisma.petProfile.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const csrfError = verifyCsrfOrigin(request);
    if (csrfError) return csrfError;

    const { error } = await checkAdminAccess();
    if (error) return error;
    
    const { id } = await params;

    await prisma.petProfile.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error eliminando perfil:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
