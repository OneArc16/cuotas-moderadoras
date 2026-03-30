"use server";

import { isAPIError } from "better-auth/api";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { createAuditEntry } from "@/lib/audit";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requirePermission, RBAC_PERMISSION } from "@/lib/rbac";

import {
  buildColaboradorAuditSnapshot,
  getColaboradorDisplayName,
} from "./colaborador-audit";
import { normalizeLoginUsername } from "./normalize-login-username";

const createColaboradorSchema = z.object({
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
    .min(1, "El correo es obligatorio.")
    .email("El correo no es valido."),
  username: z.string().trim().min(3, "El username es obligatorio."),
  rolId: z.coerce.number().int().positive("Debes seleccionar un rol."),
  estado: z.enum(["ACTIVO", "INACTIVO", "BLOQUEADO"]),
  password: z
    .string()
    .min(6, "La contrasena temporal debe tener al menos 6 caracteres."),
});

export type CreateColaboradorActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

export async function createColaborador(
  _prevState: CreateColaboradorActionState,
  formData: FormData,
): Promise<CreateColaboradorActionState> {
  const actor = await requirePermission(
    RBAC_PERMISSION.COLLABORATOR_MANAGE,
    "No tienes permiso para gestionar colaboradores.",
  );

  const parsed = createColaboradorSchema.safeParse({
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
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Revisa los campos obligatorios.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const emailNormalizado = data.email.trim().toLowerCase();
  const usernameVisual = data.username.trim();
  const usernameNormalizado = normalizeLoginUsername(usernameVisual);
  const numeroDocumentoNormalizado = data.numeroDocumento.trim().toUpperCase();
  const telefonoNormalizado = data.telefono?.trim()
    ? data.telefono.trim().toUpperCase()
    : null;
  const primerNombre = data.primerNombre.trim().toUpperCase();
  const segundoNombre = data.segundoNombre?.trim()
    ? data.segundoNombre.trim().toUpperCase()
    : null;
  const primerApellido = data.primerApellido.trim().toUpperCase();
  const segundoApellido = data.segundoApellido?.trim()
    ? data.segundoApellido.trim().toUpperCase()
    : null;
  const nombreCompleto = getColaboradorDisplayName({
    primerNombre,
    segundoNombre,
    primerApellido,
    segundoApellido,
  });

  const [documentoExistente, usernameExistente, emailExistente, rolExistente] =
    await Promise.all([
      prisma.usuario.findUnique({
        where: { numeroDocumento: numeroDocumentoNormalizado },
        select: { id: true },
      }),
      prisma.usuario.findUnique({
        where: { username: usernameNormalizado },
        select: { id: true },
      }),
      prisma.usuario.findUnique({
        where: { email: emailNormalizado },
        select: { id: true },
      }),
      prisma.rol.findUnique({
        where: { id: data.rolId },
        select: { id: true, estado: true, nombre: true },
      }),
    ]);

  if (documentoExistente) {
    return {
      success: false,
      message: "Ya existe un colaborador con ese documento.",
      errors: {
        numeroDocumento: ["Ya existe un colaborador con ese documento."],
      },
    };
  }

  if (usernameExistente) {
    return {
      success: false,
      message: "Ese username ya esta en uso.",
      errors: {
        username: ["Ese username ya esta en uso."],
      },
    };
  }

  if (emailExistente) {
    return {
      success: false,
      message: "Ese correo ya esta registrado.",
      errors: {
        email: ["Ese correo ya esta registrado."],
      },
    };
  }

  if (!rolExistente || rolExistente.estado !== "ACTIVO") {
    return {
      success: false,
      message: "El rol seleccionado no es valido.",
      errors: {
        rolId: ["Debes seleccionar un rol activo."],
      },
    };
  }

  let authUserId: string | null = null;

  try {
    const requestHeaders = await headers();
    const authUserResult = await auth.api.createUser({
      body: {
        email: emailNormalizado,
        password: data.password,
        name: nombreCompleto,
        role: "user",
        data: {
          username: usernameNormalizado,
          displayUsername: usernameVisual,
        },
      },
      headers: requestHeaders,
    });

    authUserId = authUserResult?.user?.id ?? authUserResult?.id ?? null;

    if (!authUserId) {
      throw new Error("Better Auth creo el usuario pero no devolvio un id valido.");
    }

    await prisma.$transaction(async (tx) => {
      const createdColaborador = await tx.usuario.create({
        data: {
          authUserId,
          tipoDocumento: data.tipoDocumento,
          numeroDocumento: numeroDocumentoNormalizado,
          primerNombre,
          segundoNombre,
          primerApellido,
          segundoApellido,
          telefono: telefonoNormalizado,
          email: emailNormalizado,
          username: usernameNormalizado,
          passwordHash: "AUTH_MANAGED",
          estado: data.estado,
          rolId: data.rolId,
        },
        select: {
          id: true,
          authUserId: true,
          tipoDocumento: true,
          numeroDocumento: true,
          primerNombre: true,
          segundoNombre: true,
          primerApellido: true,
          segundoApellido: true,
          telefono: true,
          email: true,
          username: true,
          estado: true,
          rolId: true,
        },
      });

      await createAuditEntry(tx, {
        usuarioId: actor.id,
        accion: "COLABORADORES_CREAR",
        entidad: "Colaborador",
        entidadId: createdColaborador.id,
        detalle: `Se creo el colaborador ${nombreCompleto}.`,
        valorNuevoJson: buildColaboradorAuditSnapshot({
          ...createdColaborador,
          rolNombre: rolExistente.nombre,
        }),
      });
    });

    revalidatePath("/colaboradores");
    revalidatePath("/colaboradores/nuevo");

    return {
      success: true,
      message: "Colaborador creado correctamente.",
    };
  } catch (error) {
    if (authUserId) {
      try {
        await auth.api.removeUser({
          body: {
            userId: authUserId,
          },
          headers: await headers(),
        });
      } catch (cleanupError) {
        console.error("No se pudo revertir el usuario auth:", cleanupError);
      }
    }

    if (isAPIError(error)) {
      const message = error.message.toLowerCase();

      if (message.includes("email")) {
        return {
          success: false,
          message: "Ese correo ya esta registrado en autenticacion.",
          errors: {
            email: ["Ese correo ya esta registrado en autenticacion."],
          },
        };
      }

      if (message.includes("username")) {
        return {
          success: false,
          message: "Ese username ya esta registrado en autenticacion.",
          errors: {
            username: ["Ese username ya esta registrado en autenticacion."],
          },
        };
      }

      return {
        success: false,
        message: error.message || "No se pudo crear el colaborador.",
      };
    }

    console.error("Error al crear colaborador:", error);

    return {
      success: false,
      message: "No se pudo crear el colaborador.",
    };
  }
}