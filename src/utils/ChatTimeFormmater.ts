import { formatDistanceToNow, parseISO } from "date-fns";

export function formatTime(iso: string) {



  return formatDistanceToNow(
    parseISO((iso)

    ), { addSuffix: true })

}

export function formatDateLabel(iso: string) {

  const d = new Date(iso);

  const now = new Date();

  const y = new Date();

  y.setDate(now.getDate() - 1);

  if (d.toDateString() === now.toDateString())
    return "Today";

  if (d.toDateString() === y.toDateString())
    return "Yesterday";

  return d.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric"
  });

}
