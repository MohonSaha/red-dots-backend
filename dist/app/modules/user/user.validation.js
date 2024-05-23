"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userValidations = void 0;
const zod_1 = require("zod");
const userRegisterValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ required_error: "Name field is required" }),
        email: zod_1.z.string({ required_error: "Email field is required" }).email(),
        password: zod_1.z.string({ required_error: "Password field is required" }).min(1),
        bloodType: zod_1.z.string({ required_error: "BloodType field is required" }),
        location: zod_1.z.string({ required_error: "Location field is required" }).min(1),
        age: zod_1.z.number({ required_error: "Age field is required" }).positive(),
        bio: zod_1.z.string({ required_error: "Bio field is required" }).min(1),
        lastDonationDate: zod_1.z
            .string({ required_error: "LastDonationDate field is required" })
            .min(1),
    }),
});
exports.userValidations = {
    userRegisterValidationSchema,
};
