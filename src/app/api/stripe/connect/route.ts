import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createConnectAccount, createAccountLink } from "@/lib/stripe/connect";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { hostel_id } = await request.json();

  // Verify ownership
  const { data: hostel } = await supabase
    .from("hostels")
    .select("id, stripe_account_id")
    .eq("id", hostel_id)
    .eq("owner_id", user.id)
    .single();

  if (!hostel) {
    return NextResponse.json({ error: "Hostel not found" }, { status: 404 });
  }

  let accountId = hostel.stripe_account_id;

  // Create Stripe account if not exists
  if (!accountId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", user.id)
      .single();

    const account = await createConnectAccount(profile!.email, "RS"); // Default to Serbia
    accountId = account.id;

    await supabase
      .from("hostels")
      .update({ stripe_account_id: accountId })
      .eq("id", hostel_id);
  }

  // Create account link for onboarding
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const link = await createAccountLink(
    accountId,
    `${appUrl}/manage/payouts?setup=complete`,
    `${appUrl}/manage/payouts?setup=refresh`
  );

  return NextResponse.json({ url: link.url });
}
