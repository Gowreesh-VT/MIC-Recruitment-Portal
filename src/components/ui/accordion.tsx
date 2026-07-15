"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b-2 border-[#E5A039]/50 py-1", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & {
    onPlaySound?: () => void
  }
>(({ className, children, onPlaySound, onClick, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      onClick={(e) => {
        if (onPlaySound) onPlaySound();
        if (onClick) onClick(e);
      }}
      className={cn(
        "flex flex-1 items-center justify-between py-3 px-3 font-press-start text-white text-[11px] md:text-[13px] leading-relaxed transition-all hover:bg-black/15 hover:text-[#FFCEBC] rounded-sm text-left [&[data-state=open]>svg]:rotate-180 drop-shadow-[1px_1px_0px_rgba(0,0,0,0.5)] cursor-pointer select-none",
        className
      )}
      {...props}
    >
      <span className="pr-4">{children}</span>
      <ChevronDown className="h-4 w-4 shrink-0 text-[#FFCEBC] transition-transform duration-200 drop-shadow-[1px_1px_0px_rgba(0,0,0,0.5)]" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden font-press-start text-white text-[10px] md:text-[11px] leading-relaxed transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div
      className={cn(
        "mt-1 mb-3 mx-3 p-3.5 bg-black/30 border-l-4 border-[#FFB59F] rounded-r shadow-inner select-text",
        className
      )}
    >
      {children}
    </div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
