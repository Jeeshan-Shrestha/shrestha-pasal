export function money(value) {
  return `Rs ${Number(value ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function dateTime(iso) {
  return iso
    ? new Date(iso).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";
}

export function titleCase(text = "") {
  return text.charAt(0) + text.slice(1).toLowerCase();
}
