import { Router, type IRouter } from "express";
import { and, asc, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db, studyRequestMembersTable, studyRequestsTable, usersTable } from "@workspace/db";
import {
  CreateStudyRequestBody,
  CreateStudyRequestResponse,
  GetAnalyticsResponse,
  GetProfileResponse,
  JoinStudyRequestParams,
  JoinStudyRequestResponse,
  ListStudyRequestsQueryParams,
  ListStudyRequestsResponse,
  UpdateProfileBody,
  UpdateProfileResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const CURRENT_USER_ID = 1;

async function ensureCurrentUser() {
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.id, CURRENT_USER_ID));
  if (existing) return existing;

  const [created] = await db
    .insert(usersTable)
    .values({
      name: "Aarav Mehta",
      email: "aarav.mehta@university.edu",
      whatsapp: null,
      course: "Computer Science",
      year: 2,
      subjects: ["Data Structures", "Database Systems", "Web Development"],
      availability: ["Mon · 6–8 PM", "Wed · 5–7 PM", "Sat · 10 AM–1 PM"],
    })
    .returning();
  return created;
}

function contactFor(user: { email: string; whatsapp: string | null }) {
  return user.whatsapp ? `https://wa.me/${user.whatsapp.replace(/\D/g, "")}` : user.email;
}

async function formatRequest(requestId: number) {
  const [row] = await db
    .select({
      id: studyRequestsTable.id,
      subject: studyRequestsTable.subject,
      topic: studyRequestsTable.topic,
      preferredDate: studyRequestsTable.preferredDate,
      preferredTime: studyRequestsTable.preferredTime,
      location: studyRequestsTable.location,
      note: studyRequestsTable.note,
      creatorName: usersTable.name,
      creatorCourse: usersTable.course,
      creatorYear: usersTable.year,
      creatorEmail: usersTable.email,
      creatorWhatsapp: usersTable.whatsapp,
      creatorId: usersTable.id,
    })
    .from(studyRequestsTable)
    .innerJoin(usersTable, eq(studyRequestsTable.creatorId, usersTable.id))
    .where(eq(studyRequestsTable.id, requestId));

  if (!row) return null;

  const [{ memberCount }] = await db
    .select({ memberCount: count() })
    .from(studyRequestMembersTable)
    .where(eq(studyRequestMembersTable.requestId, requestId));
  const [membership] = await db
    .select({ id: studyRequestMembersTable.id })
    .from(studyRequestMembersTable)
    .where(
      and(
        eq(studyRequestMembersTable.requestId, requestId),
        eq(studyRequestMembersTable.userId, CURRENT_USER_ID),
      ),
    );
  const isOwner = row.creatorId === CURRENT_USER_ID;
  const hasJoined = Boolean(membership);

  return {
    id: row.id,
    subject: row.subject,
    topic: row.topic,
    preferredDate: row.preferredDate,
    preferredTime: row.preferredTime,
    location: row.location as "campus" | "online",
    note: row.note,
    creatorName: row.creatorName,
    creatorCourse: row.creatorCourse,
    creatorYear: row.creatorYear,
    joinedCount: Number(memberCount),
    hasJoined,
    isOwner,
    contactInfo: isOwner || hasJoined ? contactFor({ email: row.creatorEmail, whatsapp: row.creatorWhatsapp }) : null,
  };
}

router.get("/profile", async (_req, res): Promise<void> => {
  const profile = await ensureCurrentUser();
  res.json(GetProfileResponse.parse({
    id: profile.id,
    name: profile.name,
    email: profile.email,
    whatsapp: profile.whatsapp,
    course: profile.course,
    year: profile.year,
    subjects: profile.subjects,
    availability: profile.availability,
  }));
});

router.patch("/profile", async (req, res): Promise<void> => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await ensureCurrentUser();
  const [profile] = await db
    .update(usersTable)
    .set(parsed.data)
    .where(eq(usersTable.id, CURRENT_USER_ID))
    .returning();
  res.json(UpdateProfileResponse.parse({
    id: profile.id,
    name: profile.name,
    email: profile.email,
    whatsapp: profile.whatsapp,
    course: profile.course,
    year: profile.year,
    subjects: profile.subjects,
    availability: profile.availability,
  }));
});

