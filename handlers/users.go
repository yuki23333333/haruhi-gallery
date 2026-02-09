package handlers

import (
	"net/http"
	"sos-brigade-gallery/internal"
	"sos-brigade-gallery/models"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetUserProfile retrieves a user's public profile information
func GetUserProfile(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	result := internal.DB.First(&user, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": user,
	})
}

// GetUserByUsername retrieves a user's profile by username
func GetUserByUsername(c *gin.Context) {
	username := c.Query("username")
	if username == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username is required"})
		return
	}

	var user models.User
	result := internal.DB.Where("username = ?", username).First(&user)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": user,
	})
}

// GetUserUploads retrieves images uploaded by a specific user
func GetUserUploads(c *gin.Context) {
	id := c.Param("id")

	// Verify user exists
	var user models.User
	if err := internal.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Parse pagination params
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	category := c.Query("category")           // Support category filtering
	excludeCategory := c.Query("exclude_category") // Support category exclusion

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 12
	}

	offset := (page - 1) * limit

	var images []models.Image
	var totalCount int64

	// Build base query
	baseQuery := internal.DB.Model(&models.Image{}).Where("uploader_id = ? OR (uploader_id IS NULL AND uploader_name = ?)", user.ID, user.Username)

	// Apply category filter if specified
	if category != "" {
		baseQuery = baseQuery.Where("category = ?", category)
	}

	// Apply category exclusion if specified
	if excludeCategory != "" {
		baseQuery = baseQuery.Where("category != ? OR category IS NULL", excludeCategory)
	}

	// Count total records
	baseQuery.Count(&totalCount)

	// Fetch paginated results with uploader data
	result := internal.DB.
		Preload("Uploader").
		Where("uploader_id = ? OR (uploader_id IS NULL AND uploader_name = ?)", user.ID, user.Username)

	// Apply category filter to fetch query as well
	if category != "" {
		result = result.Where("category = ?", category)
	}

	// Apply category exclusion to fetch query as well
	if excludeCategory != "" {
		result = result.Where("category != ? OR category IS NULL", excludeCategory)
	}

	result = result.
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&images)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user uploads"})
		return
	}

	// Handle uploader avatar for old images
	for i := range images {
		if images[i].Uploader != nil && images[i].Uploader.AvatarURL != "" {
			images[i].UploaderAvatarURL = images[i].Uploader.AvatarURL
		} else if images[i].UploaderID == nil && images[i].UploaderName != "" {
			// For old images without uploader_id, try to find user by username
			var user models.User
			if err := internal.DB.Where("username = ?", images[i].UploaderName).First(&user).Error; err == nil {
				images[i].UploaderID = &user.ID
				images[i].UploaderAvatarURL = user.AvatarURL
			}
		}
	}

	hasMore := int64(offset+len(images)) < totalCount

	c.JSON(http.StatusOK, gin.H{
		"data": images,
		"meta": gin.H{
			"total":    totalCount,
			"page":     page,
			"has_more": hasMore,
		},
	})
}

// GetUserLikes retrieves images liked by a specific user
func GetUserLikes(c *gin.Context) {
	id := c.Param("id")

	// Verify user exists
	var user models.User
	if err := internal.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Parse pagination params
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 12
	}

	offset := (page - 1) * limit

	var images []models.Image
	var totalCount int64

	// Count total liked images
	internal.DB.Table("user_likes").
		Joins("LEFT JOIN images ON images.id = user_likes.image_id").
		Where("user_likes.user_id = ?", id).
		Count(&totalCount)

	// Fetch paginated liked images with uploader data
	query := internal.DB.Table("user_likes").
		Select("images.*").
		Joins("LEFT JOIN images ON images.id = user_likes.image_id").
		Preload("Uploader").
		Where("user_likes.user_id = ?", id).
		Order("user_likes.created_at DESC").
		Limit(limit).
		Offset(offset)

	if err := query.Find(&images).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch liked images"})
		return
	}

	// Handle uploader avatar for old images
	for i := range images {
		if images[i].Uploader != nil && images[i].Uploader.AvatarURL != "" {
			images[i].UploaderAvatarURL = images[i].Uploader.AvatarURL
		} else if images[i].UploaderID == nil && images[i].UploaderName != "" {
			// For old images without uploader_id, try to find user by username
			var user models.User
			if err := internal.DB.Where("username = ?", images[i].UploaderName).First(&user).Error; err == nil {
				images[i].UploaderID = &user.ID
				images[i].UploaderAvatarURL = user.AvatarURL
			}
		}
	}

	hasMore := int64(offset+len(images)) < totalCount

	c.JSON(http.StatusOK, gin.H{
		"data": images,
		"meta": gin.H{
			"total":    totalCount,
			"page":     page,
			"has_more": hasMore,
		},
	})
}
