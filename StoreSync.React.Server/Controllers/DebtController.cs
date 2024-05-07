using Microsoft.AspNetCore.Mvc;
using StoreSync.DTO;
using StoreSync.React.Server.DataAccess;
using StoreSync.React.Server.Models;

namespace StoreSync.React.Server.Controllers;

[ApiController]
[Route("/API/[controller]")]
public class DebtController : ControllerBase
{
    private readonly UnitOfWork _unitOfWork;

    public DebtController(AppDbContext context)
    {
        _unitOfWork = new UnitOfWork(context);
    }

    [HttpGet("Debtors")]
    public IActionResult GetDebtors()
    {
        var debtors = _unitOfWork.Debtors.GetAll();

        if (debtors?.Any() != true)
        {
            return NotFound();
        }

        var debtorsMapped = debtors.Select(d => new DebtorRead { Name =  d.Name });

        return Ok(debtorsMapped);
    }

    [HttpGet("Debtors/{debtorName}")]
    public IActionResult GetDebtorData(string debtorName)
    {
        // check if the debtor exists
        var debtor = _unitOfWork.Debtors.Get(debtorName);

        if (debtor is null)
        {
            return NotFound();
        }

        var history = new History();

        // get debt history
        var debts = _unitOfWork.Debts.GetAll(d => d.DebtorName == debtorName);

        foreach (var debt in debts)
        {
            foreach (var sale in debt.Sales)
            {
                var date = sale.DateOfPurchase;
                history.Debts.TryGetValue(date, out var debtHistory);

                if (debtHistory is null)
                {
                    debtHistory = new SalesRead()
                    {
                        Purchases = new List<PurchaseRead>()
                    };

                    history.Debts.Add(date, debtHistory);
                }

                foreach (var purchase in sale.Purchases)
                {
                    debtHistory.Purchases.Add(new PurchaseRead { 
                        Count = purchase.Count,
                        Product = new ProductRead {
                            Id = purchase.ProductId,
                            Name = purchase.Product.Name,
                            Subtitle = purchase.Product.Subtitle,
                            Price = _unitOfWork.Prices.Get(purchase.ProductId, date).Value,
                        }
                    });
                }
            }
        }

        // get payment history
        var payments = _unitOfWork.DebtPayments.GetAll(d => d.DebtorName == debtorName);
        foreach (var payment in payments)
        {
            history.Payments.Add(payment.DateCreated, payment.Payment);
        }

        return Ok(history);
    }

    [HttpPost]
    public IActionResult CreateDebt(DebtWrite debt)
    {
        // check if the user exists in the database
        var debtor = _unitOfWork.Debtors.Get(debt.DebtorName);

        if (debtor is null)
        {
            debtor = new Debtor()
            {
                Name = debt.DebtorName,
            };

            _unitOfWork.Debtors.Insert(debtor);
            _unitOfWork.Save();
        }

        try
        {
            // create new debt record
            var newDebt = new Debt
            {
                DebtorName = debtor.Name,
                DateCreated = DateTime.Now,
            };

            _unitOfWork.Debts.Insert(newDebt);
            _unitOfWork.Save();

            // insert sales
            if (debt.Debt.Purchases?.Any() != true)
            {
                return BadRequest();
            }

            var newSale = new Sale
            {
                DateOfPurchase = DateTime.Now,
                DebtId = newDebt.Id
            };

            _unitOfWork.Sales.Insert(newSale);
            _unitOfWork.Save();

            foreach (var purchase in debt.Debt.Purchases)
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
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        }

        return Ok();
    }

    [HttpPost("Payment")]
    public IActionResult AddPayment(PaymentWrite payment)
    {
        try
        {
            var newPayment = new DebtPayment
            {
                DebtorName = payment.DebtorName,
                Payment = payment.Value,
                DateCreated = DateTime.Now
            };

            _unitOfWork.DebtPayments.Insert(newPayment);
            _unitOfWork.Save();
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        }

        return Ok();
    }

}
