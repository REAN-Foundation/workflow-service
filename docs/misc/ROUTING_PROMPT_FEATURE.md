# Routing Prompt Feature Documentation

## Overview

The **Routing Prompt** feature has been added to the Schema entity to support storing prompts that help identify schema characteristics. This optional field is useful for AI-based routing or classification of workflows.

---

## Database Changes

### New Column: `RoutingPrompt`

- **Table**: `schema`
- **Column Name**: `RoutingPrompt`
- **Data Type**: `TEXT`
- **Nullable**: `YES` (Optional)
- **Location**: Added after `ContextParams` column

### Migration

The SQL migration script is located at:
```
migrations/20250103_add_routing_prompt_to_schema.sql
```

#### For MySQL:
```sql
ALTER TABLE `schema`
ADD COLUMN `RoutingPrompt` TEXT NULL AFTER `ContextParams`;
```

#### For PostgreSQL:
```sql
ALTER TABLE "schema"
ADD COLUMN "RoutingPrompt" TEXT NULL;
```

#### Rollback (if needed):
```sql
-- For MySQL:
ALTER TABLE `schema` DROP COLUMN `RoutingPrompt`;

-- For PostgreSQL:
ALTER TABLE "schema" DROP COLUMN "RoutingPrompt";
```

**Note**: This is a **non-breaking change** and can be applied without downtime.

---

## API Changes

### 1. Create Schema (POST `/api/v1/engine/schema`)

**Request Body** - Added optional field:
```json
{
  "TenantId": "uuid",
  "TenantCode": "string",
  "Name": "string",
  "Type": "ChatBot|Application",
  "Description": "string (optional)",
  "RoutingPrompt": "string (optional)",  // NEW FIELD
  "ExecuteImmediately": "boolean (optional)",
  "ContextParams": { ... },
  "ParentSchemaId": "uuid (optional)"
}
```

**Response** - Includes RoutingPrompt:
```json
{
  "Status": "success",
  "Message": "Schema added successfully!",
  "HttpCode": 201,
  "Data": {
    "id": "uuid",
    "Name": "string",
    "Description": "string",
    "RoutingPrompt": "string",  // NEW FIELD
    "Type": "ChatBot|Application",
    "TenantId": "uuid",
    "TenantCode": "string",
    ...
  }
}
```

---

### 2. Update Schema (PUT `/api/v1/engine/schema/:id`)

**Request Body** - Added optional field:
```json
{
  "Name": "string (optional)",
  "Description": "string (optional)",
  "RoutingPrompt": "string (optional)",  // NEW FIELD
  "Type": "ChatBot|Application (optional)",
  "ExecuteImmediately": "boolean (optional)",
  "ContextParams": { ... }
}
```

**Response** - Includes updated RoutingPrompt

---

### 3. Get Schema By ID (GET `/api/v1/engine/schema/:id`)

**Response** - Now includes RoutingPrompt field in the response

---

### 4. **NEW** Get Routing Prompt (GET `/api/v1/engine/schema/:id/routing-prompt`)

Retrieves only the routing prompt for a specific schema.

**Request**:
- Method: `GET`
- URL: `/api/v1/engine/schema/:id/routing-prompt`
- Path Parameters:
  - `id` (uuid, required): Schema ID

**Response**:
```json
{
  "Status": "success",
  "Message": "Routing prompt retrieved successfully!",
  "HttpCode": 200,
  "Data": {
    "RoutingPrompt": "This workflow handles emergency response scenarios with time-sensitive operations"
  }
}
```

**Error Responses**:
- `404 Not Found`: Schema not found
- `500 Internal Server Error`: Server error

---

### 5. **NEW** Set Routing Prompt (PUT `/api/v1/engine/schema/:id/routing-prompt`)

Updates the routing prompt for a specific schema.

**Request**:
- Method: `PUT`
- URL: `/api/v1/engine/schema/:id/routing-prompt`
- Path Parameters:
  - `id` (uuid, required): Schema ID
- Body:
```json
{
  "RoutingPrompt": "string"
}
```

