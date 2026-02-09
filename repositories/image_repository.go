package repositories

import (
	"sos-brigade-gallery/models"
	"sos-brigade-gallery/internal"

	"gorm.io/gorm"
)

// ImageRepository handles all database operations for images
type ImageRepository struct {
	db *gorm.DB
}

// NewImageRepository creates a new image repository
func NewImageRepository() *ImageRepository {
	return &ImageRepository{
		db: internal.DB,
	}
}

// FindAllParams contains parameters for finding images
type FindAllParams struct {
	Page         int
	Limit        int
	Category     string
	ExcludeCategory string // New field to exclude a category
	UploaderType string
	SearchQuery  string
}

// FindAll retrieves images with pagination and filters
// Always preloads Uploader to get latest user data
func (r *ImageRepository) FindAll(params FindAllParams) ([]models.Image, int64, error) {
	var images []models.Image
	var totalCount int64

	query := r.db.Model(&models.Image{})

	// Apply filters - support all categories: haruhi, other, hiphop
	if params.Category != "" {
		query = query.Where("category = ?", params.Category)
	}

	// Exclude category filter (e.g., exclude hiphop to show all images except music)
	if params.ExcludeCategory != "" {
		query = query.Where("category != ?", params.ExcludeCategory)
	}

	if params.UploaderType == "official" || params.UploaderType == "community" {
		query = query.Where("uploader_type = ?", params.UploaderType)
	}

	if params.SearchQuery != "" {
		query = query.Where("title LIKE ?", "%"+params.SearchQuery+"%")
	}

	// Count total
	query.Count(&totalCount)

	// Fetch with preload
	err := query.
		Preload("Uploader").
		Order("created_at DESC").
		Limit(params.Limit).
		Offset((params.Page - 1) * params.Limit).
		Find(&images).Error

	return images, totalCount, err
}

// FindByID retrieves a single image by ID
func (r *ImageRepository) FindByID(id uint) (*models.Image, error) {
	var image models.Image
	err := r.db.Preload("Uploader").First(&image, id).Error
	return &image, err
}

// FindByUploader retrieves images uploaded by a specific user
func (r *ImageRepository) FindByUploader(userID uint, page, limit int) ([]models.Image, int64, error) {
	var images []models.Image
	var totalCount int64

	query := r.db.Model(&models.Image{}).
		Where("uploader_id = ?", userID)

	query.Count(&totalCount)

	err := query.
		Preload("Uploader").
		Order("created_at DESC").
		Limit(limit).
		Offset((page - 1) * limit).
		Find(&images).Error

	return images, totalCount, err
}

// FindLikedByUser retrieves images liked by a specific user
func (r *ImageRepository) FindLikedByUser(userID uint, page, limit int) ([]models.Image, int64, error) {
	var images []models.Image
	var totalCount int64

	// Count
	r.db.Table("user_likes").
		Joins("LEFT JOIN images ON images.id = user_likes.image_id").
		Where("user_likes.user_id = ?", userID).
		Count(&totalCount)

	// Fetch
	err := r.db.Table("user_likes").
		Select("images.*").
		Joins("LEFT JOIN images ON images.id = user_likes.image_id").
		Preload("Uploader").
		Where("user_likes.user_id = ?", userID).
		Order("user_likes.created_at DESC").
		Limit(limit).
		Offset((page - 1) * limit).
		Find(&images).Error

	return images, totalCount, err
}

// IncrementLikes increments the like count for an image
func (r *ImageRepository) IncrementLikes(id uint) error {
	return r.db.Model(&models.Image{}).
		Where("id = ?", id).
		Update("likes", gorm.Expr("likes + 1")).Error
}

// DecrementLikes decrements the like count for an image
func (r *ImageRepository) DecrementLikes(id uint) error {
	return r.db.Model(&models.Image{}).
		Where("id = ? AND likes > 0", id).
		Update("likes", gorm.Expr("likes - 1")).Error
}

// Create saves a new image to database
func (r *ImageRepository) Create(image *models.Image) error {
	return r.db.Create(image).Error
}
