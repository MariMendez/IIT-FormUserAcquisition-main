"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface Asesor {
  id: string
  nombre: string
  turno: string
}

export default function RegistroForm() {
  const [asesores, setAsesores] = useState<Asesor[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    celular: "",
    comoNosConoce: "",
    asesorId: "",
    canalPreferido: "",//Adicional
    emailContacto: "", // Adicional
    solicitoInfo: "", //Adicional
    satisfaccionInfo: "", //Adicional
    actitudCliente: "", 
    tipoRegistro: "",
    nivelInteres: "",
    notas: "",
    creadoPor: "user-default", // En producción, obtener del contexto de autenticación
  })

  // Obtener fecha y hora actual para mostrar
  const [fechaActual, setFechaActual] = useState("")
  const [horaActual, setHoraActual] = useState("")

  useEffect(() => {
    // Actualizar fecha y hora cada segundo
    const updateDateTime = () => {
      const now = new Date()
      setFechaActual(now.toLocaleDateString("es-CO"))
      setHoraActual(
        now.toLocaleTimeString("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      )
    }

    updateDateTime()
    const interval = setInterval(updateDateTime, 1000)

    // Cargar asesores
    fetchAsesores()

    return () => clearInterval(interval)
  }, [])

  const fetchAsesores = async () => {
    try {
      const response = await fetch("/api/asesores")
      const result = await response.json()

      if (result.success) {
        setAsesores(result.data)
      } else {
        setError("Error al cargar la lista de asesores")
      }
    } catch (err) {
      setError("Error de conexión al cargar asesores")
    }
  }

  const validateForm = () => {
    const required = ["nombre", "celular", "comoNosConoce", "asesorId", "tipoRegistro", "nivelInteres"]

    for (const field of required) {
      if (!formData[field as keyof typeof formData]) {
        setError(`El campo ${field} es obligatorio`)
        return false
      }
    }

    // Validar formato de celular
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    if (!phoneRegex.test(formData.celular)) {
      setError("El formato del celular no es válido. Use formato internacional (+57XXXXXXXXXX)")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/recepcion/registro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        // Limpiar formulario
        setFormData({
          nombre: "",
          celular: "",
          comoNosConoce: "",
          asesorId: "",
          canalPreferido: "",
          solicitoInfo: "",
          satisfaccionInfo: "",
          emailContacto: "",
          actitudCliente: "",
          tipoRegistro: "",
          nivelInteres: "",
          notas: "",
          creadoPor: "user-default",
        })

        // Ocultar mensaje de éxito después de 5 segundos
        setTimeout(() => setSuccess(false), 5000)
      } else {
        setError(result.error || "Error al registrar")
      }
    } catch (err) {
      setError("Error de conexión. Intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Limpiar error al empezar a escribir
    if (error) setError(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-center">Registro de Usuarios - Recepción</CardTitle>
            <CardDescription className="text-blue-100 text-center">
              Sistema de seguimiento y evaluación del interés del cliente
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            {/* Información de fecha y hora */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-100 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-gray-600">Fecha de registro</Label>
                <p className="text-lg font-semibold">{fechaActual}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Hora de registro</Label>
                <p className="text-lg font-semibold">{horaActual}</p>
              </div>
            </div>

            {/* Alertas */}
            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">¡Registro creado exitosamente!</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombre completo */}
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-sm font-medium">
                  Nombre completo *
                </Label>
                <Input
                  id="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  placeholder="Ingrese el nombre completo del cliente"
                  className="text-lg p-3"
                  required
                />
              </div>

              {/* Número de celular */}
              <div className="space-y-2">
                <Label htmlFor="celular" className="text-sm font-medium">
                  Número de celular *
                </Label>
                <Input
                id="celular"
                type="tel"
                value={formData.celular}
                onChange={(e) => {
                  const soloNumeros = e.target.value.replace(/[^0-9+]/g, "");
                  handleInputChange("celular", soloNumeros);
                }}
                placeholder="+57XXXXXXXXXX"
                className="text-lg p-3" 
                inputMode="numeric"// sugiere teclado numérico en móviles
                 maxLength={11}   // <-- asegura máximo 11
                required
              />

                <p className="text-xs text-gray-500">Formato internacional requerido (ej: +573001234567)</p>
              </div>

              {/* Preferencia de contacto */}
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">¿Cómo prefiere que lo contactemos? *</Label>
                <RadioGroup
                  value={formData.canalPreferido}
                  onValueChange={(value) => handleInputChange("canalPreferido", value)}
                  className="grid grid-cols-1 gap-3"
                >
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="WhatsApp" id="canal-whatsapp" />
                    <Label htmlFor="canal-whatsapp" className="cursor-pointer flex-1">WhatsApp</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="Llamada telefónica" id="canal-llamada" />
                    <Label htmlFor="canal-llamada" className="cursor-pointer flex-1">Llamada telefónica</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="Correo electrónico" id="canal-email" />
                    <Label htmlFor="canal-email" className="cursor-pointer flex-1">Correo electrónico</Label>
                  </div>
                </RadioGroup>

                {/* Campo condicional de correo */}
                {formData.canalPreferido === "Correo electrónico" && (
                  <div className="mt-3 space-y-1 pl-2">
                    <Label htmlFor="emailContacto" className="text-sm font-medium">Correo electrónico *</Label>
                    <Input
                      id="emailContacto"
                      type="email"
                      value={formData.emailContacto}
                      onChange={(e) => handleInputChange("emailContacto", e.target.value)}
                      placeholder="nombre@dominio.com"
                      className="text-lg p-3"
                      required
                    />
                    <p className="text-xs text-gray-500">Usaremos este correo para enviarle la información solicitada.</p>
                  </div>
                )}
              </div>



              {/* ¿Cómo nos conoce? */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">¿Cómo nos conoce? *</Label>
                <Select
                  value={formData.comoNosConoce}
                  onValueChange={(value) => handleInputChange("comoNosConoce", value)}
                  required
                > 
                  <SelectTrigger className="text-lg p-3">
                    <SelectValue placeholder="Seleccione una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Redes Sociales">Redes Sociales</SelectItem>
                    <SelectItem value="Recomendación">Recomendación</SelectItem>
                    <SelectItem value="Me queda de paso">Me queda de paso</SelectItem>
                    <SelectItem value="Publicidad impresa">Publicidad impresa</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Asesor asignado */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Asesor asignado *</Label>
                <Select
                  value={formData.asesorId}
                  onValueChange={(value) => handleInputChange("asesorId", value)}
                  required
                >
                  <SelectTrigger className="text-lg p-3">
                    <SelectValue placeholder="Seleccione un asesor" />
                  </SelectTrigger>
                  <SelectContent>
                    {asesores.map((asesor) => (
                      <SelectItem key={asesor.id} value={asesor.id}>
                        {asesor.nombre} - {asesor.turno}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/*Pregunta adicional*/ }
              <div className="space-y-2">
                <Label className="text-sm font-medium">Actitud del cliente: *</Label>
                <Select
                  value={formData.actitudCliente}
                  onValueChange={(value) => handleInputChange("actitudCliente", value)}
                  required
                >
                  <SelectTrigger className="text-lg p-3">
                    <SelectValue placeholder="Seleccione un opción" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Muy interesado">Muy interesado</SelectItem>
                    <SelectItem value="Neutral">Neutral</SelectItem>
                    <SelectItem value="Desinteresado">Desinteresado</SelectItem>
                  </SelectContent>

                </Select>
              </div>

              {/* ¿Solicitó información adicional o próxima cita? */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">¿Solicitó información adicional? *</Label>
                  <RadioGroup
                    value={formData.solicitoInfo}
                    onValueChange={(value) => handleInputChange("solicitoInfo", value)}
                    className="flex space-x-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Sí" id="solicito-si" />
                      <Label htmlFor="solicito-si" className="cursor-pointer">Sí</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No" id="solicito-no" />
                      <Label htmlFor="solicito-no" className="cursor-pointer">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* ¿El cliente salió satisfecho con la información? */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">¿El cliente salió satisfecho con la información? *</Label>
                  <Select
                    value={formData.satisfaccionInfo}
                    onValueChange={(value) => handleInputChange("satisfaccionInfo", value)}
                    required
                  >
                    <SelectTrigger className="text-lg p-3">
                      <SelectValue placeholder="Seleccione una opción" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sí">Sí</SelectItem>
                      <SelectItem value="Parcialmente">Parcialmente</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>


              {/* Tipo de registro */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Tipo de registro *</Label>
                <RadioGroup
                  value={formData.tipoRegistro}
                  onValueChange={(value) => handleInputChange("tipoRegistro", value)}
                  className="grid grid-cols-1 gap-3"
                >
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="Cita" id="cita" />
                    <Label htmlFor="cita" className="flex-1 cursor-pointer">
                      <span className="font-medium">Cita</span>
                      <p className="text-sm text-gray-500">Cliente con contacto previo</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="Solicita informes" id="informes" />
                    <Label htmlFor="informes" className="flex-1 cursor-pointer">
                      <span className="font-medium">Solicita informes</span>
                      <p className="text-sm text-gray-500">Nuevo prospecto sin contacto previo</p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              

              {/* Nivel de interés */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Nivel de interés estimado *</Label>
                <RadioGroup
                  value={formData.nivelInteres}
                  onValueChange={(value) => handleInputChange("nivelInteres", value)}
                  className="grid grid-cols-1 gap-3"
                >
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="Bajo" id="bajo" />
                    <Label htmlFor="bajo" className="flex-1 cursor-pointer">
                      <span className="font-medium text-yellow-600">Bajo</span>
                      <p className="text-sm text-gray-500">Curiosidad inicial</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="Medio" id="medio" />
                    <Label htmlFor="medio" className="flex-1 cursor-pointer">
                      <span className="font-medium text-orange-600">Medio</span>
                      <p className="text-sm text-gray-500">Muestra interés pero solicita más información</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="Alto" id="alto" />
                    <Label htmlFor="alto" className="flex-1 cursor-pointer">
                      <span className="font-medium text-green-600">Alto</span>
                      <p className="text-sm text-gray-500">Interesado y con alta probabilidad de cierre</p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Notas adicionales */}
              <div className="space-y-2">
                <Label htmlFor="notas" className="text-sm font-medium">
                  Notas adicionales
                </Label>
                <Textarea
                  id="notas"
                  value={formData.notas}
                  onChange={(e) => handleInputChange("notas", e.target.value)}
                  placeholder="Observaciones relevantes sobre el cliente o la consulta..."
                  className="min-h-[100px] text-base p-3"
                />
              </div>

              {/* Botón de envío */}
              <Button type="submit" disabled={loading} className="w-full text-lg py-3 bg-blue-600 hover:bg-blue-700">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  "Registrar Cliente"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
