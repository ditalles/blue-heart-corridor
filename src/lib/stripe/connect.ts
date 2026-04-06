import { stripe } from "./client";

export async function createConnectAccount(email: string, country: string) {
  const account = await stripe.accounts.create({
    type: "express",
    email,
    country,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: "individual",
  });
  return account;
}

export async function createAccountLink(
  accountId: string,
  returnUrl: string,
  refreshUrl: string
) {
  const link = await stripe.accountLinks.create({
    account: accountId,
    return_url: returnUrl,
    refresh_url: refreshUrl,
    type: "account_onboarding",
  });
  return link;
}

export async function getAccountStatus(accountId: string) {
  const account = await stripe.accounts.retrieve(accountId);
  return {
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
  };
}

export async function createLoginLink(accountId: string) {
  const link = await stripe.accounts.createLoginLink(accountId);
  return link.url;
}
