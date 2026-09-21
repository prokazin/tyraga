interface IconProps {
  className?: string;
  size?: number;
}

export function IconPerson({ className, size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
    </svg>
  );
}

export function IconHammer({ className, size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
      <path d="M15 12l-8.373 8.373a1 1 0 1 1-3-3L12 9" />
      <path d="M17.64 15L22 10.64" />
      <path d="M20.91 11.7l-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91" />
    </svg>
  );
}

export function IconUsers({ className, size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function IconStrength({ className, size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
      <path d="M14.4 14.4L9.6 9.6" />
      <path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z" />
      <path d="M21.5 21.5l-1.4-1.4" />
      <path d="M3.9 3.9l1.4 1.4" />
      <path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z" />
    </svg>
  );
}

export function IconEye({ className, size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconMask({ className, size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
      <path d="M2 12c0-4 2-8 5-8 2 0 3 1 5 1s3-1 5-1c3 0 5 4 5 8s-4 8-10 8S2 16 2 12Z" />
      <path d="M7 12h.01" />
      <path d="M17 12h.01" />
      <path d="M9 16c1 1 2 1.5 3 1.5s2-.5 3-1.5" />
    </svg>
  );
}

export function IconWrench({ className, size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z" />
    </svg>
  );
}

export function IconCards({ className, size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
      <rect x="3" y="5" width="12" height="16" rx="2" transform="rotate(-8 9 13)" />
      <rect x="9" y="3" width="12" height="16" rx="2" transform="rotate(8 15 11)" />
    </svg>
  );
}

export function IconStar({ className, size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"
      className={className} width={size} height={size}>
      <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7L2 9.5l7.1-.6L12 2Z" />
    </svg>
  );
}

export function IconShield({ className, size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function IconClock({ className, size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

export function IconPlay({ className, size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"
      className={className} width={size} height={size}>
      <path d="M8 5v14l11-7L8 5Z" />
    </svg>
  );
}

export function IconPlus({ className, size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

export function IconExit({ className, size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export function IconSend({ className, size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4L22 2Z" />
    </svg>
  );
}

export function IconLock({ className, size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
      <rect x="4" y="10" width="16" height="12" rx="2" />
      <path d="M8 10V6a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

export function IconLogo({ className, size = 44 }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} width={size} height={size}>
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e6be3c" />
          <stop offset="100%" stopColor="#a05a2c" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" stroke="url(#lg)" strokeWidth="2" fill="#0d0d0d" />
      <circle cx="32" cy="32" r="24" stroke="#6b5514" strokeWidth="0.5" fill="none" opacity="0.6" />
      <path
        d="M32 10 L32 54 M10 32 L54 32 M16 16 L48 48 M48 16 L16 48"
        stroke="#6b5514" strokeWidth="0.5" opacity="0.35"
      />
      <path
        d="M22 26 L22 38 Q22 42 26 42 L38 42 Q42 42 42 38 L42 26 Z"
        stroke="url(#lg)" strokeWidth="2" fill="none" strokeLinejoin="round"
      />
      <path d="M28 26 L28 42 M36 26 L36 42" stroke="url(#lg)" strokeWidth="1.2" opacity="0.5" />
      <path d="M22 32 L42 32" stroke="url(#lg)" strokeWidth="1.2" opacity="0.5" />
    </svg>
  );
}
