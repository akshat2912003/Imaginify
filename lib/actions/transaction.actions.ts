"use server";

import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import Transaction from "../database/models/transaction.model";
import { updateCredits } from "./user.actions";

export async function createRazorpayOrder(amount: number, plan: string, credits: number, buyerId: string) {
  try {
    const Razorpay = (await import("razorpay")).default;
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: { plan, credits: credits.toString(), buyerId },
    });

    return JSON.parse(JSON.stringify(order));
  } catch (error) { handleError(error); }
}

export async function createTransaction(transaction: CreateTransactionParams) {
  try {
    await connectToDatabase();
    const newTransaction = await Transaction.create({ ...transaction, buyer: transaction.buyerId });
    await updateCredits(transaction.buyerId, transaction.credits);
    return JSON.parse(JSON.stringify(newTransaction));
  } catch (error) { handleError(error); }
}
