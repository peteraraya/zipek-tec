"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Row = Record<string, unknown>;
type FilterOption = { value: string; label: string };
type FilterConfig = {
  key: string;
  label: string;
  options: FilterOption[];
  includeAllOption?: boolean;
};
type ColumnConfig = {
  key: string;
  label: string;
  hrefBase?: string;
  labels?: Record<string, string>;
  date?: boolean;
};
type SearchPage = {
  data: Row[];
  page: { limit: number; nextCursor: string | null; hasMore: boolean };
};

const EMPTY_PARAMS: Record<string, string> = {};
const controlClass =
  "min-h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

function formatValue(value: unknown, column: ColumnConfig) {
  if (value === null || value === undefined || value === "") return "—";
  if (column.labels) return column.labels[String(value)] ?? String(value);
  if (column.date && typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : new Intl.DateTimeFormat("es-CL", { dateStyle: "medium" }).format(date);
  }
  return String(value);
}

export default function AdminSearchTable({
  module,
  initialData,
  initialPage,
  initialFilters,
  preservedParams = EMPTY_PARAMS,
  filters,
  columns,
  searchPlaceholder,
  emptyMessage,
}: {
  module: "clients" | "orders" | "documents" | "inquiries";
  initialData: Row[];
  initialPage: SearchPage["page"];
  initialFilters: Record<string, string>;
  preservedParams?: Record<string, string>;
  filters: FilterConfig[];
  columns: ColumnConfig[];
  searchPlaceholder: string;
  emptyMessage: string;
}) {
  const [rows, setRows] = useState(initialData);
  const [page, setPage] = useState(initialPage);
  const [values, setValues] = useState<Record<string, string>>(initialFilters);
  const [cursor, setCursor] = useState(initialFilters.cursor ?? "");
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [queryTooShort, setQueryTooShort] = useState(false);
  const [runImmediately, setRunImmediately] = useState(0);
  const immediateRef = useRef(false);
  const skipInitialRequestRef = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);

  const activeChips = useMemo(() => filters
    .filter((filter) => values[filter.key])
    .map((filter) => ({
      ...filter,
      valueLabel: filter.options.find((option) => option.value === values[filter.key])?.label ?? values[filter.key],
    })), [filters, values]);

  const buildSearchParams = useCallback((nextValues: Record<string, string>, nextCursor: string) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(nextValues)) {
      if (key !== "limit" && key !== "cursor" && value) params.set(key, value);
    }
    params.set("limit", "25");
    if (nextCursor) params.set("cursor", nextCursor);
    return params;
  }, []);

  const loadPage = useCallback(async (
    nextValues: Record<string, string>,
    nextCursor: string,
    historyMode: "push" | "replace" = "push",
  ) => {
    const query = nextValues.q?.trim() ?? "";
    controllerRef.current?.abort();
    if (query.length === 1) {
      setQueryTooShort(true);
      setError("");
      setLoading(false);
      return;
    }
    setQueryTooShort(false);

    const controller = new AbortController();
    controllerRef.current = controller;
    const params = buildSearchParams(nextValues, nextCursor);
    const queryString = params.toString();
    const browserParams = new URLSearchParams(queryString);
    for (const [key, value] of Object.entries(preservedParams)) {
      if (value) browserParams.set(key, value);
    }
    const nextUrl = `${window.location.pathname}?${browserParams.toString()}`;
    if (window.location.href !== nextUrl) {
      window.history[historyMode === "push" ? "pushState" : "replaceState"]({}, "", nextUrl);
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/lists/${module}?${queryString}`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      const result = await response.json() as SearchPage & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "No se pudo completar la búsqueda.");
      setRows(result.data);
      setPage(result.page);
    } catch (cause) {
      if (cause instanceof Error && cause.name === "AbortError") return;
      setError(cause instanceof Error ? cause.message : "No se pudo completar la búsqueda.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [buildSearchParams, module, preservedParams]);

  useEffect(() => {
    if (skipInitialRequestRef.current) {
      skipInitialRequestRef.current = false;
      return;
    }
    const immediate = immediateRef.current;
    immediateRef.current = false;
    const timeout = window.setTimeout(() => {
      void loadPage(values, cursor);
    }, immediate ? 0 : 300);
    return () => window.clearTimeout(timeout);
  }, [values, cursor, runImmediately, loadPage]);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const nextValues: Record<string, string> = { q: params.get("q") ?? "" };
      for (const filter of filters) nextValues[filter.key] = params.get(filter.key) ?? "";
      nextValues.from = params.get("from") ?? "";
      nextValues.to = params.get("to") ?? "";
      setCursor(params.get("cursor") ?? "");
      setCursorHistory([]);
      setValues(nextValues);
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      controllerRef.current?.abort();
    };
  }, [filters]);

  function changeValue(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setCursor("");
    setCursorHistory([]);
  }

  function clearFilters() {
    setValues({
      q: "",
      from: "",
      to: "",
      ...(module === "clients" ? { archived: "active" } : {}),
    });
    setCursor("");
    setCursorHistory([]);
  }

  function goNext() {
    if (!page.nextCursor) return;
    setCursorHistory((history) => [...history, cursor]);
    setCursor(page.nextCursor);
  }

  function goPrevious() {
    const previous = cursorHistory[cursorHistory.length - 1];
    if (previous === undefined) {
      setCursor("");
    } else {
      setCursorHistory((history) => history.slice(0, -1));
      setCursor(previous);
    }
  }

  const hasPrevious = cursorHistory.length > 0 || Boolean(cursor);

  return (
    <div className="mt-8">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(240px,1.5fr)_repeat(2,minmax(150px,0.7fr))]">
          <label className="block text-xs font-medium text-gray-400">
            Buscar
            <input
              value={values.q ?? ""}
              onChange={(event) => changeValue("q", event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  immediateRef.current = true;
                  setRunImmediately((count) => count + 1);
                }
              }}
              placeholder={searchPlaceholder}
              maxLength={120}
              className={`${controlClass} mt-1.5`}
              aria-describedby={queryTooShort ? `${module}-query-hint` : undefined}
            />
            {queryTooShort && (
              <span id={`${module}-query-hint`} className="mt-1 block text-xs text-amber-200">
                Escribe al menos 2 caracteres para buscar.
              </span>
            )}
          </label>
          {filters.map((filter) => (
            <label key={filter.key} className="block text-xs font-medium text-gray-400">
              {filter.label}
              <select
                value={values[filter.key] ?? ""}
                onChange={(event) => changeValue(filter.key, event.target.value)}
                className={`${controlClass} mt-1.5`}
              >
                {filter.includeAllOption !== false && <option value="" className="text-black">Todos</option>}
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value} className="text-black">{option.label}</option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="block text-xs font-medium text-gray-400">
            Desde
            <input
              type="date"
              value={values.from ?? ""}
              onChange={(event) => changeValue("from", event.target.value)}
              className={`${controlClass} mt-1.5 [color-scheme:dark]`}
            />
          </label>
          <label className="block text-xs font-medium text-gray-400">
            Hasta
            <input
              type="date"
              value={values.to ?? ""}
              onChange={(event) => changeValue("to", event.target.value)}
              className={`${controlClass} mt-1.5 [color-scheme:dark]`}
            />
          </label>
          <button
            type="button"
            onClick={clearFilters}
            className="min-h-11 rounded-lg border border-white/10 px-4 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white"
          >
            Limpiar filtros
          </button>
        </div>
        {(activeChips.length > 0 || values.q || values.from || values.to) && (
          <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Filtros aplicados">
            {values.q && (
              <button type="button" onClick={() => changeValue("q", "")} className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary-light">
                Búsqueda: {values.q} <span aria-hidden="true">×</span>
              </button>
            )}
            {activeChips.map((chip) => (
              <button key={chip.key} type="button" onClick={() => changeValue(chip.key, "")} className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary-light">
                {chip.label}: {chip.valueLabel} <span aria-hidden="true">×</span>
              </button>
            ))}
            {(values.from || values.to) && (
              <button
                type="button"
                onClick={() => {
                  changeValue("from", "");
                  changeValue("to", "");
                }}
                className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary-light"
              >
                Fechas: {values.from || "—"} a {values.to || "—"} <span aria-hidden="true">×</span>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex min-h-6 items-center justify-between gap-3 text-sm text-gray-400" aria-live="polite">
        <span>{loading ? "Buscando..." : `${rows.length} resultados en esta página`}</span>
        <span>{loading ? "Actualizando resultados" : ""}</span>
      </div>
      {error && (
        <div role="alert" className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">
          <span>{error}</span>
          <button type="button" onClick={() => void loadPage(values, cursor, "replace")} className="font-semibold underline">
            Reintentar
          </button>
        </div>
      )}

      <div className={`mt-3 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] transition-opacity ${loading ? "opacity-60" : ""}`}>
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              {columns.map((column) => <th key={column.key} className="px-5 py-4 font-medium">{column.label}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row, index) => (
              <tr key={String(row.id ?? index)} className="text-gray-300">
                {columns.map((column) => {
                  const content = formatValue(row[column.key], column);
                  return (
                    <td key={column.key} className="px-5 py-4">
                      {column.hrefBase && typeof row.id === "string" ? (
                        <Link href={`${column.hrefBase}/${row.id}`} className="font-semibold text-white hover:text-primary-light hover:underline">
                          {content}
                        </Link>
                      ) : content}
                    </td>
                  );
                })}
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr><td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400">{emptyMessage}</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-gray-500">Se cargan hasta 25 registros por página.</p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!hasPrevious || loading}
            onClick={goPrevious}
            className="min-h-10 rounded-lg border border-white/10 px-4 text-sm text-gray-300 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>
          <button
            type="button"
            disabled={!page.hasMore || loading}
            onClick={goNext}
            className="min-h-10 rounded-lg border border-white/10 px-4 text-sm text-gray-300 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
