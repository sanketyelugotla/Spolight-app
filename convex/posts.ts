import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";

export const generateUploadUrl = mutation(async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    return await ctx.storage.generateUploadUrl();
})

export const createPost = mutation({
    args: {
        caption: v.optional(v.string()),
        storageId: v.id("_storage"),
    },

    handler: async (ctx, args) => {
        try {

            const currentUser = await getAuthenticatedUser(ctx);
            const imageUrl = await ctx.storage.getUrl(args.storageId);
            if (!imageUrl) throw new Error("Image not found");

            // Create a post

            const postId = await ctx.db.insert("posts", {
                userId: currentUser._id,
                imageUrl,
                storageId: args.storageId,
                likes: 0,
                comments: 0
            })

            // Increment user's post bby one

            await ctx.db.patch(currentUser._id, {
                posts: currentUser.posts + 1
            })

            return postId;
        } catch (error) {
            console.log(error)
        }
    }
})

export const getFeedPost = query({
    handler: async (ctx) => {
        try {
            const currentUser = await getAuthenticatedUser(ctx);

            //  Grt all posts
            const posts = await ctx.db.query("posts").order("desc").collect();

            if (posts.length == 0) return [];

            // Enhance posts with user data and interation status
            const postsWithInfo = await Promise.all(
                posts.map(async (post) => {
                    const postAuthor = (await ctx.db.get(post.userId))!;

                    const liked = await ctx.db
                        .query("likes")
                        .withIndex("by_user_and_post", (q) =>
                            q.eq("userId", (currentUser)._id).eq("postId", post._id)
                        )
                        .first();

                    const bookmarked = await ctx.db
                        .query("bookmarks")
                        .withIndex("by_user_and_post", (q) =>
                            q.eq("userId", (currentUser)._id).eq("postId", post._id)
                        )
                        .first();

                    return {
                        ...post,
                        author: {
                            _id: postAuthor?._id,
                            username: postAuthor?.username,
                            image: postAuthor?.image
                        },
                        isLiked: !!liked,
                        isBookmarked: !!bookmarked
                    }
                })
            )

            return postsWithInfo;
        } catch (error) {
            console.log(error);
        }
    }
})

export const toggleLike = mutation({
    args: { postId: v.id("posts") },
    handler: async (ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx);

        const existing = await ctx.db
            .query("likes")
            .withIndex("by_user_and_post", (q) =>
                q.eq("userId", currentUser._id).eq("postId", args.postId)
            )
            .first();

        const post = await ctx.db.get(args.postId);
        if (!post) throw new Error("Post not found");

        if (existing) {
            // remove like
            await ctx.db.delete(existing._id);
            await ctx.db.patch(args.postId, { likes: post.likes - 1 });
            return false;
        } else {
            // add like
            await ctx.db.insert("likes", {
                userId: currentUser._id,
                postId: args.postId
            });
            await ctx.db.patch(args.postId, { likes: post.likes + 1 });

            // If it's not my post create a notification
            if (currentUser._id != post.userId) {
                await ctx.db.insert("notifications", {
                    receiverid: post.userId,
                    senderId: currentUser._id,
                    type: "like",
                    postId: args.postId
                });
            }
            return true;
        }
    }
})

export const deletePost = mutation({
    args: { postId: v.id("posts") },
    handler: async (ctx, args) => {

        const currentUser = await getAuthenticatedUser(ctx);

        const post = await ctx.db.get(args.postId);
        if (!post) throw new Error("Post not found");

        // Verify ownership
        if (post.userId !== currentUser._id) throw new Error("Not authorized to delete this ");

        // Delete associated likes
        const likes = await ctx.db
            .query("likes")
            .withIndex("by_post", (q) => q.eq("postId", args.postId))
            .collect();

        for (const like of likes) {
            await ctx.db.delete(like._id);
        }

        // Delete associated comments
        const comments = await ctx.db
            .query("comments")
            .withIndex("by_post", (q) => q.eq("postId", args.postId))
            .collect();

        for (const comment of comments) {
            await ctx.db.delete(comment._id);
        }

        // Delete associated bookmarks
        const bookmarks = await ctx.db
            .query("bookmarks")
            .withIndex("by_post", (q) => q.eq("postId", args.postId))
            .collect();

        for (const bookmark of bookmarks) {
            await ctx.db.delete(bookmark._id);
        }

        // Delete storage file
        await ctx.storage.delete(post.storageId);

        // Delete post
        await ctx.db.delete(args.postId);

        // Decrement user's post count by 1
        await ctx.db.patch(currentUser._id, {
            posts: Math.max(0, (currentUser.posts || 1) - 1)
        })
    }
})