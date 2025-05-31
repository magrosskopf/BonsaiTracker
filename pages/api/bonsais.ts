import { PrismaClient } from '../../prisma/generated/prisma-client'; // Use the Prisma client

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    const bonsais = await prisma.bonsai.findMany();
    res.status(200).json(bonsais);
  } catch (error) {
    console.error('Error fetching bonsais:', error);
    res.status(500).json({ error: 'Failed to fetch bonsais' });
  } finally {
    await prisma.$disconnect();
  }
}
