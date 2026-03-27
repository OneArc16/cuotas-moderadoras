"use client";

import { useState } from "react";

import { AdmisionConfigCard } from "@/features/admisiones/components/admision-config-card";
import {
  PacienteLookupCard,
  type PacienteReadyPayload,
} from "@/features/admisiones/components/paciente-lookup-card";

type ContratoOption = {
  id: number;
  nombre: string;
  tipo: string;
  categorias: Array<{
    id: number;
    codigo: string;
    nombre: string;
  }>;
  categoriaIds: number[];
  servicioIds: number[];
};

type ServicioOption = {
  id: number;
  codigo: string | null;
  nombre: string;
};

type AdmisionesFlowProps = {
  canStartAdmision: boolean;
  contratos: ContratoOption[];
  servicios: ServicioOption[];
};

export function AdmisionesFlow({
  canStartAdmision,
  contratos,
  servicios,
}: AdmisionesFlowProps) {
  const [openStep, setOpenStep] = useState<1 | 2>(1);
  const [selectedPatient, setSelectedPatient] =
    useState<PacienteReadyPayload | null>(null);
  const [flowResetKey, setFlowResetKey] = useState(0);

  function handlePatientReady(patient: PacienteReadyPayload) {
    const isSamePatient = selectedPatient?.id === patient.id;

    setSelectedPatient(patient);

    if (!isSamePatient) {
      setOpenStep(2);
    }
  }

  function handleResetPatientFlow() {
    setSelectedPatient(null);
    setOpenStep(1);
    setFlowResetKey((prev) => prev + 1);
  }

  function handleAdmisionRegistered() {
    setSelectedPatient(null);
    setOpenStep(1);
    setFlowResetKey((prev) => prev + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <PacienteLookupCard
        key={`paciente-step-${flowResetKey}`}
        canStartAdmision={canStartAdmision}
        isOpen={openStep === 1}
        onOpenChange={(nextOpen) => {
          if (nextOpen) setOpenStep(1);
        }}
        onPatientReady={handlePatientReady}
        onFlowReset={handleResetPatientFlow}
      />

      <AdmisionConfigCard
        key={`config-step-${flowResetKey}`}
        canStartAdmision={canStartAdmision && Boolean(selectedPatient)}
        selectedPatient={selectedPatient}
        contratos={contratos}
        servicios={servicios}
        isOpen={openStep === 2}
        onOpenChange={(nextOpen) => {
          if (!selectedPatient) return;
          if (nextOpen) setOpenStep(2);
        }}
        onAdmisionRegistered={handleAdmisionRegistered}
      />
    </div>
  );
}