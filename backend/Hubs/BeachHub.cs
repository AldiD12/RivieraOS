using Microsoft.AspNetCore.SignalR;

namespace RivieraApi.Hubs;

public class BeachHub : Hub
{
    // Hub exists for broadcasting
    // No methods needed - controllers will use IHubContext to broadcast
}
