export function DefaultAvatar({ name, className }: { name: string; className: string }) {
  return (
    <span className={`${className} candidate-avatar-missing`} role="img" aria-label={`Default profile image for ${name}`}>
      <svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="24" r="11" /><path d="M11 62v-9a21 21 0 0 1 42 0v9Z" /></svg>
    </span>
  );
}
