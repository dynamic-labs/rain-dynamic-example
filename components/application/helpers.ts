import { z } from "zod";

export const FormSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  birthDate: z.string().min(1),
  nationalId: z.string().min(1),
  email: z.string(),
  phoneNumber: z.string().min(4),
  address: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    region: z.string().length(2),
    postalCode: z.string().min(3),
    countryCode: z.string().min(2).max(2),
  }),
  occupation: z.string().min(1),
  annualSalary: z.string().min(1),
  accountPurpose: z.enum(["spending", "savings", "business", "other"]),
  expectedMonthlyVolume: z.string().min(1),
  isTermsOfServiceAccepted: z
    .boolean()
    .refine((v) => v, { message: "You must accept the Terms of Service." }),
});

export const defaultValues = (email: string | undefined) => ({
  firstName: "",
  lastName: "",
  birthDate: "",
  nationalId: "",
  email: email || "",
  phoneNumber: "",
  address: {
    line1: "",
    line2: "",
    city: "",
    region: "CA",
    postalCode: "",
    countryCode: "US",
  },
  occupation: "",
  annualSalary: "",
  accountPurpose: "spending" as const,
  expectedMonthlyVolume: "",
  isTermsOfServiceAccepted: false,
});

export const STEPS = [
  {
    title: "Personal",
    fields: ["firstName", "lastName", "birthDate", "nationalId"],
  },
  {
    title: "Address",
    fields: [
      "phoneNumber",
      "address.line1",
      "address.city",
      "address.region",
      "address.postalCode",
      "address.countryCode",
    ],
  },
  {
    title: "Financial",
    fields: [
      "occupation",
      "annualSalary",
      "accountPurpose",
      "expectedMonthlyVolume",
      "isTermsOfServiceAccepted",
    ],
  },
];
