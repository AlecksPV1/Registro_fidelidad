import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const FINAL_GOAL = 10;
const PROXIMITY_GOAL = 8;

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ message: "ID de usuario requerido." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
    }

    // Increment visits
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { contador_visitas: user.contador_visitas + 1 }
    });

    const currentVisits = updatedUser.contador_visitas;

    console.log(`\n\n[SISTEMA DE FIDELIDAD] Escaneo para ${user.nombre_cliente}. Visita #${currentVisits}\n\n`);

    // ==========================================
    // Real WhatsApp Integration Logic (Dynamic)
    // ==========================================
    const rule = await prisma.messageRule.findUnique({
      where: { visitNumber: currentVisits }
    });

    let waMessage = "";
    if (rule) {
      waMessage = rule.messageTemplate.replace(/{nombre}/g, user.nombre_cliente);

      if (rule.isReset) {
        // Reset visits back to 0 after reaching the goal
        await prisma.user.update({
          where: { id: userId },
          data: { contador_visitas: 0 }
        });
        console.log(`[SISTEMA] Contador reiniciado a 0 para ${user.nombre_cliente}.`);
      }
    }

    if (waMessage) {
      try {
        await fetch('http://localhost:3001/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: user.telefono, message: waMessage })
        });
        console.log(`[WhatsApp] Mensaje enviado a ${user.telefono}`);
      } catch (waError) {
        console.error(`[WhatsApp] Error enviando mensaje a ${user.telefono}:`, waError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      user: { 
        id: updatedUser.id, 
        nombre: updatedUser.nombre_cliente,
        visitas: currentVisits >= FINAL_GOAL ? FINAL_GOAL : currentVisits
      },
      goalReached: currentVisits >= FINAL_GOAL
    });

  } catch (error) {
    console.error("Error in /api/scan:", error);
    return NextResponse.json({ message: "Error interno del servidor." }, { status: 500 });
  }
}
