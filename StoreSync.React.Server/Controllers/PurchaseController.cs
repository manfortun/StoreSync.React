using Microsoft.AspNetCore.Mvc;
using StoreSync.DTO;
using StoreSync.React.Server.DataAccess;
using StoreSync.React.Server.Models;

namespace StoreSync.React.Server.Controllers;

[ApiController]
[Route("API/[controller]")]
public class PurchaseController : ControllerBase
{
    private readonly UnitOfWork _unitOfWork;

    public PurchaseController(AppDbContext context)
    {
        _unitOfWork = new UnitOfWork(context);
    }

    [HttpGet]
    public IActionResult GetSales(DateTime date)
    {
        var sales = _unitOfWork.Sales.GetAll(s => s.DateOfPurchase.Date == date.Date);

        var salesIds = sales.Select(s => s.Id);
        var purchases = _unitOfWork.Purchases.GetAll(s => salesIds.Contains(s.SaleId));
        var salesRead = new SalesRead
        {
            Purchases = new List<PurchaseRead>()
        };

        foreach (var purchase in purchases)
        {
            var newPurchase = new PurchaseRead();

            var product = new ProductRead
            {
                Id = purchase.ProductId,
                Name = purchase.Product.Name,
                Subtitle = purchase.Product.Subtitle,
                Price = _unitOfWork.Prices.Get(purchase.ProductId, purchase.Sale.DateOfPurchase).Value,
            };

            newPurchase.Product = product;
            newPurchase.Count = purchase.Count;

            salesRead.Purchases.Add(newPurchase);
        }

        return Ok(salesRead);
    }

    [HttpGet("{from}~{to}")]
    public IActionResult GetSalesRange(DateTime from, DateTime to)
    {
        var sales = _unitOfWork.Sales.GetAll(s => (s.DateOfPurchase.Date >= from.Date && s.DateOfPurchase.Date <= to.Date) || !string.IsNullOrEmpty(s.DebtId));
        var payments = _unitOfWork.DebtPayments.GetAll(s => s.DateCreated.Date <= to.Date);

        var salesRangeRead = new SalesRangeRead
        {
            Debts = new Dictionary<DateTime, double>(),
            Sales = new Dictionary<DateTime, double>(),
            Average = 0
        };

        DateTime currentDate = from.Date;
        while (currentDate <= to.Date)
        {
            salesRangeRead.Sales.Add(currentDate.Date, 0);
            salesRangeRead.Debts.Add(currentDate.Date, 0);
            currentDate = currentDate.AddDays(1);
        }

        foreach (var sale in sales)
        {
            DateTime dateOfSale = sale.DateOfPurchase;
            if (!string.IsNullOrEmpty(sale.DebtId))
            {
                foreach (var purchase in sale.Purchases)
                {
                    double price = _unitOfWork.Prices.Get(purchase.ProductId, dateOfSale)?.Value ?? 0;
                    double total = price * purchase.Count;
                    var currDate = dateOfSale.Date;

                    while (currDate <= to.Date)
                    {
                        if (currDate < from.Date)
                        {
                            salesRangeRead.Debts[from.Date] += total;
                            currDate = from.Date.AddDays(1);
                        }
                        else
                        {
                            salesRangeRead.Debts[currDate] += total;
                            currDate = currDate.AddDays(1);
                        }
                    }
                }
            }
            else if (sale.DateOfPurchase.Date >= from.Date && sale.DateOfPurchase.Date <= to.Date)
            {
                foreach (var purchase in sale.Purchases)
                {
                    double price = _unitOfWork.Prices.Get(purchase.ProductId, dateOfSale)?.Value ?? 0;
                    salesRangeRead.Sales[dateOfSale.Date] += purchase.Count * price;
                    salesRangeRead.Average += purchase.Count * price;
                }
            }
        }

        foreach (var payment in payments)
        {
            var currDate = payment.DateCreated.Date;
            while (currDate <= to.Date)
            {
                if (currDate < from.Date)
                {
                    salesRangeRead.Debts[from.Date] -= payment.Payment;
                    currDate = from.Date.AddDays(1);
                }
                else
                {
                    salesRangeRead.Debts[currDate] -= payment.Payment;
                    currDate = currDate.AddDays(1);
                }
            }
        }

        salesRangeRead.Average /= (to.Date - from.Date).TotalDays + 1;

        return Ok(salesRangeRead);
    }

