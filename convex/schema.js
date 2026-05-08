import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
    role: v.optional(v.string()),
    team: v.optional(v.string()),
    managerEmail: v.optional(v.string()),
    goals: v.optional(v.array(v.string())),
    aiMode: v.optional(v.string()),
    onboardingComplete: v.boolean(),
    createdAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),
  dailyLogs: defineTable({
    userId: v.id("users"),
    date: v.string(),
    weekKey: v.string(),
    reflection: v.optional(v.string()),
    learned: v.optional(v.string()),
    blockers: v.optional(v.array(v.string())),
    wins: v.optional(v.array(v.string())),
    mood: v.optional(v.number()),
    energy: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_week", ["userId", "weekKey"])
    .index("by_user_date", ["userId", "date"]),
  wins: defineTable({
    userId: v.id("users"),
    title: v.string(),
    detail: v.string(),
    date: v.string(),
    weekKey: v.string(),
    tag: v.string(),
    impact: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_week", ["userId", "weekKey"]),
  tasks: defineTable({
    userId: v.id("users"),
    title: v.string(),
    tag: v.string(),
    due: v.optional(v.string()),
    priority: v.string(),
    status: v.string(),
    blocker: v.optional(v.string()),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"]),
  growthScores: defineTable({
    userId: v.id("users"),
    key: v.string(),
    label: v.string(),
    value: v.number(),
    delta: v.number(),
    color: v.string(),
    series: v.array(v.number()),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
  reviewDrafts: defineTable({
    userId: v.id("users"),
    weekKey: v.string(),
    variant: v.string(),
    dates: v.string(),
    wins: v.string(),
    learnings: v.string(),
    blockers: v.string(),
    next: v.string(),
    status: v.string(),
    sentAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_week_variant", ["userId", "weekKey", "variant"]),
});
