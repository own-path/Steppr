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

function splitSignals(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value || "")
    .split(/\n|[•]/)
    .map((item) => item.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
}

function compactTitle(text, fallback) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return fallback;
  return cleaned.length > 80 ? `${cleaned.slice(0, 77).trim()}...` : cleaned;
}

function inferTag(text, fallback = "General") {
  const lower = text.toLowerCase();
  if (/(ship|launch|release|deploy|fix|bug|build|implement|code|api|feature)/.test(lower)) return "Shipping";
  if (/(customer|user|client|manager|stakeholder|feedback|demo|presentation)/.test(lower)) return "Communication";
  if (/(learn|study|course|read|research|understand|debug|investigate)/.test(lower)) return "Learning";
  if (/(mentor|pair|review|help|support|sync|meeting)/.test(lower)) return "Collaboration";
  return fallback;
}

function inferImpact(text) {
  const lower = text.toLowerCase();
  if (/(launched|shipped|deployed|unblocked|saved|reduced|increased|improved|\d+%|\d+x|\$\d+)/.test(lower)) return "High";
  if (/(finished|completed|fixed|built|presented|documented|merged)/.test(lower)) return "Medium";
  return "Low";
}

function inferPriority(text) {
  const lower = text.toLowerCase();
  if (/(urgent|blocked|blocker|asap|critical|deadline|production|prod|customer)/.test(lower)) return "high";
  if (/(waiting|review|follow up|follow-up|dependency|approval)/.test(lower)) return "med";
  return "low";
}

