import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Header from "@/components/shared/Header";
import TextToImageForm from "@/components/shared/TextToImageForm";
import { getUserById } from "@/lib/actions/user.actions";

const TextToImagePage = async () => {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");
  const user = await getUserById(userId);

  return (
    <>
      <Header
        title="Text to Image"
        subtitle="Describe anything and AI will generate it for you using Google Gemini"
      />
      <section className="mt-10">
        <TextToImageForm userId={user._id} creditBalance={user.creditBalance} />
      </section>
    </>
  );
};

export default TextToImagePage;
