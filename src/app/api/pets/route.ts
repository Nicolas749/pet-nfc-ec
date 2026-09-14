import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { petProfileSchema } from "@/lib/schemas";
import { PetRepository } from "@/repositories/PetRepository";
import { PetService } from "@/services/PetService";
import { prisma } from "@/lib/prisma"; // Needed just for the dummy user logic

const petRepository = new PetRepository();
const petService = new PetService(petRepository);

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

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

    // Ensure the dummy admin user exists in the database
    // (This part should ideally be in a UserService, but keeping it here for MVP simplicity)
    await prisma.user.upsert({
      where: { id: "1" },
      update: {},
      create: {
        id: "1",
        email: "admin@demo.com",
        password: "admin123",
        name: "Admin",
      }
    });

    const petProfile = await petService.createPet({
      ...data,
      userId: "1", 
    });

    return NextResponse.json(petProfile, { status: 201 });
  } catch (error) {
    console.error("Error creando perfil:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const pets = await petService.getAllPets();

    return NextResponse.json(pets);
  } catch (error) {
    console.error("Error obteniendo perfiles:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
