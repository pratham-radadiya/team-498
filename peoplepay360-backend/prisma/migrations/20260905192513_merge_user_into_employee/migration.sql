-- Merge User into Employee: Employee becomes the login account directly,
-- there is no separate User model anymore.

-- Add the new required columns with a temporary default so this applies
-- cleanly against existing rows. The immediately-following reseed replaces
-- every row's values anyway.
ALTER TABLE "Employee" ADD COLUMN "passwordHash" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Employee" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'EMPLOYEE';

-- Drop the temporary defaults now that every existing row is backfilled —
-- from here on, every insert must supply these explicitly (enforced by Zod
-- at the API boundary), matching every other required column on this model.
ALTER TABLE "Employee" ALTER COLUMN "passwordHash" DROP DEFAULT;
ALTER TABLE "Employee" ALTER COLUMN "role" DROP DEFAULT;

-- Drop the User table entirely (also drops its FK to Employee and its
-- unique index on employeeId, since they belong to this table).
DROP TABLE "User";

-- Drop the now-unused UserStatus enum (Employee reuses EmployeeStatus).
DROP TYPE "UserStatus";
