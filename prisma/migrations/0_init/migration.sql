/*
  Warnings:

  - You are about to alter the column `costoAguaCruda` on the `Configuracion` table. The type of these columns will change from `String` to `Float`. If this contains data, the migration will fail.
  - You are about to alter the column `limiteConsumoBasico` on the `Configuracion` table. The type of these columns will change from `String` to `Float`. If this contains data, the migration will fail.
  - You are about to alter the column `costoTarifaBase` on the `Configuracion` table. The type of these columns will change from `String` to `Float`. If this contains data, the migration will fail.
  - You are about to alter the column `costoM3Excedente` on the `Configuracion` table. The type of these columns will change from `String` to `Float`. If this contains data, the migration will fail.

*/
-- CreateTable
CREATE TABLE "Configuracion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombreJunta" TEXT NOT NULL UNIQUE,
    "costoAguaCruda" REAL NOT NULL,
    "limiteConsumoBasico" REAL NOT NULL,
    "costoTarifaBase" REAL NOT NULL,
    "costoM3Excedente" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL UNIQUE,
    "email" TEXT UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'DIGITADOR',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
