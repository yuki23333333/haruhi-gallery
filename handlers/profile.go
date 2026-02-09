package handlers

import (
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"sos-brigade-gallery/internal"
	"sos-brigade-gallery/models"
	"time"

	"github.com/gin-gonic/gin"
)

// UpdateProfile handles profile updates including avatar upload
func UpdateProfile(c *gin.Context) {
	// Get current user from context
	currentUser, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	contextUser := currentUser.(models.User)

	// Fetch fresh user data from database
	var user models.User
	if err := internal.DB.First(&user, contextUser.ID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Parse multipart form
	if err := c.Request.ParseMultipartForm(10 << 20); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form"})
		return
	}

	username := c.PostForm("username")
	bio := c.PostForm("bio") // Get bio field from form

	// Validate username
	if username == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username is required"})
		return
	}

	// Handle avatar file upload if present
	var avatarURL string
	if file, err := c.FormFile("avatar"); err == nil {
		// Validate file size (max 5MB)
		if file.Size > 5*1024*1024 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Avatar file size must be less than 5MB"})
			return
		}

		// Generate unique filename
		ext := filepath.Ext(file.Filename)
		timestamp := strconv.FormatInt(time.Now().UnixNano(), 10)
		filename := "avatar_" + strconv.Itoa(int(user.ID)) + "_" + timestamp + ext
		filePath := filepath.Join("uploads", filename)

		// Save file
		if err := saveAvatarFile(file, filePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save avatar"})
			return
		}

		avatarURL = "/uploads/" + filename

		// Delete old avatar if it exists
		if user.AvatarURL != "" && user.AvatarURL != "/uploads/default-avatar.png" {
			oldPath := filepath.Join(".", user.AvatarURL)
			if _, err := os.Stat(oldPath); err == nil {
				os.Remove(oldPath)
			}
		}
	} else {
		avatarURL = user.AvatarURL
	}

	// Update user fields
	user.Username = username
	user.Bio = bio
	user.AvatarURL = avatarURL

	// Save to database
	if err := internal.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile in database"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Profile updated successfully",
		"user":    user,
	})
}

func saveAvatarFile(file *multipart.FileHeader, dst string) error {
	src, err := file.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	if err := os.MkdirAll(filepath.Dir(dst), 0755); err != nil {
		return err
	}

	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, src)
	return err
}
