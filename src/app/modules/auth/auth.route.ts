import express, { Request, Response, NextFunction } from "express";
import { AuthControllers } from "./auth.controller";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post("/login", AuthControllers.loginUser);
router.post("/refreshToken", AuthControllers.refreshToken);

router.post(
  "/change-password",
  auth(UserRole.ADMIN, UserRole.USER),
  AuthControllers.changePassword
);

export const AuthRoutes = router;
