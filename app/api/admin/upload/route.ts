import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/app/lib/auth";
import { checkRateLimit } from "@/app/lib/rate-limit";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const rateLimitError = checkRateLimit(req, { limit: 20, windowMs: 60 * 1000, keyPrefix: "admin_upload_post" });
  if (rateLimitError) return rateLimitError;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo de imagen" }, { status: 400 });
    }

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato no permitido. Solo se aceptan JPEG, PNG, WebP o AVIF." },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "El archivo supera el límite de 5 MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const ext = path.extname(file.name) || ".jpg";
    const safeExt = ext.replace(/[^a-zA-Z0-9.]/g, "").slice(0, 5);
    const filename = `hypercar_${Date.now()}_${crypto.randomUUID().slice(0, 8)}${safeExt}`;
    const filePath = path.join(uploadsDir, filename);

    await writeFile(filePath, buffer);

    return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("[Admin Upload Error]:", err);
    return NextResponse.json(
      { error: err.message || "Error al procesar la subida del archivo." },
      { status: 500 }
    );
  }
}
