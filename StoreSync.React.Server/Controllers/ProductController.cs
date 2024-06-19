using Microsoft.AspNetCore.Mvc;
using StoreSync.DTO;
using StoreSync.React.Server.DataAccess;
using StoreSync.React.Server.Models;
using StoreSync.React.Server.Services;

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
        var prices = _unitOfWork.Prices.GetAll();

        var productsMapped = new List<ProductRead>();

        foreach (var p in products)
        {
            var newProduct = new ProductRead
            {
                Id = p.Id,
                Name = p.Name,
                Subtitle = p.Subtitle
            };

            newProduct.Price = prices
                .Where(price => price.Id == p.Id)
                .MaxBy(price => price.DateCreated)?.Value ?? 0;

            productsMapped.Add(newProduct);
        }

        productsMapped = productsMapped.OrderBy(p => p.Name).ThenBy(p => p.Subtitle).ToList();

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
            Subtitle = product.Subtitle,
            Price = _unitOfWork.Prices.Get(product.Id)?.Value ?? 0
        };

        return Ok(productMapped);
    }

    [HttpGet("GetBarcodes")]
    public IActionResult GetBarcodes()
    {
        string[] registeredBarcodes = _unitOfWork.Products
            .GetAll()
            .Select(p => p.Id)
            .ToArray();

        return Ok(registeredBarcodes);
    }

    [HttpGet("Search/{searchString}")]
    public IActionResult Search(string searchString)
    {
        var products = _unitOfWork.Products.GetAll();

        var searchedProducts = products.Where(p => p.Id.StartsWith(searchString) || p.Id.EndsWith(searchString));

        if (!searchedProducts.Any())
        {
            searchString = searchString.ToSimpleString();
            var matchingProducts = products.Select(p =>
            {
                var name = p.Name.ToSimpleString();
                var subtitle = p.Subtitle.ToSimpleString();

                var matchScore = searchString.Sum(word =>
                {
                    if (name.Contains(word)) return 1;
                    else if (subtitle.Contains(word)) return 1;
                    else return 0;
                });

                return new { Product = p, MatchScore = matchScore };
            });

            if (!matchingProducts.Any(mp => mp.MatchScore > 0))
            {
                return NotFound();
            }

            searchedProducts = matchingProducts
                .Where(mp => mp.MatchScore == searchString.Length)
                .OrderByDescending(mp => mp.Product.Name.ToSimpleString().StartsWith(searchString))
                .ThenByDescending(mp => mp.Product.Subtitle.ToSimpleString().StartsWith(searchString))
                .ThenByDescending(mp => mp.Product.Name.ToSimpleString().Contains(searchString))
                .ThenByDescending(mp => mp.Product.Subtitle.ToSimpleString().Contains(searchString))
                .ThenByDescending(mp => mp.MatchScore)
                .Take(10)
                .Select(mp => mp.Product);
        }

        var searchedProductsMapped = searchedProducts.Select(sp => new ProductRead
        {
            Id = sp.Id,
            Name = sp.Name,
            Subtitle = sp.Subtitle,
            Price = _unitOfWork.Prices.Get(sp.Id)?.Value ?? 0
        });

        return Ok(searchedProductsMapped);
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
