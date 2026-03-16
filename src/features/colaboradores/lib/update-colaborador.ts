"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const updateColaboradorSchema = z.object({
  id: z.coerce.number().int().positive("Colaborador inválido."),
  tipoDocumento: z.enum(["CC", "CE", "TI", "RC", "PASAPORTE", "NIT", "OTRO"]),
  numeroDocumento: z.string().trim().min(5, "El documento es obligatorio."),
  primerNombre: z.string().trim().min(2, "El primer nombre es obligatorio."),
  segundoNombre: z.string().trim().optional(),
  primerApellido: z.string().trim().min(2, "El primer apellido es obligatorio."),
  segundoApellido: z.string().trim().optional(),
  telefono: z.string().trim().optional(),
  email: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || z.string().email().safeParse(value).success, {
      message: "El correo no es válido.",
    }),
  username: z.string().trim().min(3, "El username es obligatorio."),
  rolId: z.coerce.number().int().positive("Debes seleccionar un rol."),
  estado: z.enum(["ACTIVO", "INACTIVO", "BLOQUEADO"]),
});

export type UpdateColaboradorActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

export async function updateColaborador(
  _prevState: UpdateColaboradorActionState,
  formData: FormData,
): Promise<UpdateColaboradorActionState> {
  const parsed = updateColaboradorSchema.safeParse({
    id: formData.get("id"),
    tipoDocumento: formData.get("tipoDocumento"),
    numeroDocumento: formData.get("numeroDocumento"),
    primerNombre: formData.get("primerNombre"),
    segundoNombre: formData.get("segundoNombre"),
    primerApellido: formData.get("primerApellido"),
    segundoApellido: formData.get("segundoApellido"),
    telefono: formData.get("telefono"),
    email: formData.get("email"),
    username: formData.get("username"),
    rolId: formData.get("rolId"),
    estado: formData.get("estado"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Revisa los campos obligatorios.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  const emailNormalizado = data.email?.trim()
    ? data.email.trim().toLowerCase()
    : null;
  const usernameNormalizado = data.username.trim().toLowerCase();
  const numeroDocumentoNormalizado = data.numeroDocumento.trim().toUpperCase();
  const telefonoNormalizado = data.telefono?.trim()
    ? data.telefono.trim().toUpperCase()
    : null;

  const [
    colaboradorActual,
    documentoExistente,
    usernameExistente,
    emailExistente,
    rolExistente,
  ] = await Promise.all([
    prisma.usuario.findUnique({
      where: { id: data.id },
      select: { id: true },
    }),
    prisma.usuario.findUnique({
      where: { numeroDocumento: numeroDocumentoNormalizado },
      select: { id: true },
    }),
    prisma.usuario.findUnique({
      where: { username: usernameNormalizado },
      select: { id: true },
    }),
    emailNormalizado
      ? prisma.usuario.findUnique({
          where: { email: emailNormalizado },
          select: { id: true },
        })
      : Promise.resolve(null),
    prisma.rol.findUnique({
      where: { id: data.rolId },
      select: { id: true, estado: true },
    }),
  ]);

  if (!colaboradorActual) {
    return {
      success: false,
      message: "El colaborador no existe.",
    };
  }

  if (documentoExistente && documentoExistente.id !== data.id) {
    return {
      success: false,
      message: "Ya existe un colaborador con ese documento.",
      errors: {
        numeroDocumento: ["Ya existe un colaborador con ese documento."],
      },
    };
  }

  if (usernameExistente && usernameExistente.id !== data.id) {
    return {
      success: false,
      message: "Ese username ya está en uso.",
      errors: {
        username: ["Ese username ya está en uso."],
      },
    };
  }

  if (emailExistente && emailExistente.id !== data.id) {
    return {
      success: false,
      message: "Ese correo ya está registrado.",
      errors: {
        email: ["Ese correo ya está registrado."],
      },
    };
  }

  if (!rolExistente || rolExistente.estado !== "ACTIVO") {
    return {
      success: false,
      message: "El rol seleccionado no es válido.",
      errors: {
        rolId: ["Debes seleccionar un rol activo."],
      },
    };
  }

  await prisma.usuario.update({
    where: { id: data.id },
    data: {
      tipoDocumento: data.tipoDocumento,
      numeroDocumento: numeroDocumentoNormalizado,
      primerNombre: data.primerNombre.trim().toUpperCase(),
      segundoNombre: data.segundoNombre?.trim()
        ? data.segundoNombre.trim().toUpperCase()
        : null,
      primerApellido: data.primerApellido.trim().toUpperCase(),
      segundoApellido: data.segundoApellido?.trim()
        ? data.segundoApellido.trim().toUpperCase()
        : null,
      telefono: telefonoNormalizado,
      email: emailNormalizado,
      username: usernameNormalizado,
      estado: data.estado,
      rolId: data.rolId,
    },
  });

  revalidatePath("/colaboradores");
  revalidatePath(`/colaboradores/${data.id}/editar`);

  return {
    success: true,
    message: "Colaborador actualizado correctamente.",
  };
}