import { z } from "zod"

// Validación para el número de celular (formato internacional)
const phoneRegex = /^\+?[1-9]\d{1,14}$/

export const registroSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "El nombre es demasiado largo"),
  celular: z.string().regex(phoneRegex, "Formato de celular inválido. Use formato internacional (+57XXXXXXXXXX)"),
  comoNosConoce: z.enum(["Redes Sociales", "Recomendación", "Me queda de paso", "Publicidad impresa", "Otro"]),
  asesorId: z.string().min(1, "Debe seleccionar un asesor"),
  tipoRegistro: z.enum(["Cita", "Solicita informes"]),
  nivelInteres: z.enum(["Bajo", "Medio", "Alto"]),
  notas: z.string().optional(),
  creadoPor: z.string().min(1, "Usuario requerido"),
})

export type RegistroData = z.infer<typeof registroSchema>
