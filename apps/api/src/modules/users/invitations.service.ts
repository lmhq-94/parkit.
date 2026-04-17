import { prisma } from "../../shared/prisma";
import { SystemRole, InvitationStatus } from "@prisma/client";
import { signInvitationToken } from "../auth/auth.utils";
import { sendInvitationStaffEmail } from "../../shared/email/invitationStaffEmail";
import { sendInvitationEmployeeEmail } from "../../shared/email/invitationEmployeeEmail";

export class InvitationsService {
  /**
   * Generates a signed invitation and sends the email.
   * Does NOT create a User record yet.
   */
  static async sendInvitation(data: {
    email: string;
    companyId: string | null;
    role: SystemRole;
    invitedByUserId: string;
  }) {
    const { email, companyId, role, invitedByUserId } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new Error("USER_ALREADY_EXISTS");
    }

    // Expiry: 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create unique token for this invitation
    const token = signInvitationToken({
      email,
      companyId,
      role,
    });

    // Create record in Invitation table
    const invitation = await prisma.invitation.create({
      data: {
        email,
        role,
        token,
        invitedByUserId,
        expiresAt,
        status: InvitationStatus.PENDING,
        ...(companyId && { companyId }),
      },
    });

    // Fetch company name if companyId exists
    let companyName: string | null = null;
    if (companyId) {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { commercialName: true, legalName: true },
      });
      companyName = company?.commercialName || company?.legalName || null;
    }

    const registerUrl = `${process.env.WEB_APP_URL || "http://localhost:3000"}/register?token=${token}`;

    // Send the appropriate email based on role
    if (role === SystemRole.CUSTOMER) {
      await sendInvitationEmployeeEmail({
        to: email,
        companyName: companyName || "Parkit",
        invitationLink: registerUrl,
      });
    } else {
      await sendInvitationStaffEmail({
        to: email,
        companyName: companyName || "Parkit",
        invitationLink: registerUrl,
      });
    }

    return invitation;
  }

  static async listByCompany(companyId: string, role?: SystemRole) {
    return prisma.invitation.findMany({
      where: {
        companyId,
        role,
        status: InvitationStatus.PENDING,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async revoke(invitationId: string, companyId: string) {
    return prisma.invitation.updateMany({
      where: { id: invitationId, companyId, status: InvitationStatus.PENDING },
      data: { status: InvitationStatus.CANCELLED },
    });
  }

  static async sendInvitationsBatch(data: {
    emails: string[];
    companyId: string | null;
    role: SystemRole;
    invitedByUserId: string;
  }) {
    const { emails, companyId, role, invitedByUserId } = data;
    const results: Array<{
      email: string;
      success: boolean;
      invitation?: unknown;
      error?: string;
    }> = [];
    for (const email of emails) {
      if (!email.trim() || !email.includes("@")) continue;
      try {
        const invitation = await this.sendInvitation({
          email: email.toLowerCase().trim(),
          companyId,
          role,
          invitedByUserId,
        });
        results.push({ email, success: true, invitation });
      } catch (error: unknown) {
        results.push({
          email,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
    return results;
  }
}
