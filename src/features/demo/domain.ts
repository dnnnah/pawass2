export type DemoHealthEntry = {
  date: string;
  title: string;
  note: string;
  simulated: true;
};

export type DemoDocument = DemoHealthEntry & {
  kind: 'Identificación' | 'Laboratorio' | 'Alta' | 'Receta';
};

export type DemoPet = {
  slug: string;
  name: string;
  code: string;
  species: 'perro' | 'gato';
  breed: string;
  sex: 'Hembra' | 'Macho';
  age: string;
  color: string;
  size: 'Pequeña' | 'Mediana' | 'Grande';
  photo: string;
  photoAlt: string;
  family: string;
  temperament: string;
  care: string[];
  health: {
    vaccinations: DemoHealthEntry[];
    dewormings: DemoHealthEntry[];
    interventions: DemoHealthEntry[];
    documents: DemoDocument[];
  };
  lostReport?: {
    lastSeenAt: string;
    lastSeenLocation: string;
    appearance: string;
    message: string;
    reward: string;
    careAlerts: { label: string; instructions: string }[];
    contactLabel: string;
  };
};

const healthEntry = (date: string, title: string, note: string): DemoHealthEntry => ({ date, title, note, simulated: true });

export const demoPets: DemoPet[] = [
  {
    slug: 'bimba', name: 'Bimba', code: 'DEMO-BIMBA', species: 'perro', breed: 'Mestiza, tipo schnauzer', sex: 'Hembra', age: '6 años', color: 'Gris sal y pimienta', size: 'Mediana', photo: '/demo/pet-demo-01.webp', photoAlt: 'Perra gris de pelo rizado con un pañuelo de colores', family: 'Familia demo 01', temperament: 'Curiosa y tranquila cuando conoce a las personas.', care: ['Paseo corto por la mañana y uno más largo al atardecer.', 'Cepillado frecuente y agua fresca disponible.'],
    health: {
      vaccinations: [healthEntry('2026-02-14', 'Refuerzo polivalente · demo', 'Registro de muestra; fecha y producto ficticios.')],
      dewormings: [healthEntry('2026-03-02', 'Desparasitación interna · demo', 'Registro ilustrativo, sin producto ni dosis reales.')],
      interventions: [healthEntry('2024-06-18', 'Esterilización · ejemplo', 'Procedimiento ficticio para mostrar el historial.')],
      documents: [{ ...healthEntry('2026-02-14', 'Cartilla de ejemplo', 'Tarjeta simulada; no es un documento clínico.'), kind: 'Identificación' }],
    },
  },
  {
    slug: 'tacho', name: 'Tacho', code: 'DEMO-TACHO', species: 'perro', breed: 'Mestizo, tipo terrier', sex: 'Macho', age: '4 años', color: 'Blanco con manchas negras', size: 'Pequeña', photo: '/demo/pet-demo-02.webp', photoAlt: 'Perro pequeño blanco con manchas negras y un paliacate azul', family: 'Familia demo 02', temperament: 'Amigable; puede inquietarse con ruidos fuertes.', care: ['Acercarse con movimientos lentos y voz suave.', 'No ofrecer comida nueva sin consultar a su familia.'],
    health: {
      vaccinations: [healthEntry('2026-01-21', 'Refuerzo polivalente · demo', 'Entrada ficticia de ejemplo; no acredita vacunación.')],
      dewormings: [healthEntry('2026-04-05', 'Desparasitación interna · demo', 'Registro de muestra; no indica tratamiento real.')],
      interventions: [healthEntry('2023-09-10', 'Limpieza dental · ejemplo', 'Intervención ficticia sin valor como antecedente médico.')],
      documents: [{ ...healthEntry('2026-01-21', 'Resumen de carnet · demo', 'Documento simulado; no abrir ni usar para atención.'), kind: 'Identificación' }],
    },
    lostReport: {
      lastSeenAt: '2026-10-18T17:30:00-06:00', lastSeenLocation: 'Parque de Muestra PawPass, colonia inventada, Ciudad Demo', appearance: 'Collar azul con una placa que dice DEMO. No tiene microchip real asociado.',
      message: 'Este reporte es una demostración ficticia. Tacho está a salvo dentro de este ejemplo; no requiere ayuda ni una búsqueda real.', reward: 'Sin recompensa; dato ilustrativo únicamente.',
      careAlerts: [{ label: 'Sensibilidad a ruidos', instructions: 'Dato de cuidado inventado para mostrar cómo se vería una alerta autorizada.' }], contactLabel: 'Contacto del equipo demo PawPass · canal deshabilitado',
    },
  },
  {
    slug: 'menta', name: 'Menta', code: 'DEMO-MENTA', species: 'gato', breed: 'Doméstica de pelo corto, carey', sex: 'Hembra', age: '2 años', color: 'Carey oscuro', size: 'Pequeña', photo: '/demo/pet-demo-03.webp', photoAlt: 'Gatita carey de pelo oscuro descansando en una manta', family: 'Familia demo 03', temperament: 'Juguetona y observadora; prefiere los lugares cálidos.', care: ['Cepillado semanal.', 'Mantener su agua separada del alimento.'],
    health: {
      vaccinations: [healthEntry('2026-05-09', 'Vacuna felina · demo', 'Entrada inventada; no confirma una dosis real.')],
      dewormings: [healthEntry('2026-05-18', 'Desparasitación · demo', 'Registro ilustrativo sin producto ni dosis.')],
      interventions: [healthEntry('2025-03-12', 'Esterilización · ejemplo', 'Procedimiento inventado para mostrar esta sección.')],
      documents: [{ ...healthEntry('2026-05-09', 'Ficha de cuidados · demo', 'Resumen de muestra, no es un expediente.'), kind: 'Identificación' }],
    },
  },
  {
    slug: 'cosmo', name: 'Cosmo', code: 'DEMO-COSMO', species: 'gato', breed: 'Doméstico de pelo largo', sex: 'Macho', age: '7 años', color: 'Atigrado café y gris', size: 'Mediana', photo: '/demo/pet-demo-04.webp', photoAlt: 'Gato atigrado de pelo largo sentado al aire libre', family: 'Familia demo 04', temperament: 'Independiente, paciente y cariñoso en espacios tranquilos.', care: ['Cepillado varias veces por semana.', 'Revisar que tenga un sitio fresco para descansar.'],
    health: {
      vaccinations: [healthEntry('2026-03-27', 'Refuerzo felino · demo', 'Registro simulado sin validez sanitaria.')],
      dewormings: [healthEntry('2026-04-02', 'Desparasitación · demo', 'Dato inventado, no utilizar como indicación.')],
      interventions: [healthEntry('2025-08-11', 'Revisión dental · ejemplo', 'Nota de muestra; no representa una revisión real.')],
      documents: [{ ...healthEntry('2026-03-27', 'Resultado de laboratorio · simulado', 'Documento ilustrativo sin resultados clínicos.'), kind: 'Laboratorio' }],
    },
  },
  {
    slug: 'nori', name: 'Nori', code: 'DEMO-NORI', species: 'gato', breed: 'Doméstico de pelo corto, bicolor', sex: 'Macho', age: '3 años', color: 'Blanco con manchas grises', size: 'Mediana', photo: '/demo/pet-demo-05.webp', photoAlt: 'Gato bicolor blanco y gris entre plantas de jardín', family: 'Familia demo 05', temperament: 'Sociable y curioso; disfruta mirar por la ventana.', care: ['Juego diario en interior.', 'Arenero limpio en un lugar tranquilo.'],
    health: {
      vaccinations: [healthEntry('2026-06-06', 'Vacuna felina · demo', 'Entrada ficticia que no acredita vacunación.')],
      dewormings: [healthEntry('2026-06-15', 'Desparasitación · demo', 'Dato de ejemplo; no especifica un fármaco real.')],
      interventions: [healthEntry('2025-01-24', 'Esterilización · ejemplo', 'Intervención ficticia, sin valor clínico.')],
      documents: [{ ...healthEntry('2025-01-24', 'Nota de alta · simulada', 'Documento de muestra, no válido para atención.'), kind: 'Alta' }],
    },
  },
];

export function findDemoPetByCode(code: string): DemoPet | undefined {
  return demoPets.find((pet) => pet.code === code);
}

export function findDemoPetBySlug(slug: string): DemoPet | undefined {
  return demoPets.find((pet) => pet.slug === slug);
}

export function getDemoQrPath(code: string): string | null {
  const pet = findDemoPetByCode(code);
  return pet ? `/demo/codigo/${encodeURIComponent(pet.code)}` : null;
}
