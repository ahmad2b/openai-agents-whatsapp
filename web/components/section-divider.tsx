export function SectionDivider({ reverse = false }: { reverse?: boolean }) {
  return (
    <svg
      className={["section-divider", reverse && "section-divider-reverse"]
        .filter(Boolean)
        .join(" ")}
      viewBox="0 0 1440 88"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M0 0H1440V28C1080 108 460 108 0 28Z" fill="currentColor" />
    </svg>
  )
}
