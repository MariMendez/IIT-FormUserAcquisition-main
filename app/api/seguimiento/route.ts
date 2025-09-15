import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const nivelInteres = searchParams.get("nivelInteres")
    const fechaDesde = searchParams.get("fechaDesde")
    const fechaHasta = searchParams.get("fechaHasta")

    const whereClause: any = {}

    if (nivelInteres) {
      whereClause.nivelInteres = nivelInteres
    }

    if (fechaDesde || fechaHasta) {
      whereClause.fechaRegistro = {}
      if (fechaDesde) {
        whereClause.fechaRegistro.gte = new Date(fechaDesde)
      }
      if (fechaHasta) {
        whereClause.fechaRegistro.lte = new Date(fechaHasta)
      }
    }

    // Obtener prospectos
    const prospectos = await prisma.prospecto.findMany({
      where: whereClause,
      include: {
        asesor: {
          select: {
            nombre: true,
            turno: true,
          },
        },
        usuario: {
          select: {
            nombre: true,
          },
        },
      },
      orderBy: {
        fechaRegistro: "desc",
      },
    })

    // Obtener citas
    const citas = await prisma.cita.findMany({
      where: whereClause,
      include: {
        asesor: {
          select: {
            nombre: true,
            turno: true,
          },
        },
        usuario: {
          select: {
            nombre: true,
          },
        },
      },
      orderBy: {
        fechaRegistro: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        prospectos,
        citas,
        total: prospectos.length + citas.length,
      },
    })
  } catch (error) {
    console.error("Error al obtener registros de seguimiento:", error)
    return NextResponse.json({ error: "Error al obtener los registros de seguimiento" }, { status: 500 })
  }
}
