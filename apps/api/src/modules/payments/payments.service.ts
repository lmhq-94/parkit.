import Stripe from "stripe";
import { prisma } from "../../shared/prisma";

const stripeApiVersion: Stripe.LatestApiVersion = "2026-02-25.clover";

function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(key, { apiVersion: stripeApiVersion });
}

function getBaseUrl(): string {
  return (
    process.env.STRIPE_CHECKOUT_BASE_URL?.trim() ||
    process.env.FRONTEND_URL?.trim() ||
    "http://localhost:3000"
  );
}

export class PaymentsService {
  static async createCardVerificationSession(params: {
    userId: string;
    companyId?: string;
    locale?: string;
  }) {
    const stripe = getStripeClient();
    const baseUrl = getBaseUrl();
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { email: true, firstName: true, lastName: true },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "setup",
      customer_email: user?.email ?? undefined,
      success_url: `${baseUrl}/valet/card-verification/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/valet/card-verification/cancel`,
      locale: params.locale === "en" ? "en" : "es",
      metadata: {
        source: "mobile-valet-receive-step1",
        companyId: params.companyId ?? "",
        userId: params.userId,
      },
      consent_collection: {
        terms_of_service: "none",
      },
      custom_text: {
        submit: {
          message:
            "Solo verificaremos el método de pago para uso posterior. No se realiza cobro en este paso.",
        },
      },
    });

    if (!session.url) {
      throw new Error("Could not generate Stripe checkout URL");
    }

    return {
      id: session.id,
      url: session.url,
      expiresAt: session.expires_at ?? null,
    };
  }
}
