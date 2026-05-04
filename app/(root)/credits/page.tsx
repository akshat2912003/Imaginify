import { SignedIn, auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Header from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { plans } from "@/constants";
import { getUserById } from "@/lib/actions/user.actions";
import RazorpayCheckout from "@/components/shared/RazorpayCheckout";

const Credits = async () => {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const user = await getUserById(userId);

  return (
    <>
      <Header title="Buy Credits" subtitle="Choose a credit package that suits your needs!" />
      <section>
        <ul className="credits-list">
          {plans.map((plan) => (
            <li key={plan.name} className="credits-item">
              <div className="flex-center flex-col gap-3">
                <span className="text-4xl">{plan.icon}</span>
                <p className="p-20-semibold mt-2 text-purple-500">{plan.name}</p>
                <p className="h1-semibold text-dark-600">
                  {plan.price === 0 ? "Free" : `₹${plan.price.toLocaleString("en-IN")}`}
                </p>
                <p className="p-16-regular">{plan.credits} Credits</p>
              </div>

              <ul className="flex flex-col gap-5 py-9">
                {plan.inclusions.map((inclusion) => (
                  <li key={plan.name + inclusion.label} className="flex items-center gap-4">
                    <span className={inclusion.isIncluded ? "text-green-500" : "text-red-400"}>
                      {inclusion.isIncluded ? "✅" : "❌"}
                    </span>
                    <p className="p-16-regular">{inclusion.label}</p>
                  </li>
                ))}
              </ul>

              {plan.price === 0 ? (
                <Button variant="outline" className="credits-btn">Free Consumable</Button>
              ) : (
                <SignedIn>
                  <RazorpayCheckout
                    plan={plan.name}
                    amount={plan.price}
                    credits={plan.credits}
                    buyerId={user._id}
                    userEmail={user.email}
                    userName={`${user.firstName} ${user.lastName}`}
                  />
                </SignedIn>
              )}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
};

export default Credits;
