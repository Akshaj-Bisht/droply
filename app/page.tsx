"use client";

import { client } from "@/lib/orpc";

export default function Home() {
  async function create() {
    const res = await client.file.create({
      name: "test.txt",
      size: 100,
    });

    alert(res.token);
  }

  return (
    <main>
      <h1>Droply</h1>
      <button onClick={create}>Test oRPC</button>
    </main>
  );
}
