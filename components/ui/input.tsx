import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-gray-500 dark:placeholder:text-gray-400 selection:bg-primary selection:text-primary-foreground",
        "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 h-9 w-full min-w-0 rounded-md px-3 py-1 text-base text-gray-900 dark:text-gray-100 shadow-sm dark:shadow-md transition-colors duration-300 outline-none",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  );
}

export { Input };
