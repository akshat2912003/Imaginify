import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs";

import { Collection } from "@/components/shared/Collection";
import { navLinks } from "@/constants";
import { getUserImages } from "@/lib/actions/image.actions";
import { getUserById } from "@/lib/actions/user.actions";

const Home = async ({ searchParams }: { searchParams: { page?: string; query?: string } }) => {
  const { userId } = auth();
  
  const page = Number(searchParams?.page) || 1;
  const searchQuery = (searchParams?.query as string) || "";

  let images: { data: any[]; totalPages: number } = { data: [], totalPages: 1 };
  
  if (userId) {
    const currentUser = await getUserById(userId);
    
    if (currentUser) {
      const res = await getUserImages({ page, userId: currentUser._id });
      if (res && res.data) {
        images = res;
      }
    }
  }

  return (
    <>
      <section className="home">
        <h1 className="home-heading">
          Unleash Your Creative Vision with Imaginify
        </h1>
        <ul className="flex-center w-full gap-20">
          {navLinks.slice(1, 5).map((link) => (
            <Link
              key={link.route}
              href={link.route}
              className="flex-center flex-col gap-2"
            >
              <li className="flex-center w-fit rounded-full bg-white p-4">
                <Image src={link.icon} alt="image" width={24} height={24} />
              </li>
              <p className="p-14-medium text-center text-white">{link.label}</p>
            </Link>
          ))}
        </ul>
      </section>

      <section className="sm:mt-12">
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
