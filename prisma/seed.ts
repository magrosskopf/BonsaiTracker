import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@example.com";
const COMMUNITY_EMAIL = "community@example.com";
const APPROVED_EMAIL = "approved@example.com";
const WAITLIST_EMAIL = "waitlist@example.com";

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

async function main() {
  const [demoUser, communityUser] = await Promise.all([
    upsertSeedUser(DEMO_EMAIL, "Demo Benutzer"),
    upsertSeedUser(COMMUNITY_EMAIL, "Community Tester"),
  ]);

  await prisma.signupAllowlist.upsert({
    where: { email: APPROVED_EMAIL },
    create: {
      email: APPROVED_EMAIL,
      note: "Lokale Baseline-Freigabe fuer Signup-Gating-Smoketests.",
    },
    update: {
      note: "Lokale Baseline-Freigabe fuer Signup-Gating-Smoketests.",
    },
  });

  await prisma.waitlistRequest.upsert({
    where: { email: WAITLIST_EMAIL },
    create: {
      email: WAITLIST_EMAIL,
      status: "PENDING",
      sourceIp: "127.0.0.1",
      userAgent: "local-seed",
    },
    update: {
      status: "PENDING",
      sourceIp: "127.0.0.1",
      userAgent: "local-seed",
    },
  });

  await prisma.signupSlot.updateMany({
    where: {
      email: {
        in: [DEMO_EMAIL, COMMUNITY_EMAIL, APPROVED_EMAIL, WAITLIST_EMAIL],
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
    data: {
      userId: demoUser.id,
      name: "Katsura",
      species: "Ficus microcarpa",
      latinName: "Ficus microcarpa",
      location: "Suedfenster im Wohnzimmer",
      indoorOutdoor: "INDOOR",
      age: 8,
      heightCm: 34,
      widthCm: 24,
      trunkDiameterMm: 28,
      style: "Moyogi",
      ownedSince: new Date("2024-03-15T00:00:00.000Z"),
      acquiredFrom: "Lokale Gärtnerei",
      purchasePriceCents: 4900,
      healthStatus: "GUT",
      developmentStage: "VERFEINERUNG",
      lastRepotDate: new Date("2025-03-02T00:00:00.000Z"),
      nextRepotDue: new Date("2027-03-02T00:00:00.000Z"),
      winterHardiness: "NICHT_WINTERHART",
      sunExposure: "HALBSCHATTEN",
      wateringNotes: "Im Sommer alle 2 bis 3 Tage pruefen.",
      fertilizingNotes: "Von Maerz bis September alle 2 Wochen duengen.",
      pruningNotes: "Neue Triebe nach 6 bis 8 Blaettern auf 2 Blaetter zuruecknehmen.",
      notes: "Lokaler Demo-Bonsai fuer Dashboard-, Detail- und Feed-Smoke-Tests.",
    },
  });

  const demoSubEntry = await prisma.subEntry.create({
    data: {
      bonsaiId: demoBonsai.id,
      date: new Date("2026-06-15T00:00:00.000Z"),
      entryType: "KONTROLLE",
      healthObservation: "GUT",
      performedActions: ["Gegossen", "Gedreht"],
      nextAction: "In einer Woche erneut auf neue Triebe pruefen.",
      reminderDate: new Date("2030-07-10T09:00:00.000Z"),
      notes: "Krone ist kompakt, neue Knospen sichtbar.",
    },
  });

  await prisma.reminder.create({
    data: {
      userId: demoUser.id,
      bonsaiId: demoBonsai.id,
      subEntryId: demoSubEntry.id,
      title: "Wochencheck fuer Katsura",
      reminderDate: new Date("2030-07-10T09:00:00.000Z"),
      status: "PENDING",
    },
  });

  const demoPost = await prisma.post.create({
    data: {
      userId: demoUser.id,
      bonsaiId: demoBonsai.id,
      text: "Der Ficus treibt nach dem Rueckschnitt wieder sauber aus. Feedback zur naechsten Astwahl ist willkommen.",
      postType: "SHOWCASE",
      snapshotName: demoBonsai.name,
      snapshotSpecies: demoBonsai.species,
    },
  });

  const communityBonsai = await prisma.bonsai.create({
    data: {
      userId: communityUser.id,
      name: "Aoi",
      species: "Juniperus procumbens",
      latinName: "Juniperus procumbens",
      location: "Balkon Ostseite",
      indoorOutdoor: "OUTDOOR",
      age: 11,
      heightCm: 29,
      widthCm: 32,
      trunkDiameterMm: 22,
      style: "Shakan",
      ownedSince: new Date("2023-04-09T00:00:00.000Z"),
      healthStatus: "SEHR_GUT",
      developmentStage: "IN_GESTALTUNG",
      sunExposure: "VOLLE_SONNE",
      wateringNotes: "Nur giessen, wenn die obere Schicht anzieht.",
      notes: "Community-Gegenstueck fuer Feed- und Profil-Smoketests.",
    },
  });

  await prisma.post.create({
    data: {
      userId: communityUser.id,
      bonsaiId: communityBonsai.id,
      text: "Aoi steht seit drei Wochen draussen und reagiert stabil auf mehr Sonne.",
      postType: "HELP",
      snapshotName: communityBonsai.name,
      snapshotSpecies: communityBonsai.species,
    },
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
