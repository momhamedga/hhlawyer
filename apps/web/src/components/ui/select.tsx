"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import * as React from "react";

import { useLocale } from "@/components/providers/LocaleProvider";
import { cn } from "./cn";

const EMPTY_VALUE = "__hhlawyer_empty_select_value__";
const SelectValueContext = React.createContext<string | undefined>(undefined);

function toPrimitiveValue(value: string | undefined) {
  return value === "" ? EMPTY_VALUE : value;
}

function fromPrimitiveValue(value: string) {
  return value === EMPTY_VALUE ? "" : value;
}

type SelectProps = Omit<React.ComponentProps<typeof SelectPrimitive.Root>, "defaultValue" | "onValueChange" | "value"> & {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  value?: string;
};

export function Select({ defaultValue, dir, onValueChange, value, ...props }: SelectProps) {
  const locale = useLocale();
  return (
    <SelectValueContext.Provider value={value ?? defaultValue}>
      <SelectPrimitive.Root
        defaultValue={toPrimitiveValue(defaultValue)}
        dir={dir ?? (locale === "ar" ? "rtl" : "ltr")}
        onValueChange={(nextValue) => onValueChange?.(fromPrimitiveValue(nextValue))}
        value={toPrimitiveValue(value)}
        {...props}
      />
    </SelectValueContext.Provider>
  );
}

export const SelectGroup = SelectPrimitive.Group;

export const SelectValue = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Value>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Value className={cn("min-w-0 flex-1 truncate", className)} ref={ref} {...props} />
));
SelectValue.displayName = "SelectValue";

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ children, className, ...props }, ref) => {
  const value = React.useContext(SelectValueContext);
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "group flex min-h-11 w-full min-w-0 items-center justify-between gap-2 rounded-ds-md border border-input bg-card px-3 py-2 text-start text-base text-card-foreground shadow-elevation-sm outline-none transition-colors hover:border-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      data-value={value}
      ref={ref}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-data-[state=open]:rotate-180 motion-reduce:transition-none" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});
SelectTrigger.displayName = "SelectTrigger";

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ children, className, collisionPadding = 12, position = "popper", sideOffset = 6, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      className={cn(
        "z-[70] max-h-[min(22rem,var(--radix-select-content-available-height))] w-[var(--radix-select-trigger-width)] min-w-0 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-ds-md border border-border bg-popover text-popover-foreground shadow-elevation-md",
        className,
      )}
      collisionPadding={collisionPadding}
      position={position}
      ref={ref}
      sideOffset={sideOffset}
      {...props}
    >
      <SelectPrimitive.ScrollUpButton className="flex h-8 cursor-default items-center justify-center border-b border-border bg-popover text-muted-foreground">
        <ChevronUp aria-hidden="true" className="size-4" />
      </SelectPrimitive.ScrollUpButton>
      <SelectPrimitive.Viewport className="max-h-[min(20rem,var(--radix-select-content-available-height))] w-full min-w-0 scroll-py-1 overflow-y-auto p-1">
        {children}
      </SelectPrimitive.Viewport>
      <SelectPrimitive.ScrollDownButton className="flex h-8 cursor-default items-center justify-center border-t border-border bg-popover text-muted-foreground">
        <ChevronDown aria-hidden="true" className="size-4" />
      </SelectPrimitive.ScrollDownButton>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = "SelectContent";

export const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label className={cn("px-3 py-2 text-xs font-extrabold text-muted-foreground", className)} ref={ref} {...props} />
));
SelectLabel.displayName = "SelectLabel";

type SelectItemProps = Omit<React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>, "value"> & { value: string };

export const SelectItem = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Item>, SelectItemProps>(
  ({ children, className, value, ...props }, ref) => (
    <SelectPrimitive.Item
      className={cn(
        "relative flex min-h-11 w-full cursor-default select-none items-center rounded-ds-sm border border-transparent py-2 ps-3 pe-9 text-start text-sm leading-6 outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-45 data-[highlighted]:border-border data-[highlighted]:bg-secondary data-[highlighted]:text-secondary-foreground data-[state=checked]:border-accent data-[state=checked]:bg-secondary data-[state=checked]:font-bold data-[state=checked]:text-secondary-foreground",
        className,
      )}
      data-select-value={value}
      ref={ref}
      value={toPrimitiveValue(value) ?? value}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute end-2.5 inline-flex size-5 items-center justify-center text-accent">
        <Check aria-hidden="true" className="size-4" strokeWidth={2.5} />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  ),
);
SelectItem.displayName = "SelectItem";

export const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator className={cn("my-1 h-px bg-border", className)} ref={ref} {...props} />
));
SelectSeparator.displayName = "SelectSeparator";
