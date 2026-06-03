"use client";

import dynamic from "next/dynamic";

const FloatingCamera = dynamic(() => import("./FloatingCamera"), { ssr: false });

export default function GlobalCamera() {
  return <FloatingCamera />;
}
