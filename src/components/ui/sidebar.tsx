
"use client";

import * as React from "react";
import { VariantProps, cva } from "class-variance-authority";
import { ChevronLeft, PanelLeft, SearchIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slot } from "@radix-ui/react-slot";

const MOBILE_BREAKPOINT = 768; // Standard md breakpoint
const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const SIDEBAR_WIDTH = "16rem"; // Equivalent to w-64
const SIDEBAR_WIDTH_MOBILE = "18rem"; // Equivalent to w-72 for mobile sheet
const SIDEBAR_WIDTH_ICON = "3.5rem"; // Increased slightly for better icon display w-14
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContextValue = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean | ((prevState: boolean) => boolean)) => void;
  mounted: boolean;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

export const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(
  (props, ref) => {
    const { defaultOpen = true, open: openProp, onOpenChange: setOpenProp, className, style, children, ...restProps } = props;
    const [openState, _setOpenState] = React.useState(defaultOpen);
    const [isMobile, setIsMobile] = React.useState(false); // Initial value, will be updated client-side
    const [mounted, setMounted] = React.useState(false);
    const [openMobile, setOpenMobile] = React.useState(false);

    React.useEffect(() => {
      setMounted(true); // Indicates client-side execution

      const handleResize = () => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      };
      
      handleResize(); // Initial check on mount
      window.addEventListener("resize", handleResize);
      
      // Cookie logic: Read cookie only if component is uncontrolled and on initial mount
      if (openProp === undefined) {
        const cookie = document.cookie
          .split("; ")
          .find((row) => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`));
        if (cookie) {
          const cookieValue = cookie.split("=")[1] === "true";
          // Set state from cookie if different from initial openState (derived from defaultOpen)
          // This check helps prevent unnecessary re-renders if cookie matches default
          if (cookieValue !== openState) { 
            _setOpenState(cookieValue);
          }
        }
      }
      
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, [openProp]); // Effect runs on mount and if openProp changes (e.g. from undefined to value)

    const isOpen = openProp ?? openState;
    
    const setOpen = React.useCallback(
      (value: boolean | ((current: boolean) => boolean)) => {
        const newOpenState = typeof value === "function" ? value(isOpen) : value;
        if (setOpenProp) {
          setOpenProp(newOpenState);
        } else {
          _setOpenState(newOpenState);
          if (mounted) { // Ensure document is available (client-side)
            document.cookie = `${SIDEBAR_COOKIE_NAME}=${newOpenState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
          }
        }
      },
      [setOpenProp, isOpen, mounted] // mounted added as dependency
    );
    
    const toggleSidebar: () => void = React.useCallback(() => {
      if (isMobile) {
        setOpenMobile((v) => !v);
      } else {
        setOpen((v) => !v); // setOpen will handle cookie logic
      }
    }, [isMobile, setOpen]);
    
    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          toggleSidebar();
        }
      };
      if (mounted) { // Only add listener after mount
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
      }
    }, [toggleSidebar, mounted]);

    const currentUiState = isMobile ? "expanded" : isOpen ? "expanded" : "collapsed";
    
    const contextValue = React.useMemo<SidebarContextValue>(
      () => ({ 
        state: currentUiState, 
        open: isOpen, 
        setOpen,
        isMobile, 
        toggleSidebar, 
        openMobile, 
        setOpenMobile, 
        mounted 
      }),
      [currentUiState, isOpen, setOpen, isMobile, toggleSidebar, openMobile, setOpenMobile, mounted]
    );
 
    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            style={{
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-mobile": SIDEBAR_WIDTH_MOBILE,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties}
            className={cn("group/sidebar-wrapper flex min-h-screen", className)}
            ref={ref}
            {...restProps}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    );
  }
);
SidebarProvider.displayName = "SidebarProvider";

const sidebarVariants = cva(
  "fixed inset-y-0 z-40 flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-lg transition-[width,transform] duration-300 ease-in-out print:hidden data-[side=right]:border-l data-[side=right]:border-r-0",
  {
    variants: {
      variant: {
        default:
          "group-data-[state=collapsed]/sidebar:w-[var(--sidebar-width-icon)] group-data-[state=expanded]/sidebar:w-[var(--sidebar-width)]",
        icon: "group-data-[state=collapsed]/sidebar:w-[var(--sidebar-width-icon)] group-data-[state=expanded]/sidebar:w-[var(--sidebar-width-icon)]",
        wide: "group-data-[state=collapsed]/sidebar:w-[var(--sidebar-width-icon)] group-data-[state=expanded]/sidebar:w-[var(--sidebar-width-mobile)]",
      },
      side: {
        left: "left-0",
        right: "right-0 border-l border-r-0",
      },
    },
    defaultVariants: {
      variant: "default",
      side: "left",
    },
  }
);

