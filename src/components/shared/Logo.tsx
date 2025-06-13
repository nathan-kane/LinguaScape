import Link from 'next/link';
import { APP_LOGO_ICON, APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
  showText?: boolean;
}

export function Logo({ className, iconSize = 28, textSize = "text-2xl", showText = true }: LogoProps) {
  const IconComponent = APP_LOGO_ICON;
  return (
    <Link href="/" className={cn("flex items-center gap-2 group", className)} aria-label={`${APP_NAME} homepage`}>
      <IconComponent size={iconSize} className="text-primary group-hover:text-accent transition-colors" />
      {showText && <span className={cn("font-headline font-bold", textSize, "group-hover:text-accent transition-colors")}>{APP_NAME}</span>}
    </Link>
  );
}
