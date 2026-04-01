import type { HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "../../lib/cn";

export const Card = ({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) => (
  <div
    className={cn(
      "glass-panel rounded-[28px] border border-white/60 bg-white/75 p-6",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

