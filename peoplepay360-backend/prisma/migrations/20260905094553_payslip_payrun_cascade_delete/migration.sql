-- DropForeignKey
ALTER TABLE "Payslip" DROP CONSTRAINT "Payslip_payrunId_fkey";

-- AddForeignKey
ALTER TABLE "Payslip" ADD CONSTRAINT "Payslip_payrunId_fkey" FOREIGN KEY ("payrunId") REFERENCES "Payrun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
