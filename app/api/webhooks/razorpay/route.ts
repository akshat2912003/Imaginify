import { NextResponse } from "next/server";
import crypto from "crypto";
import { createTransaction } from "@/lib/actions/transaction.actions";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature") as string;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  if (signature !== expectedSignature) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);

  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;
    const transaction = {
      razorpayId: payment.id,
      amount: payment.amount / 100,
      plan: payment.notes?.plan || "",
      credits: Number(payment.notes?.credits) || 0,
      buyerId: payment.notes?.buyerId || "",
      createdAt: new Date(),
    };
    await createTransaction(transaction);
    return NextResponse.json({ message: "OK" });
  }

  return new Response("", { status: 200 });
}
