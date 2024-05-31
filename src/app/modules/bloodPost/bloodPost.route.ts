import express from "express";
import { PostControllers } from "./bloodPost.controller";

const router = express.Router();

/*
 **
 */

router.post("/create-blood-post", PostControllers.createPostForBlood);

router.get("/blood-posts", PostControllers.getAllBloodPost);

router.get("/blood-posts/:postId", PostControllers.getSingleBloodPost);

router.post("/accept-blood-post", PostControllers.acceptPostByDonor);

router.delete(
  "/delete-accept-post/:postId",
  PostControllers.deleteAcceptedPost
);

router.get("/my-accepted-post", PostControllers.getMyAcceptedPost);

router.get("/my-posts", PostControllers.getMyPosts);

export const PostRoutes = router;
