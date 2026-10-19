import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Custom font-size tokens from globals.css; without this, tailwind-merge treats them as text colors and drops them.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['tag', 'caption', 'note', 'body', 'title', 'heading', 'headline', 'display', 'hero'],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
