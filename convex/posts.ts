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
                    const postAuthor = await ctx.db.get(post.userId);

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
                            userename: postAuthor?.username,
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