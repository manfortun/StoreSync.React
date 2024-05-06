using Microsoft.AspNetCore.Mvc;
using StoreSync.DTO;
using StoreSync.React.Server.DataAccess;
using StoreSync.React.Server.Models;
using System.Numerics;
using System.Reflection.Metadata.Ecma335;
using static System.Runtime.InteropServices.JavaScript.JSType;

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
        var sales = _unitOfWork.Sales.GetAll(s => s.DateOfPurchase.Date >= from.Date && s.DateOfPurchase.Date <= to.Date);


        var salesRangeRead = new SalesRangeRead
        {
            Sales = new Dictionary<DateTime, double>(),
            Average = 0
        };

        DateTime currentDate = from.Date;
        while (currentDate <= to.Date)
        {
            salesRangeRead.Sales.Add(currentDate.Date, 0);
            currentDate = currentDate.AddDays(1);
        }

        foreach (var sale in sales)
        {
            DateTime dateOfSale = sale.DateOfPurchase;
            foreach (var purchase in sale.Purchases)
            {
                double price = _unitOfWork.Prices.Get(purchase.ProductId, dateOfSale)?.Value ?? 0;
                salesRangeRead.Sales[dateOfSale.Date] += purchase.Count * price;
                salesRangeRead.Average += purchase.Count * price;
            }
        }

        salesRangeRead.Average /= (to.Date - from.Date).TotalDays + 1;

        return Ok(salesRangeRead);
    }

    [HttpGet("Summary/{to}")]
    public IActionResult GetSummary(DateTime to)
    {
        var sales = _unitOfWork.Sales.GetAll(s => s.DateOfPurchase.Date == to.Date);

        var summary = new SaleSummary
        {
            SaleForTheDay = 0,
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

        summary.SaleForTheDay = saleForTheDay;

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
}
