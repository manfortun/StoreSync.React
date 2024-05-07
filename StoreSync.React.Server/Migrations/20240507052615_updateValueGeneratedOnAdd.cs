using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StoreSync.React.Server.Migrations
{
    /// <inheritdoc />
    public partial class updateValueGeneratedOnAdd : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DebtsPayment_Debtors_DebtorName",
                table: "DebtsPayment");

            migrationBuilder.DropForeignKey(
                name: "FK_DebtsPayment_Debts_DebtId",
                table: "DebtsPayment");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DebtsPayment",
                table: "DebtsPayment");

            migrationBuilder.RenameTable(
                name: "DebtsPayment",
                newName: "DebtPayments");

            migrationBuilder.RenameIndex(
                name: "IX_DebtsPayment_DebtorName",
                table: "DebtPayments",
                newName: "IX_DebtPayments_DebtorName");

            migrationBuilder.RenameIndex(
                name: "IX_DebtsPayment_DebtId",
                table: "DebtPayments",
                newName: "IX_DebtPayments_DebtId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_DebtPayments",
                table: "DebtPayments",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_DebtPayments_Debtors_DebtorName",
                table: "DebtPayments",
                column: "DebtorName",
                principalTable: "Debtors",
                principalColumn: "Name",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DebtPayments_Debts_DebtId",
                table: "DebtPayments",
                column: "DebtId",
                principalTable: "Debts",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DebtPayments_Debtors_DebtorName",
                table: "DebtPayments");

            migrationBuilder.DropForeignKey(
                name: "FK_DebtPayments_Debts_DebtId",
                table: "DebtPayments");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DebtPayments",
                table: "DebtPayments");

            migrationBuilder.RenameTable(
                name: "DebtPayments",
                newName: "DebtsPayment");

            migrationBuilder.RenameIndex(
                name: "IX_DebtPayments_DebtorName",
                table: "DebtsPayment",
                newName: "IX_DebtsPayment_DebtorName");

            migrationBuilder.RenameIndex(
                name: "IX_DebtPayments_DebtId",
                table: "DebtsPayment",
                newName: "IX_DebtsPayment_DebtId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_DebtsPayment",
                table: "DebtsPayment",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_DebtsPayment_Debtors_DebtorName",
                table: "DebtsPayment",
                column: "DebtorName",
                principalTable: "Debtors",
                principalColumn: "Name",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DebtsPayment_Debts_DebtId",
                table: "DebtsPayment",
                column: "DebtId",
                principalTable: "Debts",
                principalColumn: "Id");
        }
    }
}
