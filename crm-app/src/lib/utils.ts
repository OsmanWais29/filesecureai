import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge Tailwind class names, letting later classes win ("p-2" + "p-4" -> "p-4")
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
