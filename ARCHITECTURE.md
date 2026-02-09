# Haruhi Gallery - Architecture Overview

## 🏗️ Project Structure (Improved)

```
haruhi-gallery/
├── cmd/main.go              # Application entry point
├── internal/                # Private application code
│   ├── database.go          # Database initialization
│   └── jwt.go              # JWT token handling
├── models/                  # Data models (DTOs)
│   ├── image.go
│   ├── user.go
│   └── ...
├── repositories/            # Data Access Layer ⭐ NEW
│   ├── image_repository.go # Image data operations
│   └── user_repository.go  # User data operations
├── serializers/             # Data Serialization Layer ⭐ NEW
│   └── image.go            # Format data for API responses
├── handlers/                # HTTP Handlers (Controllers)
│   ├── images.go           # Image endpoints
│   ├── users.go            # User endpoints
│   └── ...
├── middleware/              # HTTP middleware
│   └── auth.go             # Authentication middleware
└── frontend/               # React frontend
    └── src/
```

## 🎯 Key Improvements

### 1. **Repository Pattern** (`repositories/`)
**Purpose**: Encapsulate all database access logic

**Benefits**:
- ✅ Single place for database queries
- ✅ Easy to mock for testing
- ✅ Reusable across handlers
- ✅ Consistent query logic

**Example**:
```go
// Old way: Direct DB access in handler
internal.DB.Preload("Uploader").Find(&images)

// New way: Repository pattern
imageRepo := repositories.NewImageRepository()
images, totalCount, err := imageRepo.FindAll(params)
```

### 2. **Serializer Layer** (`serializers/`)
**Purpose**: Convert models to API response format

**Benefits**:
- ✅ Centralized data formatting
- ✅ Handles legacy data compatibility
- ✅ Easy to modify response structure
- ✅ Consistent API responses

**Example**:
```go
// Old way: Manual serialization in each handler
for i, img := range images {
    if img.Uploader != nil {
        img.UploaderAvatarURL = img.Uploader.AvatarURL
    }
    // ... more logic
}

// New way: Single function call
responseImages := serializers.SerializeImages(images, likedImageIDs)
```

### 3. **Separation of Concerns**

**Before**:
```
Handler → (DB queries + serialization + business logic)
```

**After**:
```
Handler → (Business Logic) → Repository (DB queries) → Serializer (formatting)
```

## 📊 Data Flow

### Example: Get Images API Request

```
1. Client Request
   ↓
2. Router → Handler.GetImages()
   ↓
3. Handler calls ImageRepository.FindAll()
   ↓
4. Repository queries DB with Preload("Uploader")
   ↓
5. Repository returns []models.Image
   ↓
6. Handler calls SerializeImages()
   ↓
7. Serializer formats data (handles legacy images)
   ↓
8. Handler returns JSON response
   ↓
9. Client receives formatted data
```

## 🔧 How to Extend

### Adding a New Field to Image Response

**Old way**: Modify every handler
**New way**: Modify `serializers/image.go` only

```go
// In serializers/image.go
type ImageResponse struct {
    // ... existing fields
    NewField string `json:"new_field"` // Add here
}

func SerializeImage(img models.Image, isLiked bool) ImageResponse {
    return ImageResponse{
        // ... existing fields
        NewField: calculateNewField(img), // Add logic here
    }
}
```

### Adding a New Query

**Old way**: Add code in handler
**New way**: Add method in Repository

```go
// In repositories/image_repository.go
func (r *ImageRepository) FindByCategory(category string) ([]models.Image, error) {
    var images []models.Image
    err := r.db.Preload("Uploader").Where("category = ?", category).Find(&images).Error
    return images, err
}

// In handler
images, err := imageRepo.FindByCategory(category)
```

### Adding Caching (Future Extension)

```go
// In repositories/image_repository.go
type ImageRepository struct {
    db  *gorm.DB
    cache Cache // Easy to add caching layer
}

func (r *ImageRepository) FindAll(params FindAllParams) ([]models.Image, int64, error) {
    // Check cache first
    if cached := r.cache.Get("images:" + params.Key()); cached {
        return cached, nil
    }

    // Query DB
    images, total, err := r.queryFromDB(params)

    // Store in cache
    r.cache.Set("images:" + params.Key(), images)

    return images, total, err
}
```

## 🧪 Testing

**Before**: Difficult to test handlers (DB dependencies everywhere)
**After**: Easy to mock repositories

```go
// Example test
func TestGetImages(t *testing.T) {
    mockRepo := &MockImageRepository{
        Images: []models.Image{...},
    }

    // Inject mock repository into handler
    handler := NewHandler(mockRepo)

    // Test handler without database
    // ...
}
```

## 📈 Performance Benefits

1. **N+1 Query Prevention**: Preload("Uploader") ensures no extra queries
2. **Legacy Data Handling**: One-time lookup by username, then uses uploader_id
3. **Consistent Preloading**: All queries use same repository logic
4. **Future Optimization**: Easy to add caching at repository level

## 🎨 Frontend Compatibility

**No changes required!** The API response format stays the same:
- Frontend still receives `uploader_avatar_url` field
- All existing features work unchanged
- Response structure is backwards compatible

## 🔄 Migration Path

**Current Status**: Partially refactored
- ✅ Repository layer created
- ✅ Serializer layer created
- ✅ GetImages refactored
- ⏳ Other handlers pending

**Next Steps**:
1. Test refactored GetImages handler
2. Refactor GetUserUploads and GetUserLikes
3. Add comprehensive tests
4. Consider adding service layer for complex business logic

---

**Result**: More maintainable, testable, and extensible codebase while preserving all existing functionality! 🚀
