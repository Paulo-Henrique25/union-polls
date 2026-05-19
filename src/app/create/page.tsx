"use client";

import {
  useFieldArray,
  useForm,
} from "react-hook-form";

import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import { supabase } from "@/services/supabase/client";

const createPollSchema = z.object({
  title: z.string().min(3),

  starts_at: z.string(),

  ends_at: z.string(),

  options: z
    .array(
      z.object({
        text: z.string().min(1),
      })
    )
    .min(3),
});

type CreatePollFormData = z.infer<
  typeof createPollSchema
>;

export default function CreatePollPage() {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePollFormData>({
    resolver: zodResolver(
      createPollSchema
    ),

    defaultValues: {
      options: [
        { text: "" },
        { text: "" },
        { text: "" },
      ],
    },
  });

  const {
    fields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "options",
  });

  async function onSubmit(
    data: CreatePollFormData
  ) {
    const { data: pollData, error } =
      await supabase
        .from("polls")
        .insert({
          title: data.title,
          starts_at: data.starts_at,
          ends_at: data.ends_at,
        })
        .select()
        .single();

    if (error) {
      console.error(error);
      return;
    }

    const optionsPayload =
      data.options.map((option) => ({
        text: option.text,
        poll_id: pollData.id,
      }));

    await supabase
      .from("poll_options")
      .insert(optionsPayload);

    alert("Enquete criada!");

    reset();
  }

  return (
    <main className="min-h-screen bg-[#F5F7FB] p-8">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#111827]">
            Criar enquete
          </h1>

          <p className="mt-2 text-gray-500">
            Crie uma votação em tempo real
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Título
            </label>

            <input
              type="text"
              placeholder="Digite o título"
              {...register("title")}
              className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 outline-none transition focus:border-black"
            />

            {errors.title && (
              <span className="mt-2 block text-sm text-red-500">
                Título obrigatório
              </span>
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Data início
              </label>

              <input
                type="datetime-local"
                {...register("starts_at")}
                className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 outline-none transition focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Data fim
              </label>

              <input
                type="datetime-local"
                {...register("ends_at")}
                className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 outline-none transition focus:border-black"
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#111827]">
                Opções
              </h2>

              <button
                type="button"
                onClick={() =>
                  append({ text: "" })
                }
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium transition hover:border-black"
              >
                Adicionar
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {fields.map(
                (field, index) => (
                  <div
                    key={field.id}
                    className="flex gap-3"
                  >
                    <input
                      type="text"
                      placeholder={`Opção ${
                        index + 1
                      }`}
                      {...register(
                        `options.${index}.text`
                      )}
                      className="flex-1 rounded-2xl border border-gray-200 px-5 py-4 outline-none transition focus:border-black"
                    />

                    {fields.length > 3 && (
                      <button
                        type="button"
                        onClick={() =>
                          remove(index)
                        }
                        className="rounded-2xl border border-red-200 px-4 text-red-500 transition hover:bg-red-50"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                )
              )}
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 rounded-2xl bg-[#111827] py-4 text-lg font-semibold text-white transition hover:opacity-90"
          >
            Criar enquete
          </button>
        </form>
      </div>
    </main>
  );
}