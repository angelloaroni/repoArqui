export default function Badge({ children, variant }) {
  const value = variant || String(children).toLowerCase().replaceAll(" ", "-");
  return <span className={`badge badge--${value.toLowerCase()}`}>{children}</span>;
}