    [HttpGet("Summary/{to}")]
    public IActionResult GetSummary(DateTime to)
    {
        var sales = _unitOfWork.Sales.GetAll(s => s.DateOfPurchase.Date == to.Date && string.IsNullOrEmpty(s.DebtId));

        var summary = new SaleSummary
        {
            ProductSales = new Dictionary<string, ProductSale>()
        };

        if (!sales.Any()) return Ok(summary);

        double saleForTheDay = 0;

        foreach (var sale in sales)
        {
            foreach (var purchase in sale.Purchases)
            {
                double price = _unitOfWork.Prices.Get(purchase.ProductId, sale.DateOfPurchase)?.Value ?? 0;
                double purchaseTotal = purchase.Count * price;

                if (sale.DateOfPurchase.Date == to.Date)
                {
                    saleForTheDay += purchaseTotal;
                }

                if (!summary.ProductSales.ContainsKey(purchase.ProductId))
                {
                    summary.ProductSales.Add(purchase.ProductId, new ProductSale
                    {
                        Name = purchase.Product.Name,
                        Subtitle = purchase.Product.Subtitle,
                        Count = 0,
                        Total = 0
                    });
                }

                summary.ProductSales[purchase.ProductId].Count += purchase.Count;
                summary.ProductSales[purchase.ProductId].Total += purchaseTotal;
            }
        }

        return Ok(summary);
    }

    [HttpGet("TopProducts")]
    public IActionResult GetTopProducts()
    {
        var sales = _unitOfWork.Sales.GetAll();

        var topProductSummary = new TopProductSummary
        {
            Products = new Dictionary<string, double>(),
            ProductNames = new Dictionary<string, string>()
        };

        if (!sales.Any()) return Ok(topProductSummary);

        foreach (var sale in sales)
        {
            foreach (var purchase in sale.Purchases)
            {
                if (!topProductSummary.Products.ContainsKey(purchase.ProductId))
                {
                    topProductSummary.Products.Add(purchase.ProductId, 0);
                    topProductSummary.ProductNames.Add(purchase.ProductId, $"{purchase.Product.Name} {purchase.Product.Subtitle}");
                }

                double price = _unitOfWork.Prices.Get(purchase.ProductId, sale.DateOfPurchase)?.Value ?? 0;
                topProductSummary.Products[purchase.ProductId] += price;
            }
        }

        return Ok(topProductSummary);
    }

    [HttpGet("DailySales")]
    public IActionResult GetDailySales()
    {
        var sales = _unitOfWork.Sales.GetAll();
        var payments = _unitOfWork.DebtPayments.GetAll();

        var dailySales = this.InitializeDailySalesRead(sales);
        double grandTotal = this.CalculateSalesAndDebts(sales, dailySales);
        grandTotal += this.CalculatePayments(payments, dailySales);

        dailySales.NoOfDays = dailySales.Sales.Keys.Count;
        dailySales.AverageSale = this.FormatAmount(grandTotal / Math.Max(dailySales.NoOfDays, 1));
        dailySales.TotalSales = this.FormatAmount(grandTotal);

        return Ok(dailySales);
    }

    [HttpGet("GetSalesForTheDay")]
    public IActionResult GetSalesForTheDay()
    {
        var currentDate = DateTime.Now.Date;

        var sales = _unitOfWork.Sales.GetAll(s => s.DateOfPurchase.Date == currentDate);

        double total = 0;

        foreach (var sale in sales)
        {
            foreach (var purchase in sale.Purchases)
            {
                var price = _unitOfWork.Prices.Get(purchase.ProductId, sale.DateOfPurchase);
                total += price.Value * purchase.Count;
            }
        }

        return Ok(total);
    }

