import express, { NextFunction, Request, Response } from "express";
import { UserControllers } from "./user.controller";
import validateRequest from "../../middlewares/validateRequest";
import { userValidations } from "./user.validation";

const router = express.Router();

/*
 ** create user
 ** get my profile
 ** update my profile
 ** get all donors
 */

router.post(
  "/register",
  validateRequest(userValidations.userRegisterValidationSchema),
  UserControllers.createUser
);

router.get("/my-profile", UserControllers.getMyProfile);

router.put("/my-profile", UserControllers.updateMyProfile);

router.get("/donor-list", UserControllers.getAllDonors);

router.get("/donor-list/:id", UserControllers.getByIdFromDB);

export const UserRoutes = router;
