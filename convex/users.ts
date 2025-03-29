import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server"
import { v } from "convex/values"

export const createUser = mutation({
    args: {
        username: v.string(),
        fullName: v.string(),
        image: v.string(),
        bio: v.string(),
        email: v.string(),
        clerkId: v.string(),
    },

    handler: async (ctx, args) => {

        const existingUser = await ctx.db.query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();

        if (existingUser) return;

        // Create a user in db
        await ctx.db.insert("users", {
            username: args.username,
            fullName: args.fullName,
            email: args.email,
            image: args.image,
            followers: 0,
            following: 0,
            posts: 0,
            clerkId: args.clerkId
        })
    }
})

export const getUserByClerkId = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db.query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        return user;
    }
})

export async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const currentUser = await ctx.db.query("users").withIndex(
        "by_clerk_id", (q) => q.eq("clerkId", identity.subject)
    ).first()

    if (!currentUser) throw new Error("User not found");

    return currentUser;
}

export const updateProfile = mutation({
    args: {
        fullname: v.string(),
        bio: v.optional(v.string())
    },
    handler: async(ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx);

        await ctx.db.patch(currentUser._id, {
            fullName: args.fullname,
            bio: args.bio
        })
    }
})