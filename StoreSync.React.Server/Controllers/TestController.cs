using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreSync.React.Server.DataAccess;
using StoreSync.React.Server.Models;

namespace StoreSync.React.Server.Controllers;

[ApiController]
[Route("/API/[controller]")]
public class TestController : ControllerBase
{
    private readonly UnitOfWork _unitOfWork;

    public TestController(AppDbContext dbContext)
    {
        _unitOfWork = new UnitOfWork(dbContext);
    }

    [HttpPost("GenerateSales/{count}")]
    public IActionResult GenerateSales(int count)
    {
        var startDate = _unitOfWork.Sales.GetAll().Min(s => s.DateOfPurchase.Date);
        var endDate = DateTime.Now;

        int maxCountPerPurchase = 8;

        Random random = new Random();
        var products = _unitOfWork.Products.GetAll().ToArray();

        foreach (var index in Enumerable.Range(1, count))
        {
            Console.WriteLine(index);
            var newSale = new Sale
            {
                DateOfPurchase = startDate.AddDays(random.Next((endDate - startDate).Days + 1)),
            };

            _unitOfWork.Sales.Insert(newSale);
            _unitOfWork.Save();

            HashSet<int> usedProducts = new HashSet<int>();
            foreach (var p in Enumerable.Range(1, Math.Max(1, random.Next(maxCountPerPurchase))))
            {
                int rand = random.Next(products.Count() - 1);

                if (!usedProducts.Add(rand)) continue;

                var newPurchase = new Purchase
                {
                    Count = random.Next(maxCountPerPurchase),
                    ProductId = products[rand].Id,
                    SaleId = newSale.Id,
                };

                _unitOfWork.Purchases.Insert(newPurchase);
            }
        }

        _unitOfWork.Save();
        return Ok();
    }
}
