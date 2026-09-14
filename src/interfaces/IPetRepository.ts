import { PetProfile } from '@prisma/client';

export interface IPetRepository {
  findById(id: string): Promise<PetProfile | null>;
  findBySlug(slug: string): Promise<PetProfile | null>;
  findAll(): Promise<PetProfile[]>;
  create(data: Omit<PetProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<PetProfile>;
  update(id: string, data: Partial<PetProfile>): Promise<PetProfile>;
  delete(id: string): Promise<PetProfile>;
}
