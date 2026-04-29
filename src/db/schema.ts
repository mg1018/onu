import {
  pgTable,
  text,
  timestamp,
  jsonb,
  pgEnum,
  uuid,
  integer,
} from "drizzle-orm/pg-core";

export const caseStatusEnum = pgEnum("case_status", [
  "draft",
  "script_pending",
  "awaiting_approval",
  "approved",
  "rejected",
  "generating_voice",
  "generating_avatar",
  "translating",
  "packaging",
  "delivered",
  "failed",
  "pending_setup",
]);

export const procedureEnum = pgEnum("procedure", [
  "nose",
  "eyes",
  "face_contour",
  "lifting",
  "breast",
  "body",
  "skin",
  "other",
]);

export const clinics = pgTable("clinics", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  heygenAvatarId: text("heygen_avatar_id"),
  elevenlabsVoiceId: text("elevenlabs_voice_id"),
  approverEmail: text("approver_email").notNull(),
  driveFolderId: text("drive_folder_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cases = pgTable("cases", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .references(() => clinics.id)
    .notNull(),
  caseNumber: text("case_number").notNull(),
  patientAlias: text("patient_alias").notNull(),
  procedure: procedureEnum("procedure").notNull(),
  procedureSummary: text("procedure_summary").notNull(),
  patientStory: text("patient_story"),
  beforeImageUrls: jsonb("before_image_urls").$type<string[]>().default([]),
  afterImageUrls: jsonb("after_image_urls").$type<string[]>().default([]),
  consentFormUrl: text("consent_form_url"),
  status: caseStatusEnum("status").notNull().default("draft"),
  workflowRunId: text("workflow_run_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const scripts = pgTable("scripts", {
  id: uuid("id").defaultRandom().primaryKey(),
  caseId: uuid("case_id")
    .references(() => cases.id)
    .notNull(),
  revision: integer("revision").notNull().default(1),
  templateId: text("template_id").notNull(),
  language: text("language").notNull().default("ko"),
  content: text("content").notNull(),
  hook: text("hook").notNull(),
  hashtags: jsonb("hashtags").$type<string[]>().default([]),
  approved: text("approved"),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  approvalToken: text("approval_token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const renders = pgTable("renders", {
  id: uuid("id").defaultRandom().primaryKey(),
  caseId: uuid("case_id")
    .references(() => cases.id)
    .notNull(),
  scriptId: uuid("script_id")
    .references(() => scripts.id)
    .notNull(),
  language: text("language").notNull(),
  platform: text("platform").notNull(),
  videoUrl: text("video_url"),
  captionSrtUrl: text("caption_srt_url"),
  heygenVideoId: text("heygen_video_id"),
  driveFileId: text("drive_file_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pipelineLogs = pgTable("pipeline_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  caseId: uuid("case_id")
    .references(() => cases.id)
    .notNull(),
  stage: text("stage").notNull(),
  level: text("level").notNull().default("info"),
  message: text("message").notNull(),
  payload: jsonb("payload"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Case = typeof cases.$inferSelect;
export type NewCase = typeof cases.$inferInsert;
export type Script = typeof scripts.$inferSelect;
export type Clinic = typeof clinics.$inferSelect;
export type Render = typeof renders.$inferSelect;
