import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prismaClientSingleton = () => {
  return new PrismaClient({ adapter });
};
const globalForPrisma = globalThis as typeof globalThis & {
  prismaGlobal?: ReturnType<typeof prismaClientSingleton>;
};
const prisma = globalForPrisma.prismaGlobal ?? prismaClientSingleton();
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaGlobal = prisma;
}
export default prisma;
