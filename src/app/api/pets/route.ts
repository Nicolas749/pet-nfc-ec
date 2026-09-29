import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { petProfileSchema } from "@/lib/schemas";
import { PetRepository } from "@/repositories/PetRepository";
import { PetService } from "@/services/PetService";
import { checkAdminAccess, verifyCsrfOrigin } from "@/lib/auth-utils";
import { randomBytes } from "crypto";

const petRepository = new PetRepository();
const petService = new PetService(petRepository);

export async function POST(request: Request) {
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

    const { slug, ...data } = result.data;
    
    // Auto-generar slug robusto usando el nombre y un short-uuid
    const baseSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const shortId = randomBytes(3).toString("hex"); // 6 caracteres
    const generatedSlug = `${baseSlug ? baseSlug + '-' : ''}${shortId}`;

    // Verificación por precaución (prácticamente imposible que colisione)
    const existing = await petService.getPetBySlug(generatedSlug);
    if (existing) {
      return NextResponse.json({ error: { fieldErrors: { slug: ["Error de generación de ID. Intente de nuevo."] } } }, { status: 400 });
    }

    const petProfile = await petService.createPet({
      ...data,
      slug: generatedSlug,
      breed: data.breed ?? null,
      age: data.age ?? null,
      gender: data.gender ?? null,
      photoUrl: data.photoUrl ?? null,
      ownerPhone: data.ownerPhone ?? null,
      ownerWhatsApp: data.ownerWhatsApp ?? null,
      userId: (session.user as any).id, 
    });

    return NextResponse.json(petProfile, { status: 201 });
  } catch (error) {
    console.error("Error creando perfil:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { error } = await checkAdminAccess();
    if (error) return error;

    const pets = await petService.getAllPets();

    return NextResponse.json(pets);
  } catch (error) {
    console.error("Error obteniendo perfiles:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
