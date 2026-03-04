using BlackBear.Services.Core.Data;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Services
{
    public class BookingCleanupService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<BookingCleanupService> _logger;
        private static readonly TimeSpan CheckInterval = TimeSpan.FromMinutes(5);
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
            }

            _logger.LogInformation("BookingCleanupService stopped");
        }

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
                                ? "Auto-cancelled: pending approval timeout (15 min)"
                                : b.Notes + " | Auto-cancelled: pending approval timeout (15 min)"),
                        stoppingToken);

                if (expiredCount > 0)
                {
                    _logger.LogInformation(
                        "BookingCleanup: cancelled {Count} expired pending booking(s)", expiredCount);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during booking cleanup");
            }
        }
    }
}
