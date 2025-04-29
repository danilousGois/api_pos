-- CreateTable
CREATE TABLE "Mensagem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "conteudo" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Mensagem_conteudo_key" ON "Mensagem"("conteudo");
