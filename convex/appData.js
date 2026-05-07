import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

async function currentUser(ctx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();
}

function scoreFromInputs(wins, logs, tasks, scores) {
  if (scores.length) {
    return Math.round(scores.reduce((sum, s) => sum + s.value, 0) / scores.length);
  }
  const winPoints = Math.min(45, wins.length * 8);
  const logPoints = Math.min(30, logs.length * 5);
  const donePoints = Math.min(20, tasks.filter((t) => t.status === "done").length * 4);
  const blockerPenalty = Math.min(20, tasks.filter((t) => t.status === "blocked").length * 5);
  return Math.max(0, Math.min(100, 20 + winPoints + logPoints + donePoints - blockerPenalty));
}

function weekDates(weekKey, docs) {
  const draft = docs.find((d) => d.dates);
  if (draft) return draft.dates;
  return weekKey;
}

export const listWins = query({
  args: {},
  handler: async (ctx) => {
    const user = await currentUser(ctx);
    if (!user) return [];
    return ctx.db.query("wins").withIndex("by_user", (q) => q.eq("userId", user._id)).collect();
  },
});

export const listTasks = query({
  args: {},
  handler: async (ctx) => {
    const user = await currentUser(ctx);
    if (!user) return [];
    return ctx.db.query("tasks").withIndex("by_user", (q) => q.eq("userId", user._id)).collect();
  },
});

export const listGrowthScores = query({
  args: {},
  handler: async (ctx) => {
    const user = await currentUser(ctx);
    if (!user) return [];
    return ctx.db.query("growthScores").withIndex("by_user", (q) => q.eq("userId", user._id)).collect();
  },
});

export const listDailyLogs = query({
  args: {},
  handler: async (ctx) => {
    const user = await currentUser(ctx);
    if (!user) return [];
    return ctx.db.query("dailyLogs").withIndex("by_user", (q) => q.eq("userId", user._id)).collect();
  },
});

export const listReviewDrafts = query({
  args: {},
  handler: async (ctx) => {
    const user = await currentUser(ctx);
    if (!user) return [];
    return ctx.db.query("reviewDrafts").withIndex("by_user", (q) => q.eq("userId", user._id)).collect();
  },
});

export const listReports = query({
  args: {},
  handler: async (ctx) => {
    const user = await currentUser(ctx);
    if (!user) return [];

    const [wins, tasks, logs, scores, drafts] = await Promise.all([
      ctx.db.query("wins").withIndex("by_user", (q) => q.eq("userId", user._id)).collect(),
      ctx.db.query("tasks").withIndex("by_user", (q) => q.eq("userId", user._id)).collect(),
      ctx.db.query("dailyLogs").withIndex("by_user", (q) => q.eq("userId", user._id)).collect(),
      ctx.db.query("growthScores").withIndex("by_user", (q) => q.eq("userId", user._id)).collect(),
      ctx.db.query("reviewDrafts").withIndex("by_user", (q) => q.eq("userId", user._id)).collect(),
    ]);

    const weekKeys = new Set([
      ...wins.map((w) => w.weekKey),
      ...logs.map((l) => l.weekKey),
      ...drafts.map((d) => d.weekKey),
    ]);

    return Array.from(weekKeys).sort().reverse().map((weekKey) => {
      const weekWins = wins.filter((w) => w.weekKey === weekKey);
      const weekLogs = logs.filter((l) => l.weekKey === weekKey);
      const weekTasks = tasks;
      const weekDrafts = drafts.filter((d) => d.weekKey === weekKey);
      const blockerCount = weekTasks.filter((t) => t.status === "blocked").length +
        weekLogs.reduce((sum, log) => sum + (log.blockers?.length || 0), 0);
      const learningCount = weekLogs.filter((log) => Boolean(log.learned)).length;
      const sentDraft = weekDrafts.find((d) => d.status === "sent");
      return {
        week: weekKey,
        weekKey,
        dates: weekDates(weekKey, weekDrafts),
        score: scoreFromInputs(weekWins, weekLogs, weekTasks, scores),
        wins: weekWins.length,
        learnings: learningCount,
        blockers: blockerCount,
        status: sentDraft ? "Sent" : weekDrafts.length ? "Draft" : "Computed",
        date: weekDrafts[0]?.updatedAt ? new Date(weekDrafts[0].updatedAt).toLocaleDateString() : "",
      };
    });
  },
});

export const saveReviewDraft = mutation({
  args: {
    weekKey: v.string(),
    variant: v.string(),
    dates: v.string(),
    wins: v.string(),
    learnings: v.string(),
    blockers: v.string(),
    next: v.string(),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await currentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("reviewDrafts")
      .withIndex("by_user_week_variant", (q) =>
        q.eq("userId", user._id).eq("weekKey", args.weekKey).eq("variant", args.variant)
      )
      .unique();
    const now = Date.now();
    const patch = {
      dates: args.dates,
      wins: args.wins,
      learnings: args.learnings,
      blockers: args.blockers,
      next: args.next,
      status: args.status || "draft",
      updatedAt: now,
    };
    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }
    return ctx.db.insert("reviewDrafts", {
      userId: user._id,
      weekKey: args.weekKey,
      variant: args.variant,
      ...patch,
      createdAt: now,
    });
  },
});

export const sendReviewDraft = mutation({
  args: {
    weekKey: v.string(),
    variant: v.string(),
    dates: v.string(),
    wins: v.string(),
    learnings: v.string(),
    blockers: v.string(),
    next: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await currentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("reviewDrafts")
      .withIndex("by_user_week_variant", (q) =>
        q.eq("userId", user._id).eq("weekKey", args.weekKey).eq("variant", args.variant)
      )
      .unique();
    const now = Date.now();
    const patch = {
      dates: args.dates,
      wins: args.wins,
      learnings: args.learnings,
      blockers: args.blockers,
      next: args.next,
      status: "sent",
      sentAt: now,
      updatedAt: now,
    };
    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }
    return ctx.db.insert("reviewDrafts", {
      userId: user._id,
      weekKey: args.weekKey,
      variant: args.variant,
      ...patch,
      createdAt: now,
    });
  },
});

export const updateTaskStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.string(),
    order: v.number(),
  },
  handler: async (ctx, { taskId, status, order }) => {
    const user = await currentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const task = await ctx.db.get(taskId);
    if (!task || task.userId !== user._id) throw new Error("Task not found");
    await ctx.db.patch(taskId, { status, order, updatedAt: Date.now() });
  },
});

export const saveDailyLog = mutation({
  args: {
    date: v.string(),
    weekKey: v.string(),
    reflection: v.optional(v.string()),
    learned: v.optional(v.string()),
    blockers: v.optional(v.array(v.string())),
    wins: v.optional(v.array(v.string())),
    mood: v.optional(v.number()),
    energy: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await currentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("dailyLogs")
      .withIndex("by_user_date", (q) => q.eq("userId", user._id).eq("date", args.date))
      .unique();
    const now = Date.now();
    const patch = {
      reflection: args.reflection,
      learned: args.learned,
      blockers: args.blockers,
      wins: args.wins,
      mood: args.mood,
      energy: args.energy,
      updatedAt: now,
    };
    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }
    return ctx.db.insert("dailyLogs", {
      userId: user._id,
      date: args.date,
      weekKey: args.weekKey,
      ...patch,
      createdAt: now,
    });
  },
});
