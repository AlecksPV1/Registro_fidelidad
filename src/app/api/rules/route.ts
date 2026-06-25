import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rules = await prisma.messageRule.findMany({
      orderBy: { visitNumber: 'asc' }
    });
    return NextResponse.json({ success: true, rules });
  } catch (error) {
    console.error("Error fetching rules:", error);
    return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { id, visitNumber, messageTemplate, isReset } = await request.json();

    if (!visitNumber || !messageTemplate) {
      return NextResponse.json({ success: false, message: "Faltan datos" }, { status: 400 });
    }

    let rule;
    if (id) {
      rule = await prisma.messageRule.update({
        where: { id },
        data: { visitNumber: Number(visitNumber), messageTemplate, isReset: Boolean(isReset) }
      });
    } else {
      rule = await prisma.messageRule.create({
        data: { visitNumber: Number(visitNumber), messageTemplate, isReset: Boolean(isReset) }
      });
    }

    return NextResponse.json({ success: true, rule });
  } catch (error) {
    console.error("Error saving rule:", error);
    return NextResponse.json({ success: false, message: "Error al guardar (¿número de visita duplicado?)" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.messageRule.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error al eliminar" }, { status: 500 });
  }
}
