import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seedIdentity = {
  demo: {
    email: "demo@example.com",
    name: "Demo Benutzer",
  },
  community: {
    email: "community@example.com",
    name: "Community Tester",
  },
  approved: {
    email: "approved@example.com",
    note: "Lokale Baseline-Freigabe fuer Signup-Gating-Smoketests.",
  },
  waitlist: {
    email: "waitlist@example.com",
    status: "PENDING" as const,
    sourceIp: "127.0.0.1",
    userAgent: "local-seed",
  },
} as const;

const demoReminderDate = new Date("2030-07-10T09:00:00.000Z");

async function upsertSeedUser(email: string, name: string) {
  return prisma.user.upsert({
    where: { email },
    create: {
      email,
      name,
    },
    update: {
      name,
    },
  });
}

function createDemoBonsaiData(userId: number) {
  return {
    userId,
    name: "Katsura",
    species: "Ficus microcarpa",
    latinName: "Ficus microcarpa",
    location: "Suedfenster im Wohnzimmer",
    indoorOutdoor: "INDOOR" as const,
    age: 8,
    heightCm: 34,
    widthCm: 24,
    trunkDiameterMm: 28,
    style: "Moyogi",
    ownedSince: new Date("2024-03-15T00:00:00.000Z"),
    acquiredFrom: "Lokale Gärtnerei",
    purchasePriceCents: 4900,
    healthStatus: "GUT" as const,
    developmentStage: "VERFEINERUNG" as const,
    lastRepotDate: new Date("2025-03-02T00:00:00.000Z"),
    nextRepotDue: new Date("2027-03-02T00:00:00.000Z"),
    winterHardiness: "NICHT_WINTERHART" as const,
    sunExposure: "HALBSCHATTEN" as const,
    wateringNotes: "Im Sommer alle 2 bis 3 Tage pruefen.",
    fertilizingNotes: "Von Maerz bis September alle 2 Wochen duengen.",
    pruningNotes:
      "Neue Triebe nach 6 bis 8 Blaettern auf 2 Blaetter zuruecknehmen.",
    notes: "Lokaler Demo-Bonsai fuer Dashboard-, Detail- und Feed-Smoke-Tests.",
  };
}

function createCommunityBonsaiData(userId: number) {
  return {
    userId,
    name: "Aoi",
    species: "Juniperus procumbens",
    latinName: "Juniperus procumbens",
    location: "Balkon Ostseite",
    indoorOutdoor: "OUTDOOR" as const,
    age: 11,
    heightCm: 29,
    widthCm: 32,
    trunkDiameterMm: 22,
    style: "Shakan",
    ownedSince: new Date("2023-04-09T00:00:00.000Z"),
    healthStatus: "SEHR_GUT" as const,
    developmentStage: "IN_GESTALTUNG" as const,
    sunExposure: "VOLLE_SONNE" as const,
    wateringNotes: "Nur giessen, wenn die obere Schicht anzieht.",
    notes: "Community-Gegenstueck fuer Feed- und Profil-Smoketests.",
  };
}

function createDemoSubEntryData(bonsaiId: number) {
  return {
    bonsaiId,
    date: new Date("2026-06-15T00:00:00.000Z"),
    entryType: "KONTROLLE" as const,
    healthObservation: "GUT" as const,
    performedActions: ["Gegossen", "Gedreht"],
    nextAction: "In einer Woche erneut auf neue Triebe pruefen.",
    reminderDate: demoReminderDate,
    notes: "Krone ist kompakt, neue Knospen sichtbar.",
  };
}

function createDemoReminderData(
  userId: number,
  bonsaiId: number,
  subEntryId: number,
) {
  return {
    userId,
    bonsaiId,
    subEntryId,
    title: "Wochencheck fuer Katsura",
    reminderDate: demoReminderDate,
    status: "PENDING" as const,
  };
}

function createPostData(
  userId: number,
  bonsaiId: number,
  snapshotName: string,
  snapshotSpecies: string,
  text: string,
  postType: "SHOWCASE" | "HELP",
) {
  return {
    userId,
    bonsaiId,
    text,
    postType,
    snapshotName,
    snapshotSpecies,
  };
}

async function main() {
  const [demoUser, communityUser] = await Promise.all([
    upsertSeedUser(seedIdentity.demo.email, seedIdentity.demo.name),
    upsertSeedUser(seedIdentity.community.email, seedIdentity.community.name),
  ]);

  await prisma.signupAllowlist.upsert({
    where: { email: seedIdentity.approved.email },
    create: {
      email: seedIdentity.approved.email,
      note: seedIdentity.approved.note,
    },
    update: {
      note: seedIdentity.approved.note,
    },
  });

  await prisma.waitlistRequest.upsert({
    where: { email: seedIdentity.waitlist.email },
    create: {
      email: seedIdentity.waitlist.email,
      status: seedIdentity.waitlist.status,
      sourceIp: seedIdentity.waitlist.sourceIp,
      userAgent: seedIdentity.waitlist.userAgent,
    },
    update: {
      status: seedIdentity.waitlist.status,
      sourceIp: seedIdentity.waitlist.sourceIp,
      userAgent: seedIdentity.waitlist.userAgent,
    },
  });

  await prisma.signupSlot.updateMany({
    where: {
      email: {
        in: [
          seedIdentity.demo.email,
          seedIdentity.community.email,
          seedIdentity.approved.email,
          seedIdentity.waitlist.email,
        ],
      },
    },
    data: {
      email: null,
      reservedAt: null,
    },
  });

  await prisma.bonsai.deleteMany({
    where: {
      userId: {
        in: [demoUser.id, communityUser.id],
      },
    },
  });

  const demoBonsai = await prisma.bonsai.create({
    data: createDemoBonsaiData(demoUser.id),
  });

  const demoSubEntry = await prisma.subEntry.create({
    data: createDemoSubEntryData(demoBonsai.id),
  });

  await prisma.reminder.create({
    data: createDemoReminderData(demoUser.id, demoBonsai.id, demoSubEntry.id),
  });

  const demoPost = await prisma.post.create({
    data: createPostData(
      demoUser.id,
      demoBonsai.id,
      demoBonsai.name,
      demoBonsai.species,
      "Der Ficus treibt nach dem Rueckschnitt wieder sauber aus. Feedback zur naechsten Astwahl ist willkommen.",
      "SHOWCASE",
    ),
  });

  const communityBonsai = await prisma.bonsai.create({
    data: createCommunityBonsaiData(communityUser.id),
  });

  await prisma.post.create({
    data: createPostData(
      communityUser.id,
      communityBonsai.id,
      communityBonsai.name,
      communityBonsai.species,
      "Aoi steht seit drei Wochen draussen und reagiert stabil auf mehr Sonne.",
      "HELP",
    ),
  });

  await prisma.postLike.create({
    data: {
      postId: demoPost.id,
      userId: communityUser.id,
    },
  });

  await prisma.postComment.create({
    data: {
      postId: demoPost.id,
      userId: communityUser.id,
      text: "Die Verzweigung wirkt schon deutlich ruhiger. Ich wuerde den rechten Ast noch etwas wachsen lassen.",
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
