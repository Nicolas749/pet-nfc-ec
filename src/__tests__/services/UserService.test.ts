import { UserService } from '@/services/UserService';
import { IUserRepository } from '@/interfaces/IUserRepository';
import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('mockSalt'),
  hash: jest.fn().mockResolvedValue('hashedPassword123'),
  compare: jest.fn(),
}));

describe('UserService', () => {
  let userService: UserService;
  let mockRepository: jest.Mocked<IUserRepository>;

  const mockDate = new Date();
  
  const mockUser: User = {
    id: '1',
    email: 'test@demo.com',
    password: 'hashedPassword123',
    name: 'Test User',
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
    };
    
    userService = new UserService(mockRepository);
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user with a hashed password', async () => {
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockUser);

      const result = await userService.createUser({
        email: 'test@demo.com',
        password: 'plainPassword123',
        name: 'Test User'
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('plainPassword123', 'mockSalt');
      expect(mockRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        email: 'test@demo.com',
        password: 'hashedPassword123',
      }));
      expect(result).toEqual(mockUser);
    });

    it('should throw an error if email already exists', async () => {
      mockRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(userService.createUser({
        email: 'test@demo.com',
        password: 'plainPassword123',
        name: 'Test User'
      })).rejects.toThrow('User with this email already exists');
    });
  });

  describe('verifyCredentials', () => {
    it('should return user if credentials are valid', async () => {
      mockRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await userService.verifyCredentials('test@demo.com', 'plainPassword123');

      expect(bcrypt.compare).toHaveBeenCalledWith('plainPassword123', 'hashedPassword123');
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockRepository.findByEmail.mockResolvedValue(null);

      const result = await userService.verifyCredentials('wrong@demo.com', 'plainPassword123');

      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null if password is invalid', async () => {
      mockRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await userService.verifyCredentials('test@demo.com', 'wrongPassword');

      expect(result).toBeNull();
    });
  });
});
