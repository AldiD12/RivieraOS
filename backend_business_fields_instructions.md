# Backend Instructions: Add New Business Fields

We need to add a few new fields to the `Business` entity and the associated DTOs to support the new business registration requirements. 

## 1. Update `Business.cs` Entity
Add the following new columns to the `Business` entity:

```csharp
[MaxLength(500)]
[Column("google_maps_address")]
public string? GoogleMapsAddress { get; set; }

[MaxLength(500)]
[Column("review_link")]
public string? ReviewLink { get; set; }

[MaxLength(50)]
[Column("phone_number")]
public string? PhoneNumber { get; set; }

[MaxLength(255)]
[Column("operation_zone")]
public string? OperationZone { get; set; }
```

## 2. Generate a Migration
Run the following in the package manager console or via dotnet CLI:
```bash
dotnet ef migrations add AddBusinessRegistrationFields
dotnet ef database update
```

## 3. Update DTOs
Update `CreateBusinessRequest`, `UpdateBusinessRequest`, and `BusinessDetailDto` to include these fields so the frontend can send/receive them:

```csharp
public string? GoogleMapsAddress { get; set; }
public string? ReviewLink { get; set; }
public string? PhoneNumber { get; set; }
public string? OperationZone { get; set; }
```

## 4. Update the Controller logic
In `BusinessesController.cs`, ensure that `CreateBusiness` and `UpdateBusiness` correctly map these new fields from the DTO to the database entity.

*(The frontend has already been updated to send these fields in the JSON payload!)*
