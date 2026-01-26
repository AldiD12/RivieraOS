# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY RestaurantQRApi.csproj .
RUN dotnet restore

# Copy everything else and build
COPY . .
RUN dotnet build RestaurantQRApi.csproj -c Release -o /app/build
RUN dotnet publish RestaurantQRApi.csproj -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish .

# Expose port (Render will set PORT env variable)
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "RestaurantQRApi.dll"]