type SidebarRootProps = React.ComponentProps<"aside"> &
  VariantProps<typeof sidebarVariants>;

const Sidebar = React.forwardRef<HTMLDivElement, SidebarRootProps>(
  ({ className, variant, side, ...props }, ref) => {
    const { state, isMobile, openMobile, setOpenMobile, mounted } = useSidebar();
    
    if (!mounted) {
      // SSR and initial client render: always render the desktop <aside> structure.
      // 'state' here is based on 'defaultOpen' (from SidebarProvider) as isMobile is false.
      const ssrClientVariant = variant ?? "default"; 
      return (
        <aside
          ref={ref}
          className={cn(
            "group/sidebar",
            sidebarVariants({ variant: ssrClientVariant, side, className })
          )}
          data-state={state} // state is 'expanded' or 'collapsed' based on defaultOpen
          {...props}
        />
      );
    }

    // Client-side, after mount: isMobile is reliable
    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetContent
            side={side ?? "left"}
            className={cn(
              "m-0 flex h-full flex-col gap-0 p-0 shadow-none",
              side === "right" ? "border-l" : "border-r",
              "w-[var(--sidebar-width-mobile)] bg-sidebar text-sidebar-foreground",
              className 
            )}
          >
            {props.children} 
          </SheetContent>
        </Sheet>
      );
    }

    // Client-side, desktop view after mount
    const desktopVariant = variant ?? "default";
    return (
      <aside
        ref={ref}
        className={cn(
          "group/sidebar",
          sidebarVariants({ variant: desktopVariant, side, className })
        )}
        data-state={state} // current context state reflecting cookie or prop
        {...props}
      />
    );
  }
);
Sidebar.displayName = "Sidebar";

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-16 shrink-0 items-center",
        "[&>:first-child]:pl-3 [&>:first-child]:pr-2 [&>:last-child]:pl-2 [&>:last-child]:pr-3",
        className
      )}
      {...props}
    />
  );
});
SidebarHeader.displayName = "SidebarHeader";

const SidebarBrand = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { asChild?: boolean }
>(({ className, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      ref={ref}
      className={cn("flex grow items-center gap-2", className)}
      {...props}
    />
  );
});
SidebarBrand.displayName = "SidebarBrand";

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("grow overflow-auto", className)}
      {...props}
    />
  );
});
SidebarContent.displayName = "SidebarContent";

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex shrink-0 flex-col items-stretch gap-2 border-t border-sidebar-border p-2",
        className
      )}
      {...props}
    />
  );
});
SidebarFooter.displayName = "SidebarFooter";

const SidebarMenu = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex grow flex-col gap-0.5", className)}
      {...props}
    />
  );
});
SidebarMenu.displayName = "SidebarMenu";

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li"> & { asChild?: boolean }
>(({ className, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : "li";
  return <Comp ref={ref} className={cn("block", className)} {...props} />;
});
SidebarMenuItem.displayName = "SidebarMenuItem";

type SidebarMenuButtonProps = ButtonProps & {
  isActive?: boolean;
  tooltip?: Omit<React.ComponentProps<typeof TooltipContent>, "children"> & {
    children: React.ReactNode;
  };
};

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(
  (
    {
      className,
      variant = "ghost",
      size = "default",
      isActive,
      tooltip,
      children,
      ...props
    },
    ref
  ) => {
    const { state: currentUiState, isMobile, mounted } = useSidebar();
    const showTooltip = mounted && currentUiState === "collapsed" && !isMobile && tooltip;

    const button = (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        data-active={isActive}
        className={cn(
          "h-auto w-full items-center justify-start gap-2 whitespace-nowrap rounded-md px-2 py-2 text-left",
          "text-sidebar-foreground/75 hover:text-sidebar-foreground",
          "hover:bg-sidebar-accent focus-visible:bg-sidebar-accent focus-visible:text-sidebar-foreground",
          "data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:hover:bg-sidebar-primary data-[active=true]:hover:text-sidebar-primary-foreground",
          mounted && currentUiState === "collapsed" && !isMobile && "justify-center px-0",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );

    if (showTooltip) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent {...tooltip} side="right" sideOffset={8}>
            {tooltip.children}
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  }
);
SidebarMenuButton.displayName = "SidebarMenuButton";

const SidebarSeparator = React.forwardRef<
  HTMLHRElement,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
  return (
    <Separator
      ref={ref}
      className={cn(
        "my-1 h-[1px] bg-sidebar-border opacity-50",
        className
      )}
      {...props}
    />
  );
});
SidebarSeparator.displayName = "SidebarSeparator";

const SidebarSection = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    label?: string;
    separator?: boolean;
  }
