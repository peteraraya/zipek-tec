import type { Instrumentation } from "next";

export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String(error.digest)
      : undefined;

  console.error(JSON.stringify({
    event: "next_request_error",
    error_type: error instanceof Error ? error.name : "UnknownError",
    digest,
    method: request.method,
    route: context.routePath,
    route_type: context.routeType,
  }));
};
