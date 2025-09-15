import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { registroSchema } from "@/lib/validations"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar los datos de entrada
    const validatedData = registroSchema.parse(body)

    // Generar hora actual en formato HH:MM
    const now = new Date()
    const horaRegistro = now.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })

    // Verificar que el asesor existe y está activo
    const asesor = await prisma.asesor.findFirst({
      where: {
        id: validatedData.asesorId,
        activo: true,
      },
    })

    if (!asesor) {
      return NextResponse.json({ error: "Asesor no encontrado o inactivo" }, { status: 400 })
    }

    // Verificar que el usuario existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: validatedData.creadoPor },
    })

    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 400 })
    }

    let registro

    // Guardar según el tipo de registro
    if (validatedData.tipoRegistro === "Cita") {
      registro = await prisma.cita.create({
        data: {
          ...validatedData,
          horaRegistro,
        },
        include: {
          asesor: true,
          usuario: true,
        },
      })
    } else {
      registro = await prisma.prospecto.create({
        data: {
          ...validatedData,
          horaRegistro,
        },
        include: {
          asesor: true,
          usuario: true,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: registro,
      message: "Registro creado exitosamente",
    })
  } catch (error) {
    console.error("Error al crear registro:", error)

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Datos de entrada inválidos", details: error }, { status: 400 })
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
