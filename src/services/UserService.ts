import { User } from '@prisma/client';
import { IUserRepository } from '@/interfaces/IUserRepository';
import bcrypt from 'bcryptjs';

export class UserService {
  constructor(private userRepository: IUserRepository) {}

  async getUserById(id: string): Promise<User | null> {
    if (!id) throw new Error('ID is required');
    return await this.userRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (!email) throw new Error('Email is required');
    return await this.userRepository.findByEmail(email);
  }

  async createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    if (!data.email || !data.password) {
      throw new Error('Email and password are required');
    }

    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    return await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });
  }

  async verifyCredentials(email: string, passwordString: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(passwordString, user.password);
    if (!isPasswordValid) return null;

    return user;
  }

  async changePassword(userId: string, newPasswordString: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPasswordString, salt);

    return await this.userRepository.update(userId, {
      password: hashedPassword,
      requiresPasswordChange: false,
    });
  }
}
