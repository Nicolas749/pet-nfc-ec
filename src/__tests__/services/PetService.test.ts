import { PetService } from '@/services/PetService';
import { IPetRepository } from '@/interfaces/IPetRepository';
import { PetProfile } from '@prisma/client';

describe('PetService', () => {
  let petService: PetService;
  let mockRepository: jest.Mocked<IPetRepository>;

  const mockDate = new Date();
  
  const mockPet: PetProfile = {
    id: '1',
    slug: 'firulais',
    name: 'Firulais',
    breed: 'Golden Retriever',
    age: '2',
    photoUrl: null,
    ownerPhone: '123456789',
    ownerWhatsApp: null,
    userId: '1',
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    
    petService = new PetService(mockRepository);
  });

  describe('getPetById', () => {
    it('should return a pet when id exists', async () => {
      mockRepository.findById.mockResolvedValue(mockPet);
      const result = await petService.getPetById('1');
      expect(result).toEqual(mockPet);
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should throw an error when id is empty', async () => {
      await expect(petService.getPetById('')).rejects.toThrow('ID is required');
    });
  });

  describe('createPet', () => {
    const newPetData = {
      slug: 'nuevo-firulais',
      name: 'Nuevo Firulais',
      breed: 'Pug',
      age: '1',
      photoUrl: null,
      ownerPhone: '987654321',
      ownerWhatsApp: null,
      userId: '1',
    };

    it('should create a pet successfully', async () => {
      mockRepository.findBySlug.mockResolvedValue(null); // Slug is available
      mockRepository.create.mockResolvedValue({ ...newPetData, id: '2', createdAt: mockDate, updatedAt: mockDate });
      
      const result = await petService.createPet(newPetData);
      
      expect(result).toHaveProperty('id', '2');
      expect(mockRepository.create).toHaveBeenCalledWith(newPetData);
    });

    it('should throw an error if slug already exists', async () => {
      mockRepository.findBySlug.mockResolvedValue(mockPet);
      
      await expect(petService.createPet(newPetData)).rejects.toThrow('A pet with this slug already exists');
    });

    it('should throw an error if missing required fields', async () => {
      const invalidPetData = { ...newPetData, name: '' }; // missing name
      await expect(petService.createPet(invalidPetData)).rejects.toThrow('Missing required fields for PetProfile creation');
    });
  });
});
