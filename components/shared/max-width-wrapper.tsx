import { cn } from "../../lib/utils";

export default function MaxWidthWrapper({
  className,
  children,
}: IMaxWidthWrapper) {
  return (
    <div className={cn("max-w-7xl mx-auto px-4 sm:px-5 md:px-10", className)}>
      {children}
    </div>
  );
}
