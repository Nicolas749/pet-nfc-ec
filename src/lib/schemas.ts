import { z } from "zod";

export const petProfileSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(50, "El nombre es muy largo"),
  breed: z.string().max(50, "La raza es muy larga").optional(),
  age: z.string().max(30, "La edad es muy larga").optional(),
  gender: z.string().optional(),
  photoUrl: z.string().url("URL de foto inválida").optional().or(z.literal('')),
  ownerPhone: z.string().max(20, "Teléfono muy largo").optional(),
  ownerWhatsApp: z.string().max(20, "WhatsApp muy largo").optional(),
  isAggressive: z.boolean().optional(),
  allergies: z.string().max(300, "Las alergias son muy largas").optional(),
  medicalNotes: z.string().max(500, "Las notas médicas son muy largas").optional(),
  careNotes: z.string().max(500, "Los cuidados son muy largos").optional(),
  vetName: z.string().max(80, "El nombre de la veterinaria es muy largo").optional(),
  vetPhone: z.string().max(20, "Teléfono de veterinaria muy largo").optional(),
  vetUrl: z.string().url("Enlace de veterinaria inválido").optional().or(z.literal('')),
  slug: z.string().optional(),
});

export type PetProfileInput = z.infer<typeof petProfileSchema>;
