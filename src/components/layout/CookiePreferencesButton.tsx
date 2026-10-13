"use client";

export default function CookiePreferencesButton() {
  return (
    <button
      type="button"
      onClick={() => {
        window.sessionStorage.setItem("zipek-cookie-preferences-open", "true");
        window.dispatchEvent(new Event("zipek-cookie-preferences"));
      }}
      className="text-gray-500 transition-colors hover:text-white"
    >
      Preferencias de analítica
    </button>
  );
}
