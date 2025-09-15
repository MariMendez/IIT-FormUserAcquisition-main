import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const formato = searchParams.get("formato") || "json"
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

    // Obtener estadísticas generales
    const [totalProspectos, totalCitas, prospectosPorInteres, citasPorInteres, registrosPorAsesor] = await Promise.all([
      prisma.prospecto.count({ where: whereClause }),
      prisma.cita.count({ where: whereClause }),
      prisma.prospecto.groupBy({
        by: ["nivelInteres"],
        where: whereClause,
        _count: { id: true },
      }),
      prisma.cita.groupBy({
        by: ["nivelInteres"],
        where: whereClause,
        _count: { id: true },
      }),
      prisma.prospecto.groupBy({
        by: ["asesorId"],
        where: whereClause,
        _count: { id: true },
        _avg: { id: true },
      }),
    ])

    const estadisticas = {
      resumen: {
        totalProspectos,
        totalCitas,
        totalRegistros: totalProspectos + totalCitas,
      },
      porNivelInteres: {
        prospectos: prospectosPorInteres,
        citas: citasPorInteres,
      },
      porAsesor: registrosPorAsesor,
    }

    if (formato === "csv") {
      // Generar CSV para exportación
      const registros = await prisma.prospecto.findMany({
        where: whereClause,
        include: {
          asesor: { select: { nombre: true } },
          usuario: { select: { nombre: true } },
        },
      })

      const csvHeaders = [
        "Fecha",
        "Hora",
        "Nombre",
        "Celular",
        "Como nos conoce",
        "Tipo",
        "Nivel de Interés",
        "Asesor",
        "Notas",
      ].join(",")

      const csvRows = registros.map((r) =>
        [
          r.fechaRegistro.toLocaleDateString("es-CO"),
          r.horaRegistro,
          r.nombre,
          r.celular,
          r.comoNosConoce,
          r.tipoRegistro,
          r.nivelInteres,
          r.asesor.nombre,
          r.notas || "",
        ].join(","),
      )

      const csvContent = [csvHeaders, ...csvRows].join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="reporte-registros.csv"',
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: estadisticas,
    })
  } catch (error) {
    console.error("Error al generar reporte:", error)
    return NextResponse.json({ error: "Error al generar el reporte" }, { status: 500 })
  }
}
