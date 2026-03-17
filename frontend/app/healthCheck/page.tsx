export default async function page() {
  const res = await fetch(process.env.RAILS_API_URL + "/health_check");

  const data = await res.json();

  if (!res.ok) {
    throw new Error("API connection error");
  }

  return <div>{data.message}</div>;
}
