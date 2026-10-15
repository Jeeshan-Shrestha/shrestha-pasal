import { FiMinus, FiPlus } from "react-icons/fi";

export default function QuantityStepper({ value, max, onChange, disabled }) {
  const btn =
    "flex size-8 cursor-pointer items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40";
  return (
    <div className="inline-flex items-center gap-3">
      <button
        type="button"
        className={btn}
        disabled={disabled || value <= 1}
        onClick={() => onChange(value - 1)}
        aria-label="Decrease quantity"
      >
        <FiMinus />
      </button>
      <span className="w-6 text-center font-medium">{value}</span>
      <button
        type="button"
        className={btn}
        disabled={disabled || value >= Math.min(max ?? 100, 100)}
        onClick={() => onChange(value + 1)}
        aria-label="Increase quantity"
      >
        <FiPlus />
      </button>
    </div>
  );
}