function detectWins(args) {
  const explicit = splitSignals(args.wins);
  const reflectionLines = splitSignals(args.reflection).filter((line) =>
    /(shipped|launched|deployed|finished|completed|fixed|built|implemented|merged|presented|improved|unblocked|won|closed|delivered)/i.test(line)
  );
  const seen = new Set();
  return [...explicit, ...reflectionLines].filter((line) => {
    const key = line.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map((line) => ({
    title: compactTitle(line, "Captured win"),
    detail: line,
    tag: inferTag(line, "Win"),
    impact: inferImpact(line),
  }));
}

function detectBlockerTasks(args) {
  return splitSignals(args.blockers).map((line) => ({
    title: compactTitle(line.replace(/^(blocked by|blocker:?)\s*/i, ""), "Resolve blocker"),
    tag: inferTag(line, "Blocker"),
    priority: inferPriority(line),
    blocker: line,
  }));
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
  args: {
    weekKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await currentUser(ctx);
    if (!user) return [];
    if (args.weekKey) {
      return ctx.db.query("tasks").withIndex("by_user_week", (q) => q.eq("userId", user._id).eq("weekKey", args.weekKey)).collect();
    }
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
      const weekTasks = tasks.filter((t) => t.weekKey === weekKey);
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

export const createTask = mutation({
  args: {
    title: v.string(),
    tag: v.optional(v.string()),
    due: v.optional(v.string()),
    priority: v.optional(v.string()),
    status: v.optional(v.string()),
    blocker: v.optional(v.string()),
    weekKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await currentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const now = Date.now();
    return ctx.db.insert("tasks", {
      userId: user._id,
      weekKey: args.weekKey,
      title: compactTitle(args.title, "Untitled task"),
      tag: args.tag || inferTag(args.title, "Task"),
      due: args.due,
      priority: args.priority || inferPriority(args.title),
      status: args.status || "backlog",
      blocker: args.blocker,
      order: now,
      source: "manual",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const createWin = mutation({
  args: {
    title: v.string(),
    detail: v.optional(v.string()),
    date: v.string(),
    weekKey: v.string(),
    tag: v.optional(v.string()),
    impact: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await currentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const now = Date.now();
    const detail = args.detail || args.title;
    return ctx.db.insert("wins", {
      userId: user._id,
      title: compactTitle(args.title, "Captured win"),
      detail,
      date: args.date,
      weekKey: args.weekKey,
      tag: args.tag || inferTag(detail, "Win"),
      impact: args.impact || inferImpact(detail),
      source: "manual",
      createdAt: now,
      updatedAt: now,
    });
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
    let logId;
    if (existing) {
      await ctx.db.patch(existing._id, patch);
      logId = existing._id;
    } else {
      logId = await ctx.db.insert("dailyLogs", {
        userId: user._id,
        date: args.date,
        weekKey: args.weekKey,
        ...patch,
        createdAt: now,
      });
    }

    const [existingWins, existingTasks] = await Promise.all([
      ctx.db.query("wins").withIndex("by_user_week", (q) => q.eq("userId", user._id).eq("weekKey", args.weekKey)).collect(),
      ctx.db.query("tasks").withIndex("by_user_week", (q) => q.eq("userId", user._id).eq("weekKey", args.weekKey)).collect(),
    ]);
    await Promise.all(existingWins.filter((win) => win.sourceLogId === logId && win.source === "dailyLog").map((win) => ctx.db.delete(win._id)));
    await Promise.all(existingTasks.filter((task) => task.sourceLogId === logId && task.source === "dailyLog").map((task) => ctx.db.delete(task._id)));

    const detectedWins = detectWins(args);
    const detectedTasks = detectBlockerTasks(args);
    await Promise.all(detectedWins.map((win, index) => ctx.db.insert("wins", {
      userId: user._id,
      sourceLogId: logId,
      source: "dailyLog",
      title: win.title,
      detail: win.detail,
      date: args.date,
      weekKey: args.weekKey,
      tag: win.tag,
      impact: win.impact,
      createdAt: now + index,
      updatedAt: now + index,
    })));
    await Promise.all(detectedTasks.map((task, index) => ctx.db.insert("tasks", {
      userId: user._id,
      sourceLogId: logId,
      source: "dailyLog",
      weekKey: args.weekKey,
      title: task.title,
      tag: task.tag,
      due: args.date,
      priority: task.priority,
      status: "blocked",
      blocker: task.blocker,
      order: now + index,
      createdAt: now + index,
      updatedAt: now + index,
    })));

    return {
      logId,
      detectedWins: detectedWins.length,
      detectedBlockers: detectedTasks.length,
    };
  },
});

export const redetectDailyLogSignals = mutation({
  args: {
    logId: v.id("dailyLogs"),
  },
  handler: async (ctx, { logId }) => {
    const user = await currentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const log = await ctx.db.get(logId);
    if (!log || log.userId !== user._id) throw new Error("Log not found");
    const [existingWins, existingTasks] = await Promise.all([
      ctx.db.query("wins").withIndex("by_user_week", (q) => q.eq("userId", user._id).eq("weekKey", log.weekKey)).collect(),
      ctx.db.query("tasks").withIndex("by_user_week", (q) => q.eq("userId", user._id).eq("weekKey", log.weekKey)).collect(),
    ]);
    await Promise.all(existingWins.filter((win) => win.sourceLogId === logId && win.source === "dailyLog").map((win) => ctx.db.delete(win._id)));
    await Promise.all(existingTasks.filter((task) => task.sourceLogId === logId && task.source === "dailyLog").map((task) => ctx.db.delete(task._id)));

    const now = Date.now();
    const args = {
      reflection: log.reflection,
      wins: log.wins,
      blockers: log.blockers,
    };
    const detectedWins = detectWins(args);
    const detectedTasks = detectBlockerTasks(args);
    await Promise.all(detectedWins.map((win, index) => ctx.db.insert("wins", {
      userId: user._id,
      sourceLogId: logId,
      source: "dailyLog",
      title: win.title,
      detail: win.detail,
      date: log.date,
      weekKey: log.weekKey,
      tag: win.tag,
      impact: win.impact,
      createdAt: now + index,
      updatedAt: now + index,
    })));
    await Promise.all(detectedTasks.map((task, index) => ctx.db.insert("tasks", {
      userId: user._id,
      sourceLogId: logId,
      source: "dailyLog",
      weekKey: log.weekKey,
      title: task.title,
      tag: task.tag,
      due: log.date,
      priority: task.priority,
      status: "blocked",
      blocker: task.blocker,
      order: now + index,
      createdAt: now + index,
      updatedAt: now + index,
    })));
    return {
      detectedWins: detectedWins.length,
      detectedBlockers: detectedTasks.length,
    };
  },
});

export const redetectAllDailyLogSignals = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await currentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const logs = await ctx.db.query("dailyLogs").withIndex("by_user", (q) => q.eq("userId", user._id)).collect();
    let detectedWinsTotal = 0;
    let detectedBlockersTotal = 0;
    for (const log of logs) {
      const [existingWins, existingTasks] = await Promise.all([
        ctx.db.query("wins").withIndex("by_user_week", (q) => q.eq("userId", user._id).eq("weekKey", log.weekKey)).collect(),
        ctx.db.query("tasks").withIndex("by_user_week", (q) => q.eq("userId", user._id).eq("weekKey", log.weekKey)).collect(),
      ]);
      await Promise.all(existingWins.filter((win) => win.sourceLogId === log._id && win.source === "dailyLog").map((win) => ctx.db.delete(win._id)));
      await Promise.all(existingTasks.filter((task) => task.sourceLogId === log._id && task.source === "dailyLog").map((task) => ctx.db.delete(task._id)));
      const detectedWins = detectWins(log);
      const detectedTasks = detectBlockerTasks(log);
      const now = Date.now();
      await Promise.all(detectedWins.map((win, index) => ctx.db.insert("wins", {
        userId: user._id,
        sourceLogId: log._id,
        source: "dailyLog",
        title: win.title,
        detail: win.detail,
        date: log.date,
        weekKey: log.weekKey,
        tag: win.tag,
        impact: win.impact,
        createdAt: now + index,
        updatedAt: now + index,
      })));
      await Promise.all(detectedTasks.map((task, index) => ctx.db.insert("tasks", {
        userId: user._id,
        sourceLogId: log._id,
        source: "dailyLog",
        weekKey: log.weekKey,
        title: task.title,
        tag: task.tag,
        due: log.date,
        priority: task.priority,
        status: "blocked",
        blocker: task.blocker,
        order: now + index,
        createdAt: now + index,
        updatedAt: now + index,
      })));
      detectedWinsTotal += detectedWins.length;
      detectedBlockersTotal += detectedTasks.length;
    }
    return {
      logs: logs.length,
      detectedWins: detectedWinsTotal,
      detectedBlockers: detectedBlockersTotal,
    };
  },
});
