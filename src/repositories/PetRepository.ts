import { PetProfile } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { IPetRepository } from '@/interfaces/IPetRepository';

export class PetRepository implements IPetRepository {
  async findById(id: string): Promise<PetProfile | null> {
    return await prisma.petProfile.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string): Promise<PetProfile | null> {
    return await prisma.petProfile.findUnique({
      where: { slug },
    });
  }

  async findAll(): Promise<PetProfile[]> {
    return await prisma.petProfile.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: Omit<PetProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<PetProfile> {
    return await prisma.petProfile.create({
      data,
    });
  }

  async update(id: string, data: Partial<PetProfile>): Promise<PetProfile> {
    return await prisma.petProfile.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<PetProfile> {
    return await prisma.petProfile.delete({
      where: { id },
    });
  }
}
