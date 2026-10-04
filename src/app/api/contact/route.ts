import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { sendContactEmail } from "@/lib/email";
import { saveLocalContactMessage } from "@/lib/local-inbox";
import { rateLimit } from "@/lib/rate-limit";
import { createServiceClient, hasSupabaseServiceConfig } from "@/lib/supabase/server";
import { INVALID_EMAIL_MESSAGE, isValidEmail } from "@/lib/validate";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(100),
  email: z
    .string()
    .trim()
    .max(200)
    .refine(isValidEmail, { message: INVALID_EMAIL_MESSAGE }),
  message: z.string().trim().min(1, "Please write a message.").max(4000),
  website: z.string().optional(),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limited = rateLimit(`contact:${ip}`, 8, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many messages. Try again later." }, { status: 429 });
  }

  let body: z.infer<typeof schema>;
  try {
    const raw = await request.json();
    body = schema.parse(raw);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Please fill in name, email, and a short message." },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Please fill in name, email, and a short message." }, { status: 400 });
  }

  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const ipHash = hashIp(ip);
  let savedRemotely = false;

  if (hasSupabaseServiceConfig()) {
    const supabase = createServiceClient();
    const { error } = await supabase.from("contact_messages").insert({
      id,
      name: body.name,
      email: body.email,
      message: body.message,
      ip_hash: ipHash,
      status: "new",
      created_at: createdAt,
    });

    if (!error) {
      savedRemotely = true;
    } else {
      console.error("contact insert failed, using local inbox", error.message);
    }
  }

  saveLocalContactMessage({
    id,
    name: body.name,
    email: body.email,
    message: body.message,
    ip_hash: ipHash,
    created_at: createdAt,
  });

  const emailResult = await sendContactEmail({
    name: body.name,
    email: body.email,
    message: body.message,
  });

  if (!emailResult.ok && !emailResult.skipped) {
    return NextResponse.json(
      {
        error:
          "Message was saved to your inbox, but email delivery failed. Check RESEND_API_KEY / sender settings.",
      },
      { status: 502 },
    );
  }

  if (emailResult.skipped) {
    console.warn("Contact saved, but email skipped: RESEND_API_KEY missing");
  }

  return NextResponse.json({
    ok: true,
    storage: savedRemotely ? "supabase+local" : "local",
    emailed: emailResult.ok,
  });
}

function hashIp(ip: string) {
  let hash = 0;
  for (let i = 0; i < ip.length; i += 1) hash = (hash * 31 + ip.charCodeAt(i)) >>> 0;
  return `ip_${hash.toString(16)}`;
}
