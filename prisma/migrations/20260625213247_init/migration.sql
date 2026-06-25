-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre_cliente" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "qr_code_url" TEXT NOT NULL,
    "contador_visitas" INTEGER NOT NULL DEFAULT 0,
    "fecha_registro" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_telefono_key" ON "User"("telefono");
