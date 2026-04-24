// app/api/google-quote/route.ts
import { NextResponse } from "next/server";

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxpiz1iNWeGVmU4j5iOn2MvEhbHw3CTa4Tj6AtSA0uCbI6YMq1EglROiaFvSMhZB9bx0g/exec";

export async function POST(request: Request) {
  try {
    // On récupère le body tel quel (JSON stringifié depuis le front)
    const body = await request.text();

    // Appel côté serveur vers Apps Script
    const res = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body,
    });

    const text = await res.text();

    // On renvoie au front ce que renvoie Apps Script
    return new NextResponse(text, {
      status: res.status,
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
    });
  } catch (err) {
    console.error("Erreur proxy vers Apps Script:", err);
    return NextResponse.json(
      { status: "error", message: "Proxy error" },
      { status: 500 },
    );
  }
}