using BlackBear.Services.Core.Data;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Services
{
    public class DailyUnitResetService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<DailyUnitResetService> _logger;
        private static readonly TimeZoneInfo ItalyTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Europe/Rome");

        public DailyUnitResetService(IServiceScopeFactory scopeFactory, ILogger<DailyUnitResetService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("DailyUnitResetService started");

            while (!stoppingToken.IsCancellationRequested)
            {
                var delay = GetDelayUntilMidnight();
                _logger.LogInformation("Next unit reset scheduled in {Hours:F1} hours", delay.TotalHours);

                await Task.Delay(delay, stoppingToken);

                if (stoppingToken.IsCancellationRequested)
                    break;

                await ResetUnitsAsync(stoppingToken);
            }

            _logger.LogInformation("DailyUnitResetService stopped");
        }

        private async Task ResetUnitsAsync(CancellationToken stoppingToken)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<BlackBearDbContext>();

                var now = DateTime.UtcNow;

                // Reset all non-maintenance, non-available units back to Available
                var unitsReset = await context.ZoneUnits
                    .Where(u => !u.IsDeleted && u.Status != "Available" && u.Status != "Maintenance")
                    .ExecuteUpdateAsync(s => s.SetProperty(u => u.Status, "Available"), stoppingToken);

                // Complete any lingering Active or Reserved bookings
                var bookingsClosed = await context.ZoneUnitBookings
                    .Where(b => !b.IsDeleted && (b.Status == "Active" || b.Status == "Reserved"))
                    .ExecuteUpdateAsync(s => s
                        .SetProperty(b => b.Status, "Completed")
                        .SetProperty(b => b.CheckedOutAt, now), stoppingToken);

                _logger.LogInformation(
                    "Daily reset completed: {UnitsReset} units reset to Available, {BookingsClosed} bookings completed",
                    unitsReset, bookingsClosed);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during daily unit reset");
            }
        }

        private static TimeSpan GetDelayUntilMidnight()
        {
            var nowItaly = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, ItalyTimeZone);
            var nextMidnight = nowItaly.Date.AddDays(1);
            var delay = nextMidnight - nowItaly;

            // Safety: if somehow delay is zero or negative, wait until next day
            if (delay <= TimeSpan.Zero)
                delay = TimeSpan.FromDays(1);

            return delay;
        }
    }
}
