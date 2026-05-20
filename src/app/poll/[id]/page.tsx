"use client";

import { use, useEffect, useState } from "react";

import { supabase } from "@/services/supabase/client";
import { getPollStatus } from "@/lib/getPollStatus";

type Poll = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
};

type PollOption = {
  id: string;
  text: string;
  votes: number;
};

export default function PollPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [poll, setPoll] = useState<Poll | null>(
    null
  );

  const [options, setOptions] = useState<
    PollOption[]
  >([]);

  useEffect(() => {
    async function fetchPoll() {
      const { data: pollData } =
        await supabase
          .from("polls")
          .select("*")
          .eq("id", id)
          .single();

      const { data: optionsData } =
        await supabase
          .from("poll_options")
          .select("*")
          .eq("poll_id", id);

      setPoll(pollData);

      setOptions(optionsData || []);
    }

    fetchPoll();

    const channel = supabase
      .channel("poll-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "poll_options",
        },
        () => {
          fetchPoll();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  async function handleVote(
    optionId: string,
    currentVotes: number
  ) {
    if (!poll) return;

    const status = getPollStatus(
      poll.starts_at,
      poll.ends_at
    );

    if (status !== "em andamento") {
      alert(
        "Essa enquete não está disponível para votação."
      );

      return;
    }

    const { error } = await supabase
      .from("poll_options")
      .update({
        votes: currentVotes + 1,
      })
      .eq("id", optionId);

    if (error) {
      console.error(error);

      alert("Erro ao votar");

      return;
    }
  }

  if (!poll) {
    return (
      <main className="p-8">
        Carregando...
      </main>
    );
  }

  const totalVotes = options.reduce(
    (acc, option) => acc + option.votes,
    0
  );

  const status = getPollStatus(
    poll.starts_at,
    poll.ends_at
  );

  return (
    <main className="min-h-screen bg-[#F5F7FB] p-8">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#111827] md:text-4xl">
                {poll.title}
              </h1>

              <p className="mt-2 text-gray-500">
                Vote em tempo real
              </p>
            </div>

            <div
              className={`rounded-full px-4 py-2 text-sm font-medium
              ${status === "em andamento"
                  ? "bg-green-100 text-green-700"
                  : ""
                }

              ${status === "não iniciado"
                  ? "bg-yellow-100 text-yellow-700"
                  : ""
                }

              ${status === "finalizado"
                  ? "bg-red-100 text-red-700"
                  : ""
                }
            `}
            >
              {status}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {options.map((option) => {
              const percentage =
                totalVotes === 0
                  ? 0
                  : Math.round(
                    (option.votes /
                      totalVotes) *
                    100
                  );

              return (
                <button
                  key={option.id}
                  disabled={
                    status !==
                    "em andamento"
                  }
                  onClick={() =>
                    handleVote(
                      option.id,
                      option.votes
                    )
                  }
                 className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <div
                    className="absolute left-0 top-0 h-full rounded-2xl bg-gradient-to-r from-[#E5E7EB] to-[#F3F4F6] transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />

                  <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-[#111827]">
                        {option.text}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {option.votes} votos
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="block text-xl font-bold text-[#111827]">
                        {percentage}%
                      </span>

                      <span className="text-sm text-gray-500">
                        {option.votes} {option.votes === 1 ? "voto" : "votos"}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}