# ============================================
# BlackBear.Services.Core - Production Dockerfile
# Optimized for Azure Container Apps / App Service
# ============================================

# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /src

# Copy csproj and restore dependencies (cached layer)
COPY ["BlackBear.Services.Core/BlackBear.Services.Core.csproj", "BlackBear.Services.Core/"]
RUN dotnet restore "BlackBear.Services.Core/BlackBear.Services.Core.csproj" --runtime linux-musl-x64

# Copy source code and build
COPY . .
WORKDIR "/src/BlackBear.Services.Core"
RUN dotnet build "BlackBear.Services.Core.csproj" -c Release --no-restore

# Stage 2: Publish
FROM build AS publish
RUN dotnet publish "BlackBear.Services.Core.csproj" -c Release -o /app/publish \
    --no-build \
    --runtime linux-musl-x64 \
    --self-contained false \
    /p:PublishTrimmed=false

# Stage 3: Runtime (Production)
FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS final

# Labels for Azure Container Registry
LABEL org.opencontainers.image.title="BlackBear.Services.Core" \
      org.opencontainers.image.description="BlackBear Core API Service" \
      org.opencontainers.image.vendor="BlackBear"

# Install curl for health checks and set timezone
RUN apk add --no-cache curl tzdata \
    && cp /usr/share/zoneinfo/UTC /etc/localtime \
    && echo "UTC" > /etc/timezone \
    && apk del tzdata

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy published app
COPY --from=publish /app/publish .

# Set ownership to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Environment variables for production
ENV ASPNETCORE_URLS=http://+:8080 \
    ASPNETCORE_ENVIRONMENT=Production \
    DOTNET_RUNNING_IN_CONTAINER=true \
    DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

# Expose port (Azure uses 8080 by default)
EXPOSE 8080

# Health check for Azure
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl --fail http://localhost:8080/health || exit 1

# Entry point
ENTRYPOINT ["dotnet", "BlackBear.Services.Core.dll"]