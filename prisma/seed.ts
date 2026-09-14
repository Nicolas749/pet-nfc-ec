import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',')[0] : 'admin@demo.com';
  
  // Use env password or generate a random one
  const plainPassword = process.env.INITIAL_ADMIN_PASSWORD || Math.random().toString(36).slice(-10);
  
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (existingUser) {
    console.log('Admin user already exists. Skipping seed.');
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(plainPassword, salt);

  await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Admin',
      requiresPasswordChange: true,
    }
  });

  console.log(`\n======================================================`);
  console.log(`Created admin user: ${adminEmail}`);
  if (!process.env.INITIAL_ADMIN_PASSWORD) {
    console.log(`Generated TEMPORARY PASSWORD: ${plainPassword}`);
    console.log(`PLEASE SAVE THIS! You will be forced to change it on first login.`);
  }
  console.log(`======================================================\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
