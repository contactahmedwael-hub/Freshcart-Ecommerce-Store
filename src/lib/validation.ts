import { z } from "zod";

const email = z.string().trim().email("Enter a valid email address.").max(254, "Email address is too long.");
const password = z.string().min(6, "Password must be at least 6 characters.").max(128, "Password must be 128 characters or fewer.");

export const signInSchema = z.object({ email, password: z.string().min(1, "Enter your password.").max(128) });
export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80, "Name must be 80 characters or fewer."),
  email,
  phone: z.string().trim().min(6, "Enter a valid phone number.").max(24, "Phone number must be 24 characters or fewer."),
  password,
  rePassword: z.string(),
}).refine(data => data.password === data.rePassword, { message: "Your passwords do not match.", path: ["rePassword"] });
export const recoverySchema = z.object({ email });
export const resetCodeSchema = z.object({ resetCode: z.string().trim().min(1, "Enter your reset code.").max(32, "Reset code is too long.") });
export const resetPasswordSchema = z.object({ email, newPassword: password });
export const resetFormSchema = z.object({ email, resetCode: z.string().trim().min(1, "Enter your reset code.").max(32, "Reset code is too long."), newPassword: password });

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80, "Name must be 80 characters or fewer."),
  email,
  phone: z.string().trim().max(24, "Phone number must be 24 characters or fewer.").optional().default(""),
});
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password.").max(128),
  password,
  rePassword: z.string(),
}).refine(data => data.password === data.rePassword, { message: "Your new passwords do not match.", path: ["rePassword"] });

export const addressSchema = z.object({
  name: z.string().trim().min(1, "Enter an address label.").max(50, "Address label must be 50 characters or fewer."),
  city: z.string().trim().min(1, "Enter a city.").max(80, "City must be 80 characters or fewer."),
  phone: z.string().trim().min(6, "Enter a valid phone number.").max(24, "Phone number must be 24 characters or fewer."),
  details: z.string().trim().min(4, "Enter your street and building details.").max(300, "Address details must be 300 characters or fewer."),
});
export const reviewSchema = z.object({
  review: z.string().trim().min(2, "Review must be at least 2 characters.").max(1000, "Review must be 1,000 characters or fewer."),
  rating: z.number().int("Choose a rating.").min(1, "Choose a rating from 1 to 5.").max(5, "Choose a rating from 1 to 5."),
});
export const couponSchema = z.object({ couponName: z.string().trim().min(1, "Enter a valid coupon code.").max(64, "Coupon code is too long.") });
export const quantitySchema = z.object({ count: z.number().int("Quantity must be a whole number.").min(1, "Quantity must be at least 1.").max(99, "Quantity cannot exceed 99.") });
export const addCartItemSchema = z.object({ productId: z.string().regex(/^[a-f\d]{24}$/i, "Please choose a valid product.") });
export const shippingAddressSchema = z.object({
  details: z.string().trim().min(4, "Enter your street and building details.").max(300),
  city: z.string().trim().min(1, "Enter a city.").max(80),
  phone: z.string().trim().min(6, "Enter a valid phone number.").max(24),
  postalCode: z.string().trim().max(16).optional(),
});
export const cashShippingAddressSchema = shippingAddressSchema;

export function validationMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please check the information you entered.";
}
