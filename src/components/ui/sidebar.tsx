
"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
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

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const SIDEBAR_WIDTH = "16rem"; // Equivalent to w-64
const SIDEBAR_WIDTH_MOBILE = "18rem"; // Equivalent to w-72
const SIDEBAR_WIDTH_ICON = "3rem"; // Equivalent to w-12
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContextValue = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  mounted: boolean; // Added mounted state
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const [openState, _setOpenState] = React.useState(defaultOpen);
    const [openMobileState, setOpenMobileState] = React.useState(false);
    const [isMobile, setIsMobile] = React.useState(false);
    const [mounted, setMounted] = React.useState(false); // Added mounted state

    React.useEffect(() => {
      setMounted(true); // Set mounted to true after initial render
      // Client-side: if uncontrolled, sync with cookie after initial mount
      if (openProp === undefined) {
        const cookie = document.cookie
          .split("; ")
          .find((row) => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`));
        if (cookie) {
          const cookieValue = cookie.split("=")[1] === "true";
          if (cookieValue !== openState) {
            _setOpenState(cookieValue);
          }
        }
      }
    }, [openProp, openState]); // Removed defaultOpen dependency to avoid loop with cookie read

    const isOpen = openProp ?? openState;

    const setOpen = React.useCallback(
      (value: boolean | ((current: boolean) => boolean)) => {
        const newOpenState = typeof value === "function" ? value(isOpen) : value;
        if (setOpenProp) {
          setOpenProp(newOpenState);
        } else {
          _setOpenState(newOpenState);
          if (typeof document !== "undefined") {
            document.cookie = `${SIDEBAR_COOKIE_NAME}=${newOpenState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
          }
        }
      },
      [setOpenProp, isOpen]
    );
    
    const setOpenMobile = React.useCallback((value: boolean) => {
      setOpenMobileState(value);
    }, []);

    React.useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      if (mounted) { // Only add listener after mount
        handleResize(); 
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
      }
    }, [mounted]);

    const toggleSidebar = React.useCallback(() => {
      if (isMobile) {
        setOpenMobile((v) => !v);
      } else {
        setOpen((v) => !v);
      }
    }, [isMobile, setOpen, setOpenMobile]);

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
      () => ({ state: currentUiState, open: isOpen, setOpen, isMobile, toggleSidebar, openMobile: openMobileState, setOpenMobile, mounted }),
      [currentUiState, isOpen, setOpen, isMobile, toggleSidebar, openMobileState, setOpenMobile, mounted]
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
            {...props}
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
  "fixed inset-y-0 z-40 flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-lg transition-[width,transform] duration-300 ease-in-out print:hidden",
  {
    variants: {
      variant: {
        default:
          "group-data-[state=collapsed]/sidebar:w-[var(--sidebar-width-icon)] group-data-[state=expanded]/sidebar:w-[var(--sidebar-width)]",
        icon: "group-data-[state=collapsed]/sidebar:w-[var(--sidebar-width-icon)] group-data-[state=expanded]/sidebar:w-[var(--sidebar-width-icon)]",
        wide: "group-data-[state=collapsed]/sidebar:w-[var(--sidebar-width-icon)] group-data-[state=expanded]/sidebar:w-[var(--sidebar-width-mobile)]",
        // Offcanvas variant removed from here as it's handled by Sheet logic
      },
      collapsible: {
        true: "",
        false: "",
      },
      side: {
        left: "left-0",
        right: "right-0 border-l border-r-0",
      },
    },
    defaultVariants: {
      variant: "default",
      collapsible: true,
      side: "left",
    },
  }
);

type SidebarRootProps = React.ComponentProps<"aside"> &
  VariantProps<typeof sidebarVariants>;

const Sidebar = React.forwardRef<HTMLDivElement, SidebarRootProps>(
  ({ className, variant, collapsible, side, ...props }, ref) => {
    const { state, isMobile, openMobile, setOpenMobile, mounted } = useSidebar();
    
    if (!mounted) {
      // SSR and initial client render: always render the desktop <aside> structure.
      // 'state' from context is based on 'defaultOpen' and assumes isMobile=false for this phase.
      // 'variant' should be the one passed or default, not decided by a premature 'isMobile'.
      const ssrClientVariant = variant ?? "default"; 
      return (
        <aside
          ref={ref}
          className={cn(
            "group/sidebar",
            sidebarVariants({ variant: ssrClientVariant, collapsible, side, className })
          )}
          data-state={state} // This 'state' is ('expanded'/'collapsed') based on 'defaultOpen'
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
              className // Allow overriding className
            )}
          >
            {/* Children (SidebarHeader, SidebarContent, etc.) are passed here */}
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
          sidebarVariants({ variant: desktopVariant, collapsible, side, className })
        )}
        data-state={state} // Current context state
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

const SidebarInset = React.forwardRef<HTMLDivElement, SidebarInsetProps>(
  ({ className, asChild, side = "left", ...props }, ref) => {
    const { state: currentUiState, isMobile, mounted } = useSidebar();
    const Comp = asChild ? Slot : "div";

    if (!mounted || isMobile) { // If not mounted or if mobile, don't apply dynamic padding
      return <Comp ref={ref} className={cn("flex-1", className)} {...props} />;
    }

    // Apply dynamic padding only on desktop after mount
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
  if (!mounted) { // Render a placeholder or basic input for SSR/initial client if needed
    return <Input ref={ref} className={cn("sr-only", className)} {...props} />; // Example: hide initially
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
  if (!mounted || isMobile) return null; // Only show toggle on desktop after mount

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
  SidebarProvider,
  useSidebar,
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
  SidebarInset,
};

