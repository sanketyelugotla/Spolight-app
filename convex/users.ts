import { mutation, MutationCtx, QueryCtx } from "./_generated/server"
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
            image: args.email,
            followers: 0,
            following: 0,
            posts: 0,
            clerkId: args.clerkId
        })
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