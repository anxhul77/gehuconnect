
export function formatTime(iso:string){

  const d = new Date(iso);

  return d.toLocaleTimeString([],{
    hour:"2-digit",
    minute:"2-digit"
  });

}

export function formatDateLabel(iso:string){

  const d = new Date(iso);

  const now = new Date();

  const y = new Date();

  y.setDate(now.getDate()-1);

  if(d.toDateString()===now.toDateString())
    return "Today";

  if(d.toDateString()===y.toDateString())
    return "Yesterday";

  return d.toLocaleDateString([],{
    weekday:"long",
    month:"long",
    day:"numeric"
  });

}
