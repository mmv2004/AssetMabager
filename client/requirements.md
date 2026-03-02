## Packages
framer-motion | Page transitions and scroll-triggered animations
date-fns | Formatting dates for bookings
lucide-react | UI icons
react-day-picker | Calendar component for booking

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  sans: ["var(--font-sans)"],
  display: ["var(--font-display)"],
}
Assuming standard Shadcn UI components are available in `@/components/ui/`.
Using `wouter` for routing. Link components are styled directly using `buttonVariants` to avoid nested buttons.
