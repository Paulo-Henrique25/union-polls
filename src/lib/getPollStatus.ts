export function getPollStatus(
  startsAt: string,
  endsAt: string
) {
  const now = new Date();

  const start = new Date(startsAt);
  const end = new Date(endsAt);

  if (now < start) {
    return "não iniciado";
  }

  if (now > end) {
    return "finalizado";
  }

  return "em andamento";
}