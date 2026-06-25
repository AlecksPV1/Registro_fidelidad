import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    if (phone) {
      const user = await prisma.user.findUnique({
        where: { telefono: phone }
      });
      if (user) {
        return NextResponse.json({ success: true, user });
      } else {
        return NextResponse.json({ success: false, message: "Usuario no encontrado" }, { status: 404 });
      }
    }

    const users = await prisma.user.findMany({
      orderBy: { fecha_registro: 'desc' }
    });
    
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error in /api/users:", error);
    return NextResponse.json({ message: "Error al obtener usuarios." }, { status: 500 });
  }
}