**Response**:
```json
{
  "Status": "success",
  "Message": "Routing prompt updated successfully!",
  "HttpCode": 200,
  "Data": {
    "RoutingPrompt": "Updated prompt text"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input (RoutingPrompt must be a string)
- `404 Not Found`: Schema not found
- `500 Internal Server Error`: Server error

---

## Code Changes Summary

### 1. Database Model
**File**: `src/database/models/engine/schema.model.ts`

Added:
```typescript
@Column({ type: 'text', nullable: true })
RoutingPrompt : string;
```

---

### 2. Domain Types
**File**: `src/domain.types/engine/schema.domain.types.ts`

Updated interfaces:
- `SchemaCreateModel` - Added `RoutingPrompt?: string`
- `SchemaUpdateModel` - Added `RoutingPrompt?: string`
- `SchemaResponseDto` - Added `RoutingPrompt?: string`

---

### 3. Validators
**File**: `src/api/engine/schema/schema.validator.ts`

Added validation for `RoutingPrompt` in:
- `validateCreateRequest()` - Optional string field
- `validateUpdateRequest()` - Optional string field

---

### 4. Service Layer
**File**: `src/database/services/engine/schema.service.ts`

Updated methods:
- `create()` - Handles RoutingPrompt during schema creation
- `update()` - Handles RoutingPrompt during schema update

Added new methods:
- `getRoutingPrompt(id: uuid): Promise<string | null>` - Get routing prompt by schema ID
- `setRoutingPrompt(id: uuid, routingPrompt: string): Promise<string>` - Set/update routing prompt

---

### 5. Mapper
**File**: `src/database/mappers/engine/schema.mapper.ts`

Updated `toResponseDto()` to include `RoutingPrompt` field in response mapping.

---

### 6. Controller
**File**: `src/api/engine/schema/schema.controller.ts`

Added new controller methods:
- `getRoutingPrompt()` - GET routing prompt endpoint handler
- `setRoutingPrompt()` - PUT routing prompt endpoint handler

---

### 7. Routes
**File**: `src/api/engine/schema/schema.routes.ts`

Added new routes:
```typescript
router.get('/:id/routing-prompt', Auth.handle(`${contextBase}.GetRoutingPrompt`, true, true, true), controller.getRoutingPrompt);
router.put('/:id/routing-prompt', Auth.handle(`${contextBase}.SetRoutingPrompt`, true, true, true), controller.setRoutingPrompt);
```

---

## Use Cases

### 1. AI-Based Schema Routing
Store a natural language description of the schema's purpose:
```json
{
  "RoutingPrompt": "This workflow handles customer complaints about billing issues. It includes escalation to supervisor if unresolved within 24 hours."
}
```

An AI system can use this prompt to:
- Route incoming messages to the appropriate workflow
- Classify user intent
- Suggest relevant schemas based on user queries

### 2. Schema Discovery
Help users find the right workflow:
```json
{
  "RoutingPrompt": "Emergency response workflow for time-critical health situations with 90-minute overall timer"
}
```

### 3. Workflow Documentation
Provide context for workflow builders:
```json
{
  "RoutingPrompt": "Multi-step customer onboarding process with document verification, compliance checks, and welcome messaging"
}
```

---

## Integration Example

### Creating a Schema with Routing Prompt

```javascript
const createSchemaPayload = {
  TenantId: "550e8400-e29b-41d4-a716-446655440000",
  TenantCode: "ACME_CORP",
  Name: "Emergency Response Workflow",
  Type: "ChatBot",
  Description: "Handles emergency health situations",
  RoutingPrompt: "Use this workflow for urgent health emergencies that require immediate response and follow-up within 90 minutes. Includes automatic escalation and reporter notifications.",
  ExecuteImmediately: false
};

const response = await fetch('/api/v1/engine/schema', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(createSchemaPayload)
});
```

### Getting Routing Prompt

```javascript
const schemaId = "550e8400-e29b-41d4-a716-446655440000";
const response = await fetch(`/api/v1/engine/schema/${schemaId}/routing-prompt`);
const data = await response.json();
console.log(data.Data.RoutingPrompt);
```

### Updating Routing Prompt

```javascript
const schemaId = "550e8400-e29b-41d4-a716-446655440000";
const response = await fetch(`/api/v1/engine/schema/${schemaId}/routing-prompt`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    RoutingPrompt: "Updated: This workflow now includes automated SMS notifications"
  })
});
```

---

## Testing

### Manual Testing Checklist

- [ ] Create schema with RoutingPrompt
- [ ] Create schema without RoutingPrompt (should work - optional field)
- [ ] Update schema to add RoutingPrompt
- [ ] Update schema to modify existing RoutingPrompt
- [ ] Update schema to set RoutingPrompt to null/empty
- [ ] Get schema by ID - verify RoutingPrompt is included
- [ ] Get routing prompt by schema ID
- [ ] Set routing prompt by schema ID
- [ ] Search schemas - verify RoutingPrompt is included in results
- [ ] Verify TypeORM auto-sync creates the column correctly

### Sample Test Data

```json
{
  "TenantId": "test-tenant-id",
  "TenantCode": "TEST",
  "Name": "Test Schema with Routing Prompt",
  "Type": "ChatBot",
  "RoutingPrompt": "This is a test routing prompt for schema classification"
}
```

---

## Backward Compatibility

✅ **Fully backward compatible**

- Existing schemas without `RoutingPrompt` will have `NULL` value
- All existing API calls continue to work
- The field is optional in create/update operations
- No breaking changes to existing code

---

## Performance Considerations

- **Database**: TEXT column has minimal impact on performance
- **API**: No additional database queries for standard operations
- **Indexing**: Not indexed by default (can be added if needed for search)

---

## Future Enhancements

Potential future improvements:
1. **Full-text search** on RoutingPrompt for schema discovery
2. **AI-powered schema suggestion** based on RoutingPrompt similarity
3. **Multi-language support** for RoutingPrompt
4. **Versioning** of RoutingPrompt changes
5. **Validation** of prompt quality/completeness

---

## Security Considerations

- RoutingPrompt is a text field with no size limit (TEXT type)
- Input is validated as string type
- Stored as plain text (consider encryption if sensitive)
- Access controlled via existing auth middleware

---

## Deployment Steps

1. **Backup database** (recommended before any schema changes)
2. **Apply migration script** based on your database type (MySQL or PostgreSQL)
3. **Deploy updated code** (no service restart needed - TypeORM will sync)
4. **Verify migration**:
   ```sql
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'schema' AND column_name = 'RoutingPrompt';
   ```
5. **Test endpoints** using the examples above

---

## Support

For issues or questions regarding this feature:
- Check the migration script in `migrations/20250103_add_routing_prompt_to_schema.sql`
- Review the code changes listed in this document
- Contact the development team

---

**Feature Added**: January 3, 2025
**Version**: 1.0.0
**Author**: Claude Code Assistant
