import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function randomBetween(max = 1, min = 0) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function diceRoll() {
  return randomBetween(6, 1)
}
