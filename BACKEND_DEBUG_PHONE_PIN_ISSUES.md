# Backend Debug Guide: Phone Number & PIN Storage Issues

## 🔍 **Step 1: Database Inspection**

### **Check if User Exists**
```sql
-- Check if the user was created
SELECT * FROM Users WHERE PhoneNumber LIKE '%674545544%';

-- Check all recent users
SELECT Id, PhoneNumber, Email, FullName, Role, IsActive, CreatedAt 
FROM Users 
ORDER BY CreatedAt DESC 
LIMIT 10;
```

### **Check Phone Number Format**
```sql
-- See exact phone number format stored
SELECT Id, PhoneNumber, LENGTH(PhoneNumber) as PhoneLength
FROM Users 
WHERE PhoneNumber LIKE '%674545544%';

-- Check all phone number formats in database
SELECT DISTINCT PhoneNumber, LENGTH(PhoneNumber) as Length
FROM Users 
ORDER BY PhoneNumber;
```

### **Check PIN Storage**
```sql
-- Check if PIN is stored (don't show actual PIN for security)
SELECT Id, PhoneNumber, 
       CASE WHEN Pin IS NULL THEN 'NULL' 
            WHEN Pin = '' THEN 'EMPTY' 
            ELSE 'HAS_PIN' END as PinStatus,
       LENGTH(Pin) as PinLength
FROM Users 
WHERE PhoneNumber LIKE '%674545544%';
```

## 🔍 **Step 2: Login API Debug**

### **Add Logging to Login Endpoint**
In the login controller, add debug logs:

```csharp
[HttpPost("login/pin")]
public async Task<IActionResult> LoginWithPin([FromBody] PinLoginRequest request)
{
    // Log incoming request (hide PIN for security)
    _logger.LogInformation($"PIN Login attempt - Phone: {request.PhoneNumber}, PIN: [HIDDEN]");
    
    // Check if user exists with exact phone match
    var userExact = await _context.Users
        .FirstOrDefaultAsync(u => u.PhoneNumber == request.PhoneNumber);
    _logger.LogInformation($"Exact phone match: {userExact != null}");
    
    // Check if user exists with phone variations
    var userVariations = await _context.Users
        .Where(u => u.PhoneNumber.Contains(request.PhoneNumber.Replace("+", "").Replace(" ", "")))
        .ToListAsync();
    _logger.LogInformation($"Phone variations found: {userVariations.Count}");
    
    if (userVariations.Any())
    {
        foreach (var user in userVariations)
        {
            _logger.LogInformation($"Found user - ID: {user.Id}, Phone: {user.PhoneNumber}, HasPin: {!string.IsNullOrEmpty(user.Pin)}");
        }
    }
    
    // Continue with normal login logic...
}
```

## 🔍 **Step 3: Frontend Debug Test**

### **Test Different Phone Formats**
Create a test script to try multiple formats:

```javascript
const phoneFormats = [
    '0674545544',      // Original format
    '+355674545544',   // With country code
    '674545544',       // Without leading zero
    '355674545544',    // Country code without +
];

const pin = '1234'; // Replace with actual PIN

for (const phone of phoneFormats) {
    try {
        const response = await fetch('/api/auth/login/pin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: phone, pin: pin })
        });
        
        console.log(`Phone: ${phone} - Status: ${response.status}`);
        if (response.ok) {
            console.log(`✅ SUCCESS with format: ${phone}`);
            break;
        }
    } catch (error) {
        console.log(`Phone: ${phone} - Error: ${error.message}`);
    }
}
```

## 🔍 **Step 4: Common Issues & Solutions**

### **Issue 1: Phone Number Format Mismatch**
**Problem:** SuperAdmin stores `0674545544`, Login expects `+355674545544`

**Solution:**
```csharp
// Normalize phone numbers before comparison
private string NormalizePhoneNumber(string phone)
{
    return phone?.Replace("+", "").Replace(" ", "").Replace("-", "");
}

// In login method:
var normalizedInput = NormalizePhoneNumber(request.PhoneNumber);
var user = await _context.Users
    .FirstOrDefaultAsync(u => NormalizePhoneNumber(u.PhoneNumber) == normalizedInput);
```

### **Issue 2: PIN Not Stored**
**Problem:** PIN field is NULL or empty in database

**Check:**
```sql
SELECT PhoneNumber, Pin, LENGTH(Pin) as PinLength
FROM Users 
WHERE PhoneNumber LIKE '%674545544%';
```

**Solution:** Ensure SuperAdmin API properly saves PIN:
```csharp
// In user creation endpoint
user.Pin = request.Pin; // Make sure this line exists
await _context.SaveChangesAsync();
```

### **Issue 3: PIN Encryption Mismatch**
**Problem:** PIN stored encrypted but login compares plain text

**Check:** Look for PIN hashing in user creation vs login:
```csharp
// Creation (if PIN is hashed)
user.Pin = HashPin(request.Pin);

// Login (must use same hashing)
var isValidPin = VerifyPin(request.Pin, user.Pin);
```

### **Issue 4: User Not Active**
**Problem:** User created but IsActive = false

**Check:**
```sql
SELECT PhoneNumber, IsActive, Role
FROM Users 
WHERE PhoneNumber LIKE '%674545544%';
```

**Solution:**
```csharp
// In login method, add active check
if (!user.IsActive)
{
    return Unauthorized("User account is not active");
}
```

## 🧪 **Step 5: Quick Test Commands**

### **For Backend Developer to Run:**

1. **Check user exists:**
   ```sql
   SELECT * FROM Users WHERE PhoneNumber LIKE '%674545544%';
   ```

2. **Check PIN status:**
   ```sql
   SELECT PhoneNumber, 
          CASE WHEN Pin IS NULL THEN 'NULL' ELSE 'EXISTS' END as PinStatus
   FROM Users WHERE PhoneNumber LIKE '%674545544%';
   ```

3. **Test login with exact database phone format:**
   - Copy exact PhoneNumber from database
   - Use that format in Postman/frontend test

## 🎯 **Expected Findings**

### **If User Exists with PIN:**
- Issue is phone number format normalization
- Need to update login API to handle format variations

### **If User Exists without PIN:**
- Issue is PIN not being saved during creation
- Need to fix SuperAdmin user creation API

### **If User Doesn't Exist:**
- Issue is user creation failing silently
- Need to check SuperAdmin API and database constraints

### **If User Exists but IsActive = false:**
- Issue is user activation
- Need to set IsActive = true during creation or add activation step

## 🚀 **Quick Fix Priority**

1. **Check database** - Does user exist with PIN?
2. **Test phone formats** - Try exact database format
3. **Add logging** - See what login API receives vs finds
4. **Normalize formats** - Handle phone number variations
5. **Verify PIN storage** - Ensure PIN is properly saved and compared