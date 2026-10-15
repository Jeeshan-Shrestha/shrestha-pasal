import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { ORDER_STATUS_STYLE } from "../lib/constants";
import { titleCase } from "../lib/format";

/* ---------- Button (same pill look as the original theme) ---------- */

const VARIANTS = {
  default: "bg-purple-600 text-white hover:bg-purple-700",
  outline: "border border-gray-300 text-gray-900 hover:bg-gray-100",
  ghost: "text-gray-900 hover:bg-purple-100 hover:text-purple-700",
  danger: "text-red-600 hover:bg-red-50",
  link: "text-purple-600 underline-offset-4 hover:underline",
};
const SIZES = {
  default: "h-9 px-4",
  sm: "h-8 px-3",
  lg: "h-10 px-5",
  icon: "size-9",
};

export function Button({
  children,
  to,
  variant = "default",
  size = "default",
  type = "button",
  className = "",
  ...props
}) {
  const classes = `inline-flex cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-medium transition-all focus:outline-none disabled:pointer-events-none disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}

/* ---------- form field ---------- */

export const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-purple-400 focus:outline-none";

export function Field({ label, error, children, className = "" }) {
  return (
    <label className={`block space-y-1 ${className}`}>
      <span className="block text-sm font-semibold text-gray-900">{label}</span>
      {children}
      {error && <span className="block text-sm text-red-600">{error}</span>}
    </label>
  );
}

/* ---------- feedback ---------- */

export function Spinner({ className = "h-5 w-5" }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-purple-200 border-t-purple-600 ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex justify-center py-24">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

export function ErrorBox({ error, onRetry }) {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-sm text-red-700">
        {error?.message || "Something went wrong."}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function Empty({ title, text, action }) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h2 className="mb-2 text-xl font-semibold text-gray-900">{title}</h2>
      {text && <p className="mb-6 text-gray-600">{text}</p>}
      {action}
    </div>
  );
}

/* ---------- small pieces ---------- */

export function Badge({
  children,
  className = "bg-purple-100 text-purple-700",
}) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-md px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  return (
    <Badge className={ORDER_STATUS_STYLE[status]}>{titleCase(status)}</Badge>
  );
}

export function Stars({ value = 0, count }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <FaStar
          key={n}
          className={`h-4 w-4 ${n <= Math.round(value) ? "text-yellow-400" : "text-gray-300"}`}
        />
      ))}
      {count !== undefined && (
        <span className="ml-1 text-sm text-gray-600">({count})</span>
      )}
    </div>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white p-4 sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function PageTitle({ children }) {
  return (
    <h1 className="mb-6 text-xl font-semibold text-gray-900 sm:text-2xl md:text-3xl">
      {children}
    </h1>
  );
}

/* ---------- pagination for the backend's PageResponse ---------- */

export function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;
  return (
    <div className="mt-8 flex items-center justify-center gap-3">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 0}
        onClick={() => onChange(page - 1)}
      >
        Previous
      </Button>
      <span className="text-sm text-gray-600">
        Page {page + 1} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
      >
        Next
      </Button>
    </div>
  );
}

/* ---------- modal ---------- */

export function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="my-8 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-2xl leading-none text-gray-500 hover:text-gray-900"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