router.get("/requests", async (req, res): Promise<void> => {
  const parsed = ListStudyRequestsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  await ensureCurrentUser();

  const rows = await db
    .select({ id: studyRequestsTable.id })
    .from(studyRequestsTable)
    .innerJoin(usersTable, eq(studyRequestsTable.creatorId, usersTable.id))
    .orderBy(desc(studyRequestsTable.createdAt));

  const formatted = (await Promise.all(rows.map((row) => formatRequest(row.id)))).filter(Boolean);
  const filters = parsed.data;
  const search = filters.search?.trim().toLowerCase();
  const filterDate = filters.date?.toISOString().slice(0, 10);
  const result = formatted.filter((item) => {
    if (!item) return false;
    const matchesSearch = !search || [item.subject, item.topic, item.note].some((value) => value.toLowerCase().includes(search));
    const matchesSubject = !filters.subject || item.subject === filters.subject;
    const matchesDate = !filterDate || item.preferredDate === filterDate;
    const matchesLocation = !filters.location || item.location === filters.location;
    return matchesSearch && matchesSubject && matchesDate && matchesLocation;
  });

  res.json(ListStudyRequestsResponse.parse(result));
});

router.post("/requests", async (req, res): Promise<void> => {
  const parsed = CreateStudyRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  await ensureCurrentUser();
  const [created] = await db
    .insert(studyRequestsTable)
    .values({
      ...parsed.data,
      preferredDate: parsed.data.preferredDate.toISOString().slice(0, 10),
      creatorId: CURRENT_USER_ID,
    })
    .returning({ id: studyRequestsTable.id });
  const request = await formatRequest(created.id);
  res.status(201).json(CreateStudyRequestResponse.parse(request));
});

router.post("/requests/:id/join", async (req, res): Promise<void> => {
  const params = JoinStudyRequestParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await ensureCurrentUser();
  const [request] = await db.select({ id: studyRequestsTable.id }).from(studyRequestsTable).where(eq(studyRequestsTable.id, params.data.id));
  if (!request) {
    res.status(404).json({ error: "Study request not found" });
    return;
  }

  await db
    .insert(studyRequestMembersTable)
    .values({ requestId: params.data.id, userId: CURRENT_USER_ID })
    .onConflictDoNothing();
  res.json(JoinStudyRequestResponse.parse(await formatRequest(params.data.id)));
});

router.get("/analytics", async (_req, res): Promise<void> => {
  await ensureCurrentUser();
  const [{ totalRequests }] = await db.select({ totalRequests: count() }).from(studyRequestsTable);
  const [{ totalMembers }] = await db.select({ totalMembers: count() }).from(studyRequestMembersTable);
  const today = new Date().toISOString().slice(0, 10);
  const [{ activeToday }] = await db
    .select({ activeToday: count() })
    .from(studyRequestsTable)
    .where(sql`${studyRequestsTable.preferredDate} >= ${today}`);
  const popularSubjects = await db
    .select({ label: studyRequestsTable.subject, count: count() })
    .from(studyRequestsTable)
    .groupBy(studyRequestsTable.subject)
    .orderBy(desc(count()), asc(studyRequestsTable.subject))
    .limit(6);
  const busySlots = await db
    .select({ label: studyRequestsTable.preferredTime, count: count() })
    .from(studyRequestsTable)
    .groupBy(studyRequestsTable.preferredTime)
    .orderBy(desc(count()), asc(studyRequestsTable.preferredTime))
    .limit(6);

  res.json(GetAnalyticsResponse.parse({
    totalRequests: Number(totalRequests),
    totalMembers: Number(totalMembers),
    activeToday: Number(activeToday),
    popularSubjects: popularSubjects.map((item) => ({ label: item.label, count: Number(item.count) })),
    busySlots: busySlots.map((item) => ({ label: item.label, count: Number(item.count) })),
  }));
});

export default router;