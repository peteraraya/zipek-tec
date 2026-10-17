import {
  AdminSearchUnauthorizedError,
  AdminSearchValidationError,
  searchAdminList,
  type AdminListModule,
} from "@/lib/admin/search";

export const dynamic = "force-dynamic";

const modules = new Set<AdminListModule>(["clients", "orders", "documents", "inquiries"]);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ module: string }> },
) {
  const { module } = await params;
  if (!modules.has(module as AdminListModule)) {
    return Response.json({ error: "El módulo solicitado no existe." }, { status: 404 });
  }

  try {
    const result = await searchAdminList(module as AdminListModule, new URL(request.url).searchParams);
    return Response.json(result, {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "Vary": "Cookie",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof AdminSearchUnauthorizedError) {
      return Response.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof AdminSearchValidationError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error(`Error en búsqueda administrativa (${module})`, error);
    return Response.json({ error: "No se pudo completar la búsqueda. Inténtalo nuevamente." }, { status: 500 });
  }
}
