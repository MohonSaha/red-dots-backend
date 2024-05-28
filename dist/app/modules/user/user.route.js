"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./user.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
/*
 ** create user
 ** get my profile
 ** update my profile
 ** get all donors
 */
router.post("/register", 
// validateRequest(userValidations.userRegisterValidationSchema),
user_controller_1.UserControllers.createUser);
router.patch("/update-user/:id", (0, auth_1.default)(client_1.UserRole.ADMIN), 
// validateRequest(userValidations.updateStatus),
user_controller_1.UserControllers.updateUserInfo);
router.get("/my-profile", user_controller_1.UserControllers.getMyProfile);
router.put("/my-profile", user_controller_1.UserControllers.updateMyProfile);
router.get("/donor-list", user_controller_1.UserControllers.getAllDonors);
router.get("/donor-list/:id", user_controller_1.UserControllers.getByIdFromDB);
exports.UserRoutes = router;
