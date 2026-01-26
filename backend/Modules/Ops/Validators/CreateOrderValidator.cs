using FluentValidation;
using Microsoft.EntityFrameworkCore;
using RivieraApi.Data;
using RivieraApi.Modules.Ops.DTOs;

namespace RivieraApi.Modules.Ops.Validators;

public class CreateOrderValidator : AbstractValidator<CreateOrderDto>
{
    private readonly RivieraDbContext _context;

    public CreateOrderValidator(RivieraDbContext context)
    {
        _context = context;

        // Venue must exist
        RuleFor(x => x.VenueId)
            .GreaterThan(0)
            .WithMessage("Venue ID must be greater than 0")
            .MustAsync(VenueExists)
            .WithMessage("Venue does not exist");

        // If sunbed is specified, it must exist and be available
        RuleFor(x => x.ProductId)
            .MustAsync(SunbedExistsAndAvailable)
            .When(x => x.ProductId.HasValue)
            .WithMessage("Sunbed does not exist or is not available");

        // Must have at least one item
        RuleFor(x => x.Items)
            .NotEmpty()
            .WithMessage("Order must contain at least one item");

        // Validate each order item
        RuleForEach(x => x.Items)
            .SetValidator(new OrderItemValidator(_context));
    }

    private async Task<bool> VenueExists(int venueId, CancellationToken cancellationToken)
    {
        return await _context.Venues.AnyAsync(v => v.Id == venueId, cancellationToken);
    }

    private async Task<bool> SunbedExistsAndAvailable(CreateOrderDto order, int? productId, CancellationToken cancellationToken)
    {
        if (!productId.HasValue) return true;

        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == productId.Value, cancellationToken);

        return product != null && product.IsAvailable;
    }
}

public class OrderItemValidator : AbstractValidator<OrderItemDto>
{
    private readonly RivieraDbContext _context;

    public OrderItemValidator(RivieraDbContext context)
    {
        _context = context;

        // Product must exist
        RuleFor(x => x.ProductId)
            .GreaterThan(0)
            .WithMessage("Product ID must be greater than 0")
            .MustAsync(ProductExists)
            .WithMessage("Product does not exist");

        // Product must be available
        RuleFor(x => x.ProductId)
            .MustAsync(ProductIsAvailable)
            .WithMessage("Product is not available");

        // Quantity must be positive
        RuleFor(x => x.Quantity)
            .GreaterThan(0)
            .WithMessage("Quantity must be greater than 0")
            .LessThanOrEqualTo(100)
            .WithMessage("Quantity cannot exceed 100");

        // Name is required
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Product name is required")
            .MaximumLength(200)
            .WithMessage("Product name cannot exceed 200 characters");

        // Price must be positive
        RuleFor(x => x.Price)
            .GreaterThan(0)
            .WithMessage("Price must be greater than 0")
            .LessThanOrEqualTo(10000)
            .WithMessage("Price cannot exceed €10,000");
    }

    private async Task<bool> ProductExists(int productId, CancellationToken cancellationToken)
    {
        return await _context.Products.AnyAsync(p => p.Id == productId, cancellationToken);
    }

    private async Task<bool> ProductIsAvailable(int productId, CancellationToken cancellationToken)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == productId, cancellationToken);

        return product != null && product.IsAvailable;
    }
}
