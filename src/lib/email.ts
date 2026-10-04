type ContactEmailInput = {
  name: string;
  email: string;
  message: string;
};

export async function sendContactEmail(input: ContactEmailInput) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.CONTACT_TO_EMAIL?.trim() || "azoha6966@gmail.com";
  const from =
    process.env.CONTACT_FROM_EMAIL?.trim() || "Zoha Portfolio <onboarding@resend.dev>";

  if (!apiKey) {
    return {
      ok: false as const,
      skipped: true as const,
      error: "RESEND_API_KEY is missing",
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: input.email,
      subject: `Portfolio contact from ${input.name}`,
      text: [
        "New message from your portfolio contact form.",
        "",
        `Name: ${input.name}`,
        `Email: ${input.email}`,
        "",
        "Message:",
        input.message,
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111">
          <h2 style="margin:0 0 12px">New portfolio contact message</h2>
          <p style="margin:0 0 8px"><strong>Name:</strong> ${escapeHtml(input.name)}</p>
          <p style="margin:0 0 8px"><strong>Email:</strong> ${escapeHtml(input.email)}</p>
          <p style="margin:16px 0 8px"><strong>Message:</strong></p>
          <p style="white-space:pre-wrap;margin:0;padding:12px;background:#f5f7f8;border-radius:8px">${escapeHtml(input.message)}</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Resend error", detail);
    return {
      ok: false as const,
      skipped: false as const,
      error: detail,
    };
  }

  return { ok: true as const, skipped: false as const };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
