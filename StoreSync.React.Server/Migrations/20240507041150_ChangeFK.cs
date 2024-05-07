using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StoreSync.React.Server.Migrations
{
    /// <inheritdoc />
    public partial class ChangeFK : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Debt_Debtor_DebtorName",
                table: "Debt");

            migrationBuilder.DropForeignKey(
                name: "FK_DebtPayment_Debt_DebtId",
                table: "DebtPayment");

            migrationBuilder.DropForeignKey(
                name: "FK_Sales_Debt_DebtId",
                table: "Sales");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DebtPayment",
                table: "DebtPayment");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Debtor",
                table: "Debtor");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Debt",
                table: "Debt");

            migrationBuilder.RenameTable(
                name: "DebtPayment",
                newName: "DebtsPayment");

            migrationBuilder.RenameTable(
                name: "Debtor",
                newName: "Debtors");

            migrationBuilder.RenameTable(
                name: "Debt",
                newName: "Debts");

            migrationBuilder.RenameIndex(
                name: "IX_DebtPayment_DebtId",
                table: "DebtsPayment",
                newName: "IX_DebtsPayment_DebtId");

            migrationBuilder.RenameIndex(
                name: "IX_Debt_DebtorName",
                table: "Debts",
                newName: "IX_Debts_DebtorName");

            migrationBuilder.AlterColumn<string>(
                name: "DebtId",
                table: "DebtsPayment",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AddColumn<string>(
                name: "DebtorName",
                table: "DebtsPayment",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "DateCreated",
                table: "Debts",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddPrimaryKey(
                name: "PK_DebtsPayment",
                table: "DebtsPayment",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Debtors",
                table: "Debtors",
                column: "Name");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Debts",
                table: "Debts",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_DebtsPayment_DebtorName",
                table: "DebtsPayment",
                column: "DebtorName");

            migrationBuilder.AddForeignKey(
                name: "FK_Debts_Debtors_DebtorName",
                table: "Debts",
                column: "DebtorName",
                principalTable: "Debtors",
                principalColumn: "Name",
                onDelete: ReferentialAction.Cascade);

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

            migrationBuilder.AddForeignKey(
                name: "FK_Sales_Debts_DebtId",
                table: "Sales",
                column: "DebtId",
                principalTable: "Debts",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Debts_Debtors_DebtorName",
                table: "Debts");

            migrationBuilder.DropForeignKey(
                name: "FK_DebtsPayment_Debtors_DebtorName",
                table: "DebtsPayment");

            migrationBuilder.DropForeignKey(
                name: "FK_DebtsPayment_Debts_DebtId",
                table: "DebtsPayment");

            migrationBuilder.DropForeignKey(
                name: "FK_Sales_Debts_DebtId",
                table: "Sales");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DebtsPayment",
                table: "DebtsPayment");

            migrationBuilder.DropIndex(
                name: "IX_DebtsPayment_DebtorName",
                table: "DebtsPayment");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Debts",
                table: "Debts");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Debtors",
                table: "Debtors");

            migrationBuilder.DropColumn(
                name: "DebtorName",
                table: "DebtsPayment");

            migrationBuilder.DropColumn(
                name: "DateCreated",
                table: "Debts");

            migrationBuilder.RenameTable(
                name: "DebtsPayment",
                newName: "DebtPayment");

            migrationBuilder.RenameTable(
                name: "Debts",
                newName: "Debt");

            migrationBuilder.RenameTable(
                name: "Debtors",
                newName: "Debtor");

            migrationBuilder.RenameIndex(
                name: "IX_DebtsPayment_DebtId",
                table: "DebtPayment",
                newName: "IX_DebtPayment_DebtId");

            migrationBuilder.RenameIndex(
                name: "IX_Debts_DebtorName",
                table: "Debt",
                newName: "IX_Debt_DebtorName");

            migrationBuilder.AlterColumn<string>(
                name: "DebtId",
                table: "DebtPayment",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_DebtPayment",
                table: "DebtPayment",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Debt",
                table: "Debt",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Debtor",
                table: "Debtor",
                column: "Name");

            migrationBuilder.AddForeignKey(
                name: "FK_Debt_Debtor_DebtorName",
                table: "Debt",
                column: "DebtorName",
                principalTable: "Debtor",
                principalColumn: "Name",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DebtPayment_Debt_DebtId",
                table: "DebtPayment",
                column: "DebtId",
                principalTable: "Debt",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Sales_Debt_DebtId",
                table: "Sales",
                column: "DebtId",
                principalTable: "Debt",
                principalColumn: "Id");
        }
    }
}
