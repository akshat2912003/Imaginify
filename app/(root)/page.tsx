import { Collection } from "@/components/shared/Collection";
import { getUserImages } from "@/lib/actions/image.actions";
import { getUserById } from "@/lib/actions/user.actions";
import { navLinks } from "@/constants";
import Link from "next/link";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const Home = async ({ searchParams }: { searchParams: { page?: string; query?: string } }) => {
  const { userId } = auth();
  
  const page = Number(searchParams?.page) || 1;
  const searchQuery = (searchParams?.query as string) || "";

  let images = { data: [], totalPages: 1 };
  
  if (userId) {
    // Get the current user's MongoDB _id
    const currentUser = await getUserById(userId);
    
    if (currentUser) {
      // Fetch only this user's images
      images = await getUserImages({ page, userId: currentUser._id });
    }
  }

  const aiTools = [
    { label: "Image Restore", route: "/transformations/add/restore", icon: "🖼️", desc: "Restore damaged images" },
    { label: "Generative Fill", route: "/transformations/add/fill", icon: "✨", desc: "AI outpainting" },
    { label: "Object Remove", route: "/transformations/add/remove", icon: "🗑️", desc: "Remove objects" },
    { label: "Object Recolor", route: "/transformations/add/recolor", icon: "🎨", desc: "Recolor objects" },
  ];

  return (
    <>
      {/* Hero Banner */}
      <section className="home">
        <h1 className="home-heading">
          Unleash Your Creative Vision with Imaginify
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-8 mt-2">
          {aiTools.map((tool) => (
            <Link key={tool.route} href={tool.route} className="flex flex-col items-center gap-2 group">
              <div className="flex-center w-14 h-14 rounded-full bg-white/20 group-hover:bg-white/30 transition-all text-2xl">
                {tool.icon}
              </div>
              <p className="text-white text-sm font-medium">{tool.label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Mobile banner */}
      <section className="sm:hidden flex flex-col gap-4 rounded-[20px] bg-banner p-8 mb-6">
        <h1 className="text-2xl font-bold text-white text-center">Unleash Your Creative Vision</h1>
        <div className="flex flex-wrap justify-center gap-4">
          {aiTools.map((tool) => (
            <Link key={tool.route} href={tool.route} className="flex flex-col items-center gap-1">
              <div className="flex-center w-12 h-12 rounded-full bg-white/20 text-xl">{tool.icon}</div>
              <p className="text-white text-xs">{tool.label}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <Collection
          hasSearch={true}
          images={images?.data}
          totalPages={images?.totalPages}
          page={page}
        />
      </section>
    </>
  );
};

export default Home;
