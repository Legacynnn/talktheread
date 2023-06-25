"use client";

import { Prisma, Room } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import debounce from "lodash.debounce";
import { Users } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/Command";
import { useOnClickOutside } from "../hooks/use-on-click-outside";

export default function SearchBar() {
  const [input, setInput] = useState<string>("");

  const router = useRouter();

  const {
    data: queryResult,
    refetch,
    isFetched,
    isFetching,
  } = useQuery({
    queryFn: async () => {
      if (!input) return [];
      const { data } = await axios.get(`/api/search?q=${input}`);
      return data as (Room & {
        _count: Prisma.RoomCountOutputType;
      })[];
    },
    queryKey: ["search-query"],
    enabled: false,
  });

  const request = debounce(async () => {
    refetch();
  }, 300);

  const debaunceRequest = useCallback(() => {
    request();
  }, []);

  const commandRef = useRef<HTMLDivElement>(null)

  useOnClickOutside(commandRef, () => {
    setInput('')
  })

  const pathName = usePathname()
  
  useEffect(() => {
    setInput('')
  }, [pathName])

  return (
    <Command ref={commandRef} className="relative z-50 max-w-lg overflow-visible rounded-lg border">
      <CommandInput
        value={input}
        onValueChange={(text) => {
          setInput(text);
          debaunceRequest();
        }}
        className="border-none outline-none ring-0 focus:border-none focus:outline-none"
        placeholder="Search Communities"
      />

      {input.length > 0 ? (
        <CommandList className="absolute inset-x-0 top-full rounded-b-md bg-white shadow">
          {isFetched && <CommandEmpty>No results found.</CommandEmpty>}
          {(queryResult?.length ?? 0) > 0 ? (
            <CommandGroup heading="Communities">
              {queryResult?.map((room) => (
                <CommandItem
                  key={room.id}
                  value={room.name}
                  onSelect={(e) => {
                    router.push(`/c/${e}`);
                    router.refresh();
                  }}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <a href={`/c/${room.name}`}>c/{room.name}</a>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      ) : null}
    </Command>
  );
}
