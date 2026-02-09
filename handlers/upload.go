package handlers

import (
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"sos-brigade-gallery/internal"
	"sos-brigade-gallery/models"
	"strconv"

	"time"

	"github.com/gin-gonic/gin"
)

func UploadImage(c *gin.Context) {
	title := c.PostForm("title")
	category := c.PostForm("category")
	uploaderName := c.PostForm("uploader_name")
	secretKey := c.PostForm("secret_key")
	description := c.PostForm("description")
	songTitle := c.PostForm("song_title")
	artist := c.PostForm("artist")
	redirectURL := c.PostForm("redirect_url")

	// Validate required fields based on category
	if category == "" || uploaderName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing required fields: category and uploader_name are required"})
		return
	}

	// For gallery categories, title is required
	if category == "haruhi" || category == "other" {
		if title == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing required field: title is required for gallery images"})
			return
		}
	}

	// For hiphop category, song_title and artist are required
	if category == "hiphop" {
		if songTitle == "" || artist == "" || redirectURL == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing required fields: song_title, artist, and redirect_url are required for HipHop content"})
			return
		}
	}

	// Validate category using whitelist
	if !models.IsCategoryAllowed(category) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("无效分类. 允许的分类: %v", models.AllowedCategories),
		})
		return
	}

	// Permission check: categories requiring admin privileges
	if models.RequiresAdminCheck(category) {
		var currentUser models.User
		if userID, exists := c.Get("user"); exists {
			currentUser = userID.(models.User)
			if currentUser.Username != "yuki" {
				c.JSON(http.StatusForbidden, gin.H{"error": "只有管理员可以发布此分类内容"})
				return
			}
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}
	}

	uploaderType := "community"
	if secretKey == "sos_admin" {
		uploaderType = "official"
	}

	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	filename := generateFilename(file.Filename)
	filePath := filepath.Join("uploads", filename)

	if err := saveFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	// Get current user info
	var uploaderID *uint
	var uploaderAvatarURL string
	if userID, exists := c.Get("user"); exists {
		user := userID.(models.User)
		uploaderID = &user.ID
		uploaderAvatarURL = user.AvatarURL
	}

	// Generate title for HipHop content if not provided
	finalTitle := title
	if category == "hiphop" && title == "" {
		finalTitle = fmt.Sprintf("%s - %s", songTitle, artist)
	}

	image := models.Image{
		Title:             finalTitle,
		URL:               "/uploads/" + filename,
		Category:          category,
		Description:       description,
		SongTitle:         songTitle,
		Artist:            artist,
		RedirectURL:       redirectURL,
		UploaderID:        uploaderID,
		UploaderType:      uploaderType,
		UploaderName:      uploaderName,
		UploaderAvatarURL: uploaderAvatarURL,
		CreatedAt:         time.Now(),
	}

	if result := internal.DB.Create(&image); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save to database"})
		return
	}

	c.JSON(http.StatusCreated, image)
}

func generateFilename(originalFilename string) string {
	ext := filepath.Ext(originalFilename)
	timestamp := strconv.FormatInt(time.Now().UnixNano(), 10)
	randomStr := strconv.FormatInt(time.Now().Unix(), 10)
	return "img_" + randomStr + "_" + timestamp + ext
}

func saveFile(file *multipart.FileHeader, dst string) error {
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
