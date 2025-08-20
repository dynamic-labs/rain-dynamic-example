"use server";

import {
  createUserApplication,
  type CreateUserApplicationRequest,
  type CreateUserApplicationResponse,
} from "@/lib/rain";
import { verifyDynamicJWT } from "@/lib/rain/dynamic-auth";

export interface CreateUserApplicationActionState {
  ok: boolean;
  data?: CreateUserApplicationResponse;
  error?: string;
  authenticatedUser?: {
    walletAddress: string;
    email?: string;
  };
}

export async function createUserApplicationAction(
  _prevState: CreateUserApplicationActionState | undefined,
  formData: FormData
): Promise<CreateUserApplicationActionState> {
  try {
    // Verify Dynamic authentication
    const authToken = formData.get("authToken");
    if (!authToken) {
      return {
        ok: false,
        error: "Authentication required. Please connect your wallet.",
      };
    }

    // Verify the JWT token from Dynamic
    const jwtPayload = await verifyDynamicJWT(String(authToken));

    // Extract wallet address and email from the verified JWT
    const walletAddress = jwtPayload.verified_credentials?.filter(
      (credential) => credential.wallet_provider === "embeddedWallet"
    )[0].address;
    const email = jwtPayload.email;

    if (!walletAddress) {
      return { ok: false, error: "No wallet address found" };
    }

    if (!email) {
      return { ok: false, error: "Email address is required" };
    }

    const payload: CreateUserApplicationRequest = {
      firstName: String(formData.get("firstName")),
      lastName: "Approved",
      birthDate: String(formData.get("birthDate")),
      nationalId: String(formData.get("nationalId")).replace(/\D/g, ""),
      countryOfIssue: "US",
      email,
      phoneCountryCode: "1",
      phoneNumber: String(formData.get("phoneNumber")).replace(/\D/g, ""),
      address: {
        line1: String(formData.get("address.line1")),
        line2: formData.get("address.line2")
          ? String(formData.get("address.line2"))
          : undefined,
        city: String(formData.get("address.city")),
        region: String(formData.get("address.region")),
        postalCode: String(formData.get("address.postalCode")),
        countryCode: String(formData.get("address.countryCode")),
      },
      walletAddress,
      ipAddress: "192.168.1.1",
      occupation: String(formData.get("occupation")),
      annualSalary: String(formData.get("annualSalary")),
      accountPurpose: String(formData.get("accountPurpose")),
      expectedMonthlyVolume: String(formData.get("expectedMonthlyVolume")),
      isTermsOfServiceAccepted:
        formData.get("isTermsOfServiceAccepted") === "on",
    };

    const result = await createUserApplication(payload);
    return {
      ok: true,
      data: result,
      authenticatedUser: { walletAddress, email },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: message };
  }
}
