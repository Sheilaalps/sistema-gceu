-- CreateEnum
CREATE TYPE "membros_status" AS ENUM ('ativo', 'ausente', 'visitante');

-- CreateEnum
CREATE TYPE "usuarios_nivel" AS ENUM ('admin', 'lider', 'anfitriao');

-- CreateTable
CREATE TABLE "membros" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "telefone" VARCHAR(20),
    "endereco" VARCHAR(255),
    "data_nascimento" DATE,
    "anfitriao_id" INTEGER,
    "status" "membros_status" DEFAULT 'ativo',
    "ultima_presenca" DATE,
    "data_cadastro" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "membros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "senha" VARCHAR(255) NOT NULL,
    "nivel" "usuarios_nivel" NOT NULL DEFAULT 'lider',

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "membros_anfitriao_id_idx" ON "membros"("anfitriao_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- AddForeignKey
ALTER TABLE "membros" ADD CONSTRAINT "membros_anfitriao_id_fkey" FOREIGN KEY ("anfitriao_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
