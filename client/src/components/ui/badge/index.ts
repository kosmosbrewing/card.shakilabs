import { cva, type VariantProps } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2 py-0.5 text-caption font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        // deduction/highlight variants were copied in from 02.finance, but this
        // app's theme never defined those colours, so Tailwind emitted no rule.
        // Zero call sites either, so the variants are removed outright.
        // 반투명 회색(70%) 위 하드코딩 흰 글자는 라이트 3.37:1·다크 3.46:1로 양쪽 다 미달이다.
        // 알파를 걷어 불투명 --muted-foreground 위 --background를 쓰면 6.51:1·8.64:1이 된다.
        neutral: "border-border/50 bg-muted-foreground text-background",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;

export { default as Badge } from "./Badge.vue";
