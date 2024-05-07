using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace StoreSync.React.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddDebts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Prices",
                keyColumns: new[] { "DateCreated", "Id" },
                keyValues: new object[] { new DateTime(2024, 5, 3, 11, 35, 55, 381, DateTimeKind.Local).AddTicks(2937), "4800361410816" });

            migrationBuilder.DeleteData(
                table: "Prices",
                keyColumns: new[] { "DateCreated", "Id" },
                keyValues: new object[] { new DateTime(2024, 5, 3, 11, 35, 55, 381, DateTimeKind.Local).AddTicks(2924), "4902430453295" });

            migrationBuilder.DeleteData(
                table: "Prices",
                keyColumns: new[] { "DateCreated", "Id" },
                keyValues: new object[] { new DateTime(2024, 5, 3, 11, 35, 55, 381, DateTimeKind.Local).AddTicks(2936), "7622300637996" });

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: "4800361410816");

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: "4902430453295");

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: "7622300637996");

            migrationBuilder.AddColumn<string>(
                name: "DebtId",
                table: "Sales",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Subtitle",
                table: "Products",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateTable(
                name: "Debtor",
                columns: table => new
                {
                    Name = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Debtor", x => x.Name);
                });

            migrationBuilder.CreateTable(
                name: "Debt",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    DebtorName = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Debt", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Debt_Debtor_DebtorName",
                        column: x => x.DebtorName,
                        principalTable: "Debtor",
                        principalColumn: "Name",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DebtPayment",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    DebtId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Payment = table.Column<double>(type: "float", nullable: false),
                    DateCreated = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DebtPayment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DebtPayment_Debt_DebtId",
                        column: x => x.DebtId,
                        principalTable: "Debt",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Sales_DebtId",
                table: "Sales",
                column: "DebtId");

            migrationBuilder.CreateIndex(
                name: "IX_Debt_DebtorName",
                table: "Debt",
                column: "DebtorName");

            migrationBuilder.CreateIndex(
                name: "IX_DebtPayment_DebtId",
                table: "DebtPayment",
                column: "DebtId");

            migrationBuilder.AddForeignKey(
                name: "FK_Sales_Debt_DebtId",
                table: "Sales",
                column: "DebtId",
                principalTable: "Debt",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Sales_Debt_DebtId",
                table: "Sales");

            migrationBuilder.DropTable(
                name: "DebtPayment");

            migrationBuilder.DropTable(
                name: "Debt");

            migrationBuilder.DropTable(
                name: "Debtor");

            migrationBuilder.DropIndex(
                name: "IX_Sales_DebtId",
                table: "Sales");

            migrationBuilder.DropColumn(
                name: "DebtId",
                table: "Sales");

            migrationBuilder.AlterColumn<string>(
                name: "Subtitle",
                table: "Products",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "IsDeleted", "Name", "Subtitle" },
                values: new object[,]
                {
                    { "4800361410816", false, "Bear Brand", "Swak" },
                    { "4902430453295", false, "Downy", "Garden Bloom" },
                    { "7622300637996", false, "Tang", "Grapes" }
                });

            migrationBuilder.InsertData(
                table: "Prices",
                columns: new[] { "DateCreated", "Id", "Value" },
                values: new object[,]
                {
                    { new DateTime(2024, 5, 3, 11, 35, 55, 381, DateTimeKind.Local).AddTicks(2937), "4800361410816", 13.0 },
                    { new DateTime(2024, 5, 3, 11, 35, 55, 381, DateTimeKind.Local).AddTicks(2924), "4902430453295", 8.0 },
                    { new DateTime(2024, 5, 3, 11, 35, 55, 381, DateTimeKind.Local).AddTicks(2936), "7622300637996", 22.0 }
                });
        }
    }
}
