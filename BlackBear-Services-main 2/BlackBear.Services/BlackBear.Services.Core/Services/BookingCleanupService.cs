using BlackBear.Services.Core.Data;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Services
{
    public class BookingCleanupService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<BookingCleanupService> _logger;
        private static readonly TimeSpan CheckInterval = TimeSpan.FromMinutes(1);
        private static readonly TimeSpan PendingTimeout = TimeSpan.FromMinutes(15);

        public BookingCleanupService(IServiceScopeFactory scopeFactory, ILogger<BookingCleanupService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("BookingCleanupService started");

            while (!stoppingToken.IsCancellationRequested)
            {
                await Task.Delay(CheckInterval, stoppingToken);

                if (stoppingToken.IsCancellationRequested)
                    break;

                await CancelExpiredPendingBookingsAsync(stoppingToken);
                await ExpireReservedBookingsAsync(stoppingToken);
            }

            _logger.LogInformation("BookingCleanupService stopped");
        }

        // Cancel Pending bookings (collector approval flow) after 15 min
        private async Task CancelExpiredPendingBookingsAsync(CancellationToken stoppingToken)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<BlackBearDbContext>();

                var cutoff = DateTime.UtcNow - PendingTimeout;

                var expiredCount = await context.ZoneUnitBookings
                    .Where(b => !b.IsDeleted &&
                                b.Status == "Pending" &&
                                b.CreatedAt < cutoff)
                    .ExecuteUpdateAsync(s => s
                        .SetProperty(b => b.Status, "Cancelled")
                        .SetProperty(b => b.Notes,
                            b => b.Notes == null
                                ? "Auto-cancelled: pending approval timeout"
                                : b.Notes + " | Auto-cancelled: pending approval timeout"),
                        stoppingToken);

                if (expiredCount > 0)
                {
                    _logger.LogInformation(
                        "BookingCleanup: cancelled {Count} expired pending booking(s)", expiredCount);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during pending booking cleanup");
            }
        }

        // Expire Reserved bookings past their ExpirationTime and release units
        private async Task ExpireReservedBookingsAsync(CancellationToken stoppingToken)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<BlackBearDbContext>();

                var now = DateTime.UtcNow;

                var expiredBookings = await context.ZoneUnitBookings
                    .Include(b => b.AssignedUnits)
                    .Where(b => !b.IsDeleted &&
                                b.Status == "Reserved" &&
                                b.ExpirationTime.HasValue &&
                                b.ExpirationTime.Value <= now)
                    .ToListAsync(stoppingToken);

                if (expiredBookings.Count == 0)
                    return;

                foreach (var booking in expiredBookings)
                {
                    booking.Status = "Expired";
                    booking.Notes = string.IsNullOrEmpty(booking.Notes)
                        ? "Auto-expired: guest did not arrive before expiration time"
                        : $"{booking.Notes} | Auto-expired: guest did not arrive before expiration time";

                    // Release all assigned units
                    foreach (var unit in booking.AssignedUnits)
                    {
                        unit.Status = "Available";
                        unit.CurrentBookingId = null;
                    }
                }

                await context.SaveChangesAsync(stoppingToken);

                _logger.LogInformation(
                    "BookingCleanup: expired {Count} reserved booking(s) and released units", expiredBookings.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during reserved booking expiration");
            }
        }
    }
}
