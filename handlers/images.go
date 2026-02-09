package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"sos-brigade-gallery/internal"
	"sos-brigade-gallery/models"
	"sos-brigade-gallery/serializers"
	"sos-brigade-gallery/repositories"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetImages retrieves a paginated list of images with optional filtering
func GetImages(c *gin.Context) {
	imageRepo := repositories.NewImageRepository()
	userRepo := repositories.NewUserRepository()

	// Parse query parameters
	category := c.Query("category")
	excludeCategory := c.Query("exclude_category")
	uploaderType := c.Query("uploader_type")
	searchQuery := c.Query("q")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	// Validate pagination
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 12
	}

	// Build query parameters
	params := repositories.FindAllParams{
		Page:            page,
		Limit:           limit,
		Category:        category,
		ExcludeCategory: excludeCategory,
		UploaderType:    uploaderType,
		SearchQuery:     searchQuery,
	}

	// Fetch images from database
	images, totalCount, err := imageRepo.FindAll(params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch images"})
		return
	}

	// Get liked images if user is authenticated
	var currentUser models.User
	likedImageIDs := make(map[uint]bool)
	if userID, exists := c.Get("user"); exists {
		currentUser = userID.(models.User)
		likedImageIDs, _ = userRepo.FindLikedImageIDs(currentUser.ID)
	}

	// Serialize images with proper uploader data
	responseImages := serializers.SerializeImages(images, likedImageIDs)

	// Calculate pagination metadata
	offset := (page - 1) * limit
	hasMore := int64(offset+len(images)) < totalCount

	c.JSON(http.StatusOK, gin.H{
		"data": responseImages,
		"meta": gin.H{
			"total":    totalCount,
			"page":     page,
			"has_more": hasMore,
		},
	})
}

// GetImageByID retrieves a single image by ID
func GetImageByID(c *gin.Context) {
	id := c.Param("id")

	// Convert image id to uint
	var imageID uint
	if _, err := fmt.Sscanf(id, "%d", &imageID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid image ID"})
		return
	}

	imageRepo := repositories.NewImageRepository()
	userRepo := repositories.NewUserRepository()

	// Fetch image from database
	image, err := imageRepo.FindByID(imageID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
		return
	}

	// Get liked status if user is authenticated
	isLiked := false
	if userID, exists := c.Get("user"); exists {
		currentUser := userID.(models.User)
		likedImageIDs, _ := userRepo.FindLikedImageIDs(currentUser.ID)
		isLiked = likedImageIDs[image.ID]
	}

	// Serialize image with proper uploader data
	responseImage := serializers.SerializeImage(*image, isLiked)

	c.JSON(http.StatusOK, gin.H{
		"data": responseImage,
	})
}

// LikeImage handles image like requests
func LikeImage(c *gin.Context) {
	id := c.Param("id")

	// Get current user from context
	currentUser, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	user := currentUser.(models.User)

	// Convert image id to uint
	var imageID uint
	if _, err := fmt.Sscanf(id, "%d", &imageID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid image ID"})
		return
	}

	imageRepo := repositories.NewImageRepository()

	// Check if already liked
	var existingLike models.UserLike
	err := internal.DB.Where("user_id = ? AND image_id = ?", user.ID, imageID).First(&existingLike).Error

	var status string // "liked" or "unliked"
	var newLikesCount int

	if err == nil {
		// Already liked - UNLIKE (toggle off)
		// Delete the like record
		if err := internal.DB.Delete(&existingLike).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove like"})
			return
		}

		// Decrement likes count
		if err := imageRepo.DecrementLikes(imageID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update likes"})
			return
		}

		status = "unliked"
	} else {
		// Not liked yet - LIKE (toggle on)
		// Create user like record
		userLike := models.UserLike{
			UserID:  user.ID,
			ImageID: imageID,
		}
		if err := internal.DB.Create(&userLike).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record like"})
			return
		}

		// Increment likes count
		if err := imageRepo.IncrementLikes(imageID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update likes"})
			return
		}

		status = "liked"
	}

	// Fetch updated likes count
	image, err := imageRepo.FindByID(imageID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated likes"})
		return
	}
	newLikesCount = image.Likes

	c.JSON(http.StatusOK, gin.H{
		"status": status,
		"likes":  newLikesCount,
	})
}

// DeleteImage handles image deletion requests
func DeleteImage(c *gin.Context) {
	// Get image ID from URL parameter
	id := c.Param("id")

	// Convert image id to uint
	var imageID uint
	if _, err := fmt.Sscanf(id, "%d", &imageID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid image ID"})
		return
	}

	// Get current user from context
	currentUser, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	user := currentUser.(models.User)

	// Fetch the image from database
	var image models.Image
	if err := internal.DB.First(&image, imageID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
		return
	}

	// Debug: Print ID comparison details
	fmt.Printf("[DEBUG] DELETE Check:\n")
	fmt.Printf("  - CurrentUserID: %v (Type: %T)\n", user.ID, user.ID)
	fmt.Printf("  - CurrentUsername: %s\n", user.Username)
	fmt.Printf("  - ImageUploaderID: %v (Type: %T)\n", image.UploaderID, image.UploaderID)
	fmt.Printf("  - ImageUploaderName: %s\n", image.UploaderName)
	if image.UploaderID != nil {
		fmt.Printf("  - ImageUploaderID (dereferenced): %v (Type: %T)\n", *image.UploaderID, *image.UploaderID)
	}

	// Permission check: Only the uploader can delete the image
	// Handle both new images (with uploader_id) and legacy images (with uploader_name only)
	hasPermission := false

	if image.UploaderID != nil {
		// New image: Compare uploader_id
		hasPermission = uint(*image.UploaderID) == uint(user.ID)
		fmt.Printf("  - Check method: uploader_id comparison\n")
		fmt.Printf("  - Are they equal? %v\n", hasPermission)
	} else {
		// Legacy image: Compare uploader_name (username match)
		hasPermission = image.UploaderName == user.Username
		fmt.Printf("  - Check method: uploader_name comparison (legacy data)\n")
		fmt.Printf("  - Username match? %v\n", hasPermission)
	}

	if !hasPermission {
		errorMsg := fmt.Sprintf("Permission denied: Current User (%s, ID: %v) is not the uploader of this image",
			user.Username, user.ID)
		fmt.Printf("[DEBUG] ❌ Permission check FAILED: %s\n", errorMsg)
		c.JSON(http.StatusForbidden, gin.H{"error": errorMsg})
		return
	}

	fmt.Printf("[DEBUG] ✅ Permission check PASSED: User %s (ID: %v) is authorized to delete image %d\n",
		user.Username, user.ID, imageID)

	// Delete the physical file from filesystem
	if image.URL != "" {
		filePath := filepath.Join(".", image.URL)
		if _, err := os.Stat(filePath); err == nil {
			// File exists, delete it
			if err := os.Remove(filePath); err != nil {
				fmt.Printf("Warning: Failed to delete file %s: %v\n", filePath, err)
				// Continue with database deletion even if file deletion fails
			} else {
				fmt.Printf("Successfully deleted file: %s\n", filePath)
			}
		}
	}

	// Delete the image record from database
	if err := internal.DB.Delete(&image).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete image from database"})
		return
	}

	// Delete associated like records
	if err := internal.DB.Where("image_id = ?", imageID).Delete(&models.UserLike{}).Error; err != nil {
		fmt.Printf("Warning: Failed to delete like records for image %d: %v\n", imageID, err)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Image deleted successfully",
		"id":      imageID,
	})
}
