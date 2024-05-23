import { z } from "zod";

const userRegisterValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Name field is required" }),
    email: z.string({ required_error: "Email field is required" }).email(),
    password: z.string({ required_error: "Password field is required" }).min(1),
    bloodType: z.string({ required_error: "BloodType field is required" }),
    location: z.string({ required_error: "Location field is required" }).min(1),
    age: z.number({ required_error: "Age field is required" }).positive(),
    bio: z.string({ required_error: "Bio field is required" }).min(1),
    lastDonationDate: z
      .string({ required_error: "LastDonationDate field is required" })
      .min(1),
  }),
});

export const userValidations = {
  userRegisterValidationSchema,
};
