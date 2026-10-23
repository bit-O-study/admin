"use client";
import NextLink, { useLinkStatus } from "next/link";
import type { ComponentProps } from "react";
import { createPortal } from "react-dom";
import { Buffering } from "./Buffering";
function Progress() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return createPortal(<Buffering overlay />, document.body);
}
export default function PendingLink({ children, ...props }: ComponentProps<typeof NextLink>) {
  return <NextLink {...props}>{children}<Progress /></NextLink>;
}
