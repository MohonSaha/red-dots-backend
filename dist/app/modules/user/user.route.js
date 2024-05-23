"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./user.controller");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const user_validation_1 = require("./user.validation");
const router = express_1.default.Router();
/*
 ** create user
 ** get my profile
 ** update my profile
 ** get all donors
 */
router.post("/register", (0, validateRequest_1.default)(user_validation_1.userValidations.userRegisterValidationSchema), user_controller_1.UserControllers.createUser);
router.get("/my-profile", user_controller_1.UserControllers.getMyProfile);
router.put("/my-profile", user_controller_1.UserControllers.updateMyProfile);
router.get("/donor-list", user_controller_1.UserControllers.getAllDonors);
exports.UserRoutes = router;
