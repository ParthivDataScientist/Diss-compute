import { PrismaClient, ActivityType, LeadStatus, Priority, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const statusMap: Record<string, LeadStatus> = {
  Hot: LeadStatus.HOT,
  Warm: LeadStatus.WARM,
  Cold: LeadStatus.COLD,
  Won: LeadStatus.WON,
  Lost: LeadStatus.LOST
};

const priorityMap: Record<string, Priority> = {
  High: Priority.HIGH,
  Medium: Priority.MEDIUM,
  Low: Priority.LOW
};

async function main() {
  const sources = ["Walk-in", "WhatsApp", "Instagram", "Referral", "Website"];
  const brands = ["Dell", "HP", "Lenovo", "Asus", "Acer", "Apple"];
  const salespeople = ["Asha Nair", "Rohan Mehta", "Imran Khan", "Neha Kapoor"];

  await Promise.all(sources.map((name) => prisma.leadSource.upsert({ where: { name }, update: {}, create: { name } })));
  await Promise.all(brands.map((name) => prisma.brand.upsert({ where: { name }, update: {}, create: { name } })));

  const users = await Promise.all(
    salespeople.map((name) =>
      prisma.user.upsert({
        where: { email: `${name.toLowerCase().replaceAll(" ", ".")}@circuitcrm.local` },
        update: {},
        create: {
          name,
          email: `${name.toLowerCase().replaceAll(" ", ".")}@circuitcrm.local`,
          role: UserRole.SALESPERSON
        }
      })
    )
  );

  const manager = await prisma.user.upsert({
    where: { email: "manager@circuitcrm.local" },
    update: {},
    create: { name: "Store Manager", email: "manager@circuitcrm.local", role: UserRole.MANAGER }
  });

  const leadSeeds = [
    ["Vikram Sharma", "+91 98765 44120", "Dell", "Inspiron 14", 68000, "Office", "Hot", "High", "Asha Nair", "WhatsApp", "2026-04-21"],
    ["Nisha Rao", "+91 99880 11224", "Lenovo", "IdeaPad Slim 5", 59000, "Student", "Warm", "Medium", "Rohan Mehta", "Walk-in", "2026-04-23"],
    ["Arjun Patel", "+91 90112 33088", "Asus", "ROG Strix G16", 145000, "Gaming", "Hot", "High", "Imran Khan", "Instagram", "2026-04-22"],
    ["Meera Iyer", "+91 77660 11990", "Apple", "MacBook Air M3", 118000, "Design", "Won", "Medium", "Neha Kapoor", "Referral", "2026-04-26"]
  ] as const;

  for (const [customerName, phone, brandName, modelName, budget, useCase, status, priority, salespersonName, sourceName, followUpDate] of leadSeeds) {
    const salesperson = users.find((user) => user.name === salespersonName) ?? manager;
    const brand = await prisma.brand.findUniqueOrThrow({ where: { name: brandName } });
    const source = await prisma.leadSource.findUniqueOrThrow({ where: { name: sourceName } });
    const model = await prisma.productModel.upsert({
      where: { brandId_name: { brandId: brand.id, name: modelName } },
      update: {},
      create: { brandId: brand.id, name: modelName }
    });

    const lead = await prisma.lead.create({
      data: {
        customerName,
        phone,
        brandId: brand.id,
        productModelId: model.id,
        brandInterested: brandName,
        laptopModel: modelName,
        budget,
        useCase,
        preferredSpecs: "16 GB RAM, 512 GB SSD preferred",
        status: statusMap[status],
        priority: priorityMap[priority],
        salespersonId: salesperson.id,
        leadSourceId: source.id,
        nextFollowUpDate: new Date(`${followUpDate}T10:00:00.000Z`),
        lastNotePreview: "Seeded demo lead ready for CRM testing."
      }
    });

    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        authorId: salesperson.id,
        type: ActivityType.NOTE,
        title: "Initial lead note",
        body: "Customer requirement captured during demo seed."
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
