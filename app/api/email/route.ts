import { sendEmail } from "@/lib/mail-service";
import { Recipient } from "mailersend";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { email, name } = await request.json();

  const recipient = new Recipient(email, name);

  await sendEmail([recipient]);

  return NextResponse.json(
    { message: "Email sent successfully" },
    { status: 200 },
  );
}
