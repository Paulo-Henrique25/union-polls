"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { supabase } from "@/services/supabase/client";
import { getPollStatus } from "@/lib/getPollStatus";

type Poll = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
};

function formatDate(date: string) {
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}


export default function Home() {
  const [polls, setPolls] = useState<Poll[]>([]);

  useEffect(() => {
    async function fetchPolls() {
      const { data, error } = await supabase
        .from("polls")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(error);
        return;
      }

      setPolls(data || []);
    }

    fetchPolls();
  }, []);

  return (
    <main className="min-h-screen bg-[#F5F7FB] p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#111827] md:text-4xl">
              Enquetes
            </h1>

            <p className="mt-2 text-gray-500">
              Gerencie e acompanhe votações em
              tempo real
            </p>
          </div>

          <Link
            href="/create"
           className="w-full rounded-xl bg-[#111827] px-5 py-3 text-center font-medium text-white transition hover:opacity-90 md:w-fit"
          >
            Nova enquete
          </Link>
        </div>

        <div className="grid gap-5">
          {polls.map((poll) => {
            const status = getPollStatus(
              poll.starts_at,
              poll.ends_at
            );

            return (
              <Link
                key={poll.id}
                href={`/poll/${poll.id}`}
               className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-[#111827]">
                      {poll.title}
                    </h2>

                    <div className="mt-4 flex flex-col gap-1 text-sm text-gray-500">
                      <span>
                        Início:{" "}
                        {formatDate(poll.starts_at)}
                      </span>

                      <span>
                        Fim:{" "}
                        {formatDate(poll.ends_at)}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`rounded-full px-4 py-2 text-sm font-medium
                    ${
                      status === "em andamento"
                        ? "bg-green-100 text-green-700"
                        : ""
                    }

                    ${
                      status === "não iniciado"
                        ? "bg-yellow-100 text-yellow-700"
                        : ""
                    }

                    ${
                      status === "finalizado"
                        ? "bg-red-100 text-red-700"
                        : ""
                    }
                  `}
                  >
                    {status}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}