>(({ className, label, separator = false, ...props }, ref) => {
  const { state: currentUiState, isMobile, mounted } = useSidebar();
  const showLabel = mounted && (currentUiState === "expanded" || isMobile);

  return (
    <div
      ref={ref}
      className={cn("flex flex-col gap-0.5", className)}
      {...props}
    >
      {separator && <SidebarSeparator />}
      {label && showLabel && (
        <div className="mb-1 mt-2 px-2 text-xs/relaxed font-medium uppercase tracking-wider text-sidebar-foreground/50">
          {label}
        </div>
      )}
      {props.children}
    </div>
  );
});
SidebarSection.displayName = "SidebarSection";

const SidebarSheetClose = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof SheetClose>
>((props, ref) => {
  const { isMobile, mounted } = useSidebar();
  if (!mounted || !isMobile) return null;
  return <SheetClose ref={ref} {...props} />;
});
SidebarSheetClose.displayName = "SidebarSheetClose";


const sidebarInsetVariants = cva("transition-[padding] duration-300 ease-in-out", {
  variants: {
    state: { 
      expanded: "pl-[var(--sidebar-width)]",
      collapsed: "pl-[var(--sidebar-width-icon)]",
    },
    side: {
      left: "",
      right: "",
    },
  },
  compoundVariants: [
    {
      state: "expanded",
      side: "right",
      className: "pr-[var(--sidebar-width)] pl-0",
    },
    {
      state: "collapsed",
      side: "right",
      className: "pr-[var(--sidebar-width-icon)] pl-0",
    },
  ],
});

type SidebarInsetProps = React.ComponentProps<"div"> &
  VariantProps<typeof sidebarInsetVariants> & {
    asChild?: boolean;
  };

export const SidebarInset = React.forwardRef<HTMLDivElement, SidebarInsetProps>(
  ({ className, asChild, side = "left", ...props }, ref) => {
    const { state: currentUiState, isMobile, mounted } = useSidebar();
    const Comp = asChild ? Slot : "div";

    if (!mounted || isMobile) { 
      return <Comp ref={ref} className={cn("flex-1", className)} {...props} />;
    }

    return (
      <Comp
        ref={ref}
        className={cn("flex-1", sidebarInsetVariants({ state: currentUiState, side }), className)}
        {...props}
      />
    );
  }
);
SidebarInset.displayName = "SidebarInset";


const SidebarSearch = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => {
  const { state: currentUiState, isMobile, mounted } = useSidebar();
  if (!mounted) { 
    return <Input ref={ref} className={cn("sr-only", className)} {...props} />; 
  }
  return (
    <div className="relative px-2">
      <SearchIcon className="absolute left-4 top-1/2 size-4 -translate-y-1/2 transform text-foreground/50" />
      <Input
        ref={ref}
        className={cn(
          "h-auto rounded-md py-2 pl-8 pr-2 placeholder:text-foreground/50",
          currentUiState === "collapsed" && !isMobile && "sr-only",
          className
        )}
        placeholder="Search..."
        {...props}
      />
    </div>
  );
});
SidebarSearch.displayName = "SidebarSearch";


const SidebarToggle = React.forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, "size">
>(({ className, children, ...props }, ref) => {
  const { toggleSidebar, isMobile, state: currentUiState, mounted } = useSidebar(); 
  if (!mounted || isMobile) return null;

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn(
        "size-8 shrink-0 rounded-full text-foreground/75 hover:text-foreground",
        className
      )}
      onClick={toggleSidebar}
      {...props}
    >
      {children ?? (
        <>
          <ChevronLeft
            className={cn(
              "size-4 transition-transform duration-300 ease-in-out",
              currentUiState === "collapsed" && "rotate-180"
            )}
          />
          <span className="sr-only">Toggle sidebar</span>
        </>
      )}
    </Button>
  );
});
SidebarToggle.displayName = "SidebarToggle";
 
export { 
  // SidebarProvider and useSidebar are already exported above
  Sidebar,
  SidebarHeader,
  SidebarBrand,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarSection,
  SidebarSearch,
  SidebarToggle,
  SidebarSheetClose,
  // SidebarInset is already exported above
};
