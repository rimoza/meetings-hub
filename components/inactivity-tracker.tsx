"use client";

import { useInactivityTracker } from "@/hooks/use-inactivity-tracker";

export function InactivityTracker() {
  useInactivityTracker();
  return null;
}