using Microsoft.AspNetCore.Mvc;
using StoreSync.DTO;
using StoreSync.React.Server.DataAccess;
using StoreSync.React.Server.Models;

namespace StoreSync.React.Server.Controllers;

[ApiController]
[Route("API/[controller]")]
public class ProductController : ControllerBase
{
    private readonly UnitOfWork _unitOfWork;

    public ProductController(AppDbContext context)
    {
        _unitOfWork = new UnitOfWork(context);
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        var products = _unitOfWork.Products.GetAll();

        var productsMapped = new List<ProductRead>();

        foreach (var p in products)
        {
            var newProduct = new ProductRead
            {
                Id = p.Id,
                Name = p.Name,
                Subtitle = p.Subtitle
            };

            newProduct.Price = _unitOfWork.Prices.Get(p.Id)?.Value ?? 0;
            productsMapped.Add(newProduct);
        }

        return Ok(productsMapped);
    }

    [HttpGet("{id}")]
    public IActionResult Get(string id)
    {
        var product = _unitOfWork.Products.Get(id);

        if (product is null) return NotFound();

        var productMapped = new ProductRead
        {
            Id = product.Id,
            Name = product.Name,
            Subtitle = product.Subtitle
        };

        productMapped.Price = _unitOfWork.Prices.Get(product.Id)?.Value ?? 0;

        return Ok(productMapped);
    }

    [HttpPost]
    public IActionResult Create(ProductRead product)
    {
        var newProduct = new Product
        {
            Id = product.Id,
            Name = product.Name,
            Subtitle = product.Subtitle,
            IsDeleted = false,
        };

        _unitOfWork.Products.Insert(newProduct);
        _unitOfWork.Save();

        var price = new Price
        {
            Id = newProduct.Id,
            Value = product.Price,
            DateCreated = DateTime.Now
        };

        _unitOfWork.Prices.Insert(price);
        _unitOfWork.Save();

        return Ok(product);
    }

    [HttpPatch]
    public IActionResult Patch(ProductRead product)
    {
        var existingProduct = _unitOfWork.Products.Get(product.Id);

        if (existingProduct is null) return NotFound();

        existingProduct.Name = product.Name;
        existingProduct.Subtitle = product.Subtitle;
        
        _unitOfWork.Products.Update(existingProduct);
        _unitOfWork.Save();

        // check if need to update price
        var existingPrice = _unitOfWork.Prices.Get(existingProduct.Id);

        if (existingPrice is null || existingPrice.Value != product.Price)
        {
            existingPrice = new Price
            {
                Id = existingProduct.Id,
                Value = product.Price,
                DateCreated = DateTime.Now
            };

            _unitOfWork.Prices.Insert(existingPrice);
        }

        _unitOfWork.Save();

        return Ok(product);
    }
}
