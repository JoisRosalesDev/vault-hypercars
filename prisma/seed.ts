import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const hypercars = [
  {
    name: "Bugatti Tourbillon",
    brand: "Bugatti",
    year: 2026,
    price: 4100000,
    hp: 1800,
    topSpeed: "445 km/h",
    acceleration: "0-100 km/h en 2.0s",
    engine: "Motor V16 8.3L Atmosférico + 3 Motores Eléctricos",
    status: "Disponible",
    stock: 2,
    image: "",
    description: "Motor V16 atmosférico de 8.3 litros combinado con 3 motores eléctricos e ingeniería analógica de relojería suiza."
  },
  {
    name: "Bugatti Chiron Pur Sport",
    brand: "Bugatti",
    year: 2025,
    price: 3800000,
    hp: 1500,
    topSpeed: "350 km/h",
    acceleration: "0-100 km/h en 2.3s",
    engine: "W16 8.0L Cuadriturbo",
    status: "Disponible",
    stock: 3,
    image: "",
    description: "Configuración ágil optimizada para aceleración y paso por curva con alerón trasero fijo de 1.9 metros."
  },
  {
    name: "Bugatti Divo",
    brand: "Bugatti",
    year: 2024,
    price: 5800000,
    hp: 1500,
    topSpeed: "380 km/h",
    acceleration: "0-100 km/h en 2.4s",
    engine: "W16 8.0L Cuadriturbo",
    status: "Unidad Final",
    stock: 1,
    image: "",
    description: "Edición limitada a 40 unidades enfocado en la máxima carga aerodinámica y aceleración lateral."
  },
  {
    name: "Lamborghini Revuelto",
    brand: "Lamborghini",
    year: 2026,
    price: 600000,
    hp: 1015,
    topSpeed: "350 km/h",
    acceleration: "0-100 km/h en 2.5s",
    engine: "V12 6.5L + 3 Motores Eléctricos (HPEV)",
    status: "Disponible",
    stock: 2,
    image: "",
    description: "El primer súper deportivo híbrido V12 HPEV de Sant'Agata Bolognese con tracción integral vectorial."
  },
  {
    name: "Lamborghini Sian FKP 37",
    brand: "Lamborghini",
    year: 2025,
    price: 3700000,
    hp: 819,
    topSpeed: "355 km/h",
    acceleration: "0-100 km/h en 2.8s",
    engine: "V12 6.5L + Supercondensador 48V",
    status: "Unidad Final",
    stock: 1,
    image: "",
    description: "Primer súper deportivo con tecnología híbrida impulsada por supercondensadores de alta densidad de energía."
  },
  {
    name: "Lamborghini Veneno",
    brand: "Lamborghini",
    year: 2024,
    price: 4500000,
    hp: 750,
    topSpeed: "355 km/h",
    acceleration: "0-100 km/h en 2.9s",
    engine: "V12 6.5L Atmosférico",
    status: "Unidad Final",
    stock: 1,
    image: "",
    description: "Prototipo de carreras homologado para calle creado para celebrar el 50 aniversario de Lamborghini."
  },
  {
    name: "Ferrari SF90 XX Stradale",
    brand: "Ferrari",
    year: 2026,
    price: 890000,
    hp: 1030,
    topSpeed: "320 km/h",
    acceleration: "0-100 km/h en 2.3s",
    engine: "V8 4.0L Biturbo + 3 Motores Eléctricos",
    status: "Disponible",
    stock: 2,
    image: "",
    description: "Primera versión XX homologada para carretera. Aerodinámica de carrera de resistencia con alerón fijo posterior."
  },
  {
    name: "Ferrari Daytona SP3",
    brand: "Ferrari",
    year: 2026,
    price: 2250000,
    hp: 840,
    topSpeed: "340 km/h",
    acceleration: "0-100 km/h en 2.85s",
    engine: "V12 6.5L Atmosférico (F140HC)",
    status: "Disponible",
    stock: 2,
    image: "",
    description: "Motor V12 de aspiración natural a 9,500 RPM. Diseño aerodinámico escultural sin componentes activos."
  },
  {
    name: "Ferrari LaFerrari",
    brand: "Ferrari",
    year: 2024,
    price: 3500000,
    hp: 963,
    topSpeed: "350 km/h",
    acceleration: "0-100 km/h en 2.6s",
    engine: "V12 6.3L + Sistema HY-KERS",
    status: "Unidad Final",
    stock: 1,
    image: "",
    description: "El mítico hiperauto de Maranello que introdujo la tecnología híbrida de Fórmula 1 a los vehículos de producción."
  }
];

async function main() {
  console.log("Seeding hypercar catalog database...");
  
  // Clear existing items to ensure a clean state
  await prisma.hypercar.deleteMany();

  for (const car of hypercars) {
    await prisma.hypercar.create({
      data: car
    });
  }

  console.log(`Successfully seeded ${hypercars.length} hypercars.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
