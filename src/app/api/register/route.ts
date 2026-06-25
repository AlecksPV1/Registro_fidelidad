import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import QRCode from "qrcode";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { nombre, telefono } = await request.json();

    if (!nombre || !telefono) {
      return NextResponse.json({ message: "Nombre y teléfono son requeridos." }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { telefono }
    });

    if (existingUser) {
      return NextResponse.json({ message: "Este teléfono ya está registrado." }, { status: 400 });
    }

    // Create user in DB
    const user = await prisma.user.create({
      data: {
        nombre_cliente: nombre,
        telefono: telefono,
        qr_code_url: "", // Will update right after
      }
    });

    // Generate QR code (encode the user ID or a URL to the scanner with the ID)
    const qrData = JSON.stringify({ userId: user.id });
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      color: {
        dark: '#0f172a',  // Dark blue
        light: '#ffffff' // White background
      },
      width: 300,
      margin: 2
    });

    // Update user with QR code URL (in a real app you might upload this to S3, but here we just store the Data URL or leave it empty if generated on the fly)
    // Actually, storing data URL in SQLite is fine for a small app, but let's just return it and store a placeholder or not store it.
    // For this prototype, storing the DataURL is okay.
    await prisma.user.update({
      where: { id: user.id },
      data: { qr_code_url: qrCodeDataUrl }
    });

    // ==========================================
    // Real WhatsApp API Call
    // ==========================================
    const welcomeMessage = `¡Hola ${nombre}! Gracias por unirte a nuestro programa de fidelidad. Presenta este código QR en tu próxima visita para ganar recompensas.`;
    try {
      await fetch('http://localhost:3001/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: telefono,
          message: welcomeMessage,
          mediaBase64: qrCodeDataUrl
        })
      });
      console.log(`[WhatsApp] Mensaje de bienvenida y QR enviado a ${telefono}`);
    } catch (waError) {
      console.error(`[WhatsApp] Error al intentar enviar mensaje a ${telefono}:`, waError);
    }

    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, nombre: user.nombre_cliente },
      qrCodeDataUrl 
    }, { status: 201 });

  } catch (error) {
    console.error("Error in /api/register:", error);
    return NextResponse.json({ message: "Error interno del servidor." }, { status: 500 });
  }
}
