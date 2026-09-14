import { PetProfile } from '@prisma/client';
import { IPetRepository } from '@/interfaces/IPetRepository';

export class PetService {
  constructor(private petRepository: IPetRepository) {}

  async getPetById(id: string): Promise<PetProfile | null> {
    if (!id) {
      throw new Error('ID is required');
    }
    return await this.petRepository.findById(id);
  }

  async getPetBySlug(slug: string): Promise<PetProfile | null> {
    if (!slug) {
      throw new Error('Slug is required');
    }
    return await this.petRepository.findBySlug(slug);
  }

  async getAllPets(): Promise<PetProfile[]> {
    return await this.petRepository.findAll();
  }

  async createPet(data: Omit<PetProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<PetProfile> {
    if (!data.name || !data.slug || !data.userId) {
      throw new Error('Missing required fields for PetProfile creation');
    }
    
    const existingPet = await this.petRepository.findBySlug(data.slug);
    if (existingPet) {
      throw new Error('A pet with this slug already exists');
    }

    return await this.petRepository.create(data);
  }

  async updatePet(id: string, data: Partial<PetProfile>): Promise<PetProfile> {
    if (!id) {
      throw new Error('ID is required for update');
    }

    const existingPet = await this.petRepository.findById(id);
    if (!existingPet) {
      throw new Error('Pet not found');
    }

    return await this.petRepository.update(id, data);
  }

  async deletePet(id: string): Promise<PetProfile> {
    if (!id) {
      throw new Error('ID is required for deletion');
    }

    const existingPet = await this.petRepository.findById(id);
    if (!existingPet) {
      throw new Error('Pet not found');
    }

    return await this.petRepository.delete(id);
  }
}
