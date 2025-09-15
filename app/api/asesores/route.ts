import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const asesores = await prisma.asesor.findMany({
      where: {
        activo: true,
      },
      select: {
        id: true,
        nombre: true,
        turno: true,
      },
      orderBy: {
        nombre: "asc",
      },
    })

    return NextResponse.json({
      success: true,
      data: asesores,
    })
  } catch (error) {
    console.error("Error al obtener asesores:", error)
    return NextResponse.json({ error: "Error al obtener la lista de asesores" }, { status: 500 })
  }
}
