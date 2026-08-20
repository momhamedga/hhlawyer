import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const services = [
  { slug: "criminal", name: "Criminal Law", description: "Legal representation for criminal matters.", sortOrder: 10 },
  { slug: "commercial", name: "Commercial Law", description: "Corporate and commercial legal services.", sortOrder: 20 },
  { slug: "civil", name: "Civil and Family Law", description: "Civil and personal-status legal services.", sortOrder: 30 },
  { slug: "notary", name: "Private Notary", description: "Private notary and document attestation services.", sortOrder: 40 },
  { slug: "taxes", name: "Tax Law", description: "Tax and compliance legal services.", sortOrder: 50 },
];

async function main() {
  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      create: service,
      update: service,
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async () => {
    console.error("Database seed failed.");
    await prisma.$disconnect();
    process.exitCode = 1;
  });
