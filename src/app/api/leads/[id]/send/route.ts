import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/client";
import { generateProposalEmail } from "@/lib/email/templates/proposal";
import { z } from "zod";

const SendEmailSchema = z.object({
  proposalId: z.string().uuid(),
  to: z.string().email(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: leadId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const parsed = SendEmailSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Fetch the proposal
  const { data: proposal, error: proposalError } = await supabase
    .from("proposals")
    .select("*")
    .eq("id", parsed.data.proposalId)
    .eq("lead_id", leadId)
    .single();

  if (proposalError || !proposal) {
    return NextResponse.json(
      { error: "Proposal not found" },
      { status: 404 }
    );
  }

  // Fetch the lead
  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("name")
    .eq("id", leadId)
    .single();

  if (leadError || !lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  try {
    // Generate email HTML
    const html = generateProposalEmail({
      recipientName: lead.name,
      subject: proposal.subject,
      body: proposal.body,
    });

    // Send email
    await sendEmail({
      to: parsed.data.to,
      subject: proposal.subject,
      html,
    });

    // Update proposal status
    await supabase
      .from("proposals")
      .update({
        status: "sent",
        is_sent: true,
        sent_at: new Date().toISOString(),
      })
      .eq("id", parsed.data.proposalId);

    // Create contact attempt record
    await supabase.from("contact_attempts").insert({
      lead_id: leadId,
      user_id: user.id,
      proposal_id: parsed.data.proposalId,
      channel: "email",
      contact_type: "email",
      message: proposal.body,
      status: "sent",
      outcome: "Email enviado",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send email" },
      { status: 500 }
    );
  }
}
