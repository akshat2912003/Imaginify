"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";

export const Search = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query) {
        const newUrl = formUrlQuery({ searchParams: searchParams.toString(), key: "query", value: query });
        router.push(newUrl, { scroll: false });
      } else {
        const newUrl = removeKeysFromQuery({ searchParams: searchParams.toString(), keysToRemove: ["query"] });
        router.push(newUrl, { scroll: false });
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [router, searchParams, query]);

  return (
    <div className="search">
      <span className="text-dark-400">🔍</span>
      <Input
        className="search-field"
        placeholder="Search by content (e.g. sky, person, building...)"
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
};
