import { z } from "zod";

export const petProfileSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(50, "El nombre es muy largo"),
  breed: z.string().max(50, "La raza es muy larga").optional(),
  age: z.string().max(30, "La edad es muy larga").optional(),
  photoUrl: z.string().url("URL de foto inválida").optional().or(z.literal('')),
  ownerPhone: z.string().max(20, "Teléfono muy largo").optional(),
  ownerWhatsApp: z.string().max(20, "WhatsApp muy largo").optional(),
  slug: z.string()
    .min(3, "El identificador (slug) debe tener al menos 3 caracteres")
    .max(30, "El identificador es muy largo")
    .regex(/^[a-z0-9-]+$/, "El identificador solo puede contener letras minúsculas, números y guiones")
});

export type PetProfileInput = z.infer<typeof petProfileSchema>;
