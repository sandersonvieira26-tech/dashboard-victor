-- Add CHECK constraint to enforce valid status values on Appointment
-- SQLite requires recreating the table to add constraints
PRAGMA foreign_keys=OFF;

CREATE TABLE "Appointment_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled'
        CHECK (status IN ('scheduled', 'attended', 'no-show')),
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Appointment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "Appointment_new" SELECT * FROM "Appointment";
DROP TABLE "Appointment";
ALTER TABLE "Appointment_new" RENAME TO "Appointment";

PRAGMA foreign_keys=ON;