    [HttpPost]
    public IActionResult CreateNewSale(SalesWrite sales)
    {
        if (sales.Purchases?.Any() != true)
        {
            return BadRequest();
        }

        var newSale = new Sale
        {
            DateOfPurchase = DateTime.Now,
        };

        _unitOfWork.Sales.Insert(newSale);
        _unitOfWork.Save();

        foreach (var purchase in sales.Purchases)
        {
            var newPurchase = new Purchase
            {
                Count = purchase.Count,
                ProductId = purchase.ProductId,
                SaleId = newSale.Id
            };

            _unitOfWork.Purchases.Insert(newPurchase);
        }

        _unitOfWork.Save();

        return Ok();
    }

    private DailySaleRead InitializeDailySalesRead(IEnumerable<Sale> sales)
    {
        var dailySales = new DailySaleRead();

        if (sales != null && sales.Any())
        {
            var minDate = sales.Min(s => s.DateOfPurchase.Date);
            while (minDate <= DateTime.Now.Date)
            {
                dailySales.Sales.Add(minDate, 0);
                dailySales.Payments.Add(minDate, 0);
                dailySales.Debts.Add(minDate, 0);
                minDate = minDate.AddDays(1);
            }
        }

        return dailySales;
    }

    private double CalculateSalesAndDebts(IEnumerable<Sale> sales, DailySaleRead dailySales)
    {
        var prices = _unitOfWork.Prices.GetAll();
        var purchases = _unitOfWork.Purchases.GetAll();
        double grandTotal = 0;
        foreach (var sale in sales)
        {
            bool isDebt = !string.IsNullOrEmpty(sale.DebtId);
            var saleDate = sale.DateOfPurchase.Date;
            foreach (var purchase in purchases.Where(p => p.SaleId == sale.Id))
            {
                var price = prices
                    .Where(p => p.Id == purchase.ProductId && p.DateCreated <= sale.DateOfPurchase)
                    .MaxBy(p => p.DateCreated)?.Value ?? 0;
                var total = price * purchase.Count;

                if (isDebt)
                {
                    this.AddToRecord(dailySales.Debts, saleDate, total);
                }
                else
                {
                    this.AddToRecord(dailySales.Sales, saleDate, total);
                    grandTotal += total;
                }
            }
        }

        return grandTotal;
    }

    private double CalculatePayments(IEnumerable<DebtPayment> payments, DailySaleRead dailySales)
    {
        double grandTotal = 0;

        foreach (var payment in payments)
        {
            var paymentDate = payment.DateCreated.Date;

            if (double.IsNegative(payment.Payment))
            {
                if (!dailySales.Debts.ContainsKey(paymentDate))
                {
                    dailySales.Debts.Add(paymentDate, 0);
                }

                dailySales.Debts[paymentDate] += Math.Abs(payment.Payment);
            }
            else
            {
                if (!dailySales.Payments.ContainsKey(paymentDate))
                {
                    dailySales.Payments.Add(paymentDate, 0);
                }

                dailySales.Payments[paymentDate] += payment.Payment;
                grandTotal += payment.Payment;
            }
        }

        return grandTotal;
    }

    private string FormatAmount(double amount)
    {
        string unit = string.Empty;
        if (amount >= 1000000)
        {
            amount /= 1000000;
            unit = "M";
        }
        else if (amount >= 1000)
        {
            amount /= 1000;
            unit = "K";
        }

        return $"{Math.Round(amount, 1)}{unit}";
    }

    private void AddToRecord(Dictionary<DateTime, double> dic, DateTime saleDate, double total)
    {
        if (!dic.ContainsKey(saleDate))
        {
            dic.Add(saleDate, 0);
        }

        dic[saleDate] += total;
    }
}
