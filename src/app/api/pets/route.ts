import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { petProfileSchema } from "@/lib/schemas";
import { PetRepository } from "@/repositories/PetRepository";
import { PetService } from "@/services/PetService";
import { checkAdminAccess, verifyCsrfOrigin } from "@/lib/auth-utils";

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

    const data = result.data;
    
    // Check if slug is unique using the service
    const existing = await petService.getPetBySlug(data.slug);
    if (existing) {
      return NextResponse.json({ error: { fieldErrors: { slug: ["El identificador ya está en uso"] } } }, { status: 400 });
    }

    const petProfile = await petService.createPet({
      ...data,
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
