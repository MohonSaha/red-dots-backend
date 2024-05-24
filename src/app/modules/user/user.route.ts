import express, { NextFunction, Request, Response } from "express";
import { UserControllers } from "./user.controller";
import validateRequest from "../../middlewares/validateRequest";
import { userValidations } from "./user.validation";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

/*
 ** create user
 ** get my profile
 ** update my profile
 ** get all donors
 */

router.post(
  "/register",
  // validateRequest(userValidations.userRegisterValidationSchema),
  UserControllers.createUser
);

router.patch(
  "/update-user/:id",
  auth(UserRole.ADMIN),
  // validateRequest(userValidations.updateStatus),
  UserControllers.updateUserInfo
);

router.get("/my-profile", UserControllers.getMyProfile);

router.put("/my-profile", UserControllers.updateMyProfile);

router.get("/donor-list", UserControllers.getAllDonors);

router.get("/donor-list/:id", UserControllers.getByIdFromDB);

export const UserRoutes = router;
