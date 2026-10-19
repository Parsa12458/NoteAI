import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const appleSpring = {
  type: "spring",
  bounce: 0,
  duration: 0.38,
};

export const appleMomentumSpring = {
  type: "spring",
  bounce: 0.18,
  duration: 0.48,
};

export const appleSnappySpring = {
  type: "spring",
  bounce: 0,
  duration: 0.22,
};
