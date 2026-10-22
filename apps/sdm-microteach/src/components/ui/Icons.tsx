type IconSvgProps = {
  size?: number;
  width?: number;
  height?: number;
  className?: string;
};

export function MicIcon({ size = 24, width, height, ...props }: IconSvgProps) {
  return (
    <svg
      fill="none"
      height={size || height}
      viewBox="0 0 24 24"
      width={size || width}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z"
        fill="currentColor"
      />
      <path
        d="M6 11a1 1 0 1 0-2 0 8 8 0 0 0 7 7.93V21H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.07A8 8 0 0 0 20 11a1 1 0 1 0-2 0 6 6 0 0 1-12 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function MicOffIcon({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) {
  return (
    <svg
      fill="none"
      height={size || height}
      viewBox="0 0 24 24"
      width={size || width}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M15 11a3 3 0 0 1-3 3c-.4 0-.8-.1-1.1-.2l4.3-4.3c.1.3.2.7.2 1.1 0 .2-.1.4-.4.4ZM9 11V6.8L6.2 4a1 1 0 0 0-1.4 1.4l14 14a1 1 0 0 0 1.4-1.4l-2.1-2.1A8 8 0 0 0 20 11a1 1 0 1 0-2 0 6 6 0 0 1-1.1 3.5L15.5 13A4 4 0 0 0 16 11V9.4L9.6 3A3 3 0 0 1 15 6v5h-1.2L9 6.2V11a3 3 0 0 0 4.6 2.5l-1.5-1.5A1 1 0 0 1 11 11H9Zm2 7.9V21h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-2.1A8 8 0 0 1 4.1 12a1 1 0 1 1 2 0 6 6 0 0 0 4.9 5.9Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function LoadingIcon({
  size = 24,
  width,
  height,
  className,
  ...props
}: IconSvgProps) {
  return (
    <svg
      className={`animate-spin ${className || ""}`}
      fill="none"
      height={size || height}
      viewBox="0 0 24 24"
      width={size || width}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="3"
      />
    </svg>
  );
}

export function FullscreenIcon({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) {
  return (
    <svg
      fill="none"
      height={size || height}
      viewBox="0 0 24 24"
      width={size || width}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
