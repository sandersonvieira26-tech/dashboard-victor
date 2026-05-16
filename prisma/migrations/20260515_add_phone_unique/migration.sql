-- AlterTable: add unique constraint on Client.phone
CREATE UNIQUE INDEX "Client_phone_key" ON "Client"("phone");
