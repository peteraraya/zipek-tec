"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      className="no-print rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-light"
      onClick={() => window.print()}
    >
      Imprimir o guardar PDF
    </button>
  );
}
