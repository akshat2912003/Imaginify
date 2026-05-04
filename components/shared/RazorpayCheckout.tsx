"use client";

import { useEffect } from "react";
import { Button } from "../ui/button";
import { createRazorpayOrder, createTransaction } from "@/lib/actions/transaction.actions";
import { useToast } from "@/components/ui/use-toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type RazorpayCheckoutProps = {
  plan: string;
  amount: number;
  credits: number;
  buyerId: string;
  userEmail?: string;
  userName?: string;
};

const RazorpayCheckout = ({ plan, amount, credits, buyerId, userEmail, userName }: RazorpayCheckoutProps) => {
  const { toast } = useToast();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const handlePayment = async () => {
    try {
      const order = await createRazorpayOrder(amount, plan, credits, buyerId);
      if (!order) throw new Error("Failed to create order");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "Imaginify",
        description: `${plan} - ${credits} Credits`,
        order_id: order.id,
        prefill: { name: userName || "", email: userEmail || "" },
        theme: { color: "#7857FF" },
        handler: async (response: any) => {
          try {
            await createTransaction({
              razorpayId: response.razorpay_payment_id,
              amount,
              credits,
              plan,
              buyerId,
              createdAt: new Date(),
            });
            toast({
              title: "Payment Successful! 🎉",
              description: `${credits} credits have been added to your account.`,
              duration: 5000,
              className: "success-toast",
            });
            window.location.href = "/profile";
          } catch (err) {
            toast({ title: "Error adding credits", description: "Please contact support.", className: "error-toast" });
          }
        },
        modal: {
          ondismiss: () => {
            toast({ title: "Payment Cancelled", description: "You cancelled the payment.", duration: 3000, className: "error-toast" });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast({ title: "Something went wrong", description: "Please try again.", className: "error-toast" });
    }
  };

  return (
    <Button onClick={handlePayment} className="w-full rounded-full bg-purple-gradient bg-cover text-white">
      Buy Credit
    </Button>
  );
};

export default RazorpayCheckout;
