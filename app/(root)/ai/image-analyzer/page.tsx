import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Header from "@/components/shared/Header";
import ImageAnalyzerForm from "@/components/shared/ImageAnalyzerForm";
import { getUserById } from "@/lib/actions/user.actions";

const ImageAnalyzerPage = async () => {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");
  const user = await getUserById(userId);

  return (
    <>
      <Header
        title="Image Analyzer"
        subtitle="Upload any image and Google Gemini AI will tell you everything about it"
      />
      <section className="mt-10">
        <ImageAnalyzerForm userId={user._id} creditBalance={user.creditBalance} />
      </section>
    </>
  );
};

export default ImageAnalyzerPage;
