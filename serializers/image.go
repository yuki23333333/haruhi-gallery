package serializers

import (
	"sos-brigade-gallery/internal"
	"sos-brigade-gallery/models"
)

// ImageResponse represents the image data format sent to frontend
type ImageResponse struct {
	ID                uint   `json:"id"`
	Title             string `json:"title"`
	URL               string `json:"url"`
	Category          string `json:"category"`
	UploaderID        *uint  `json:"uploader_id,omitempty"`
	UploaderType      string `json:"uploader_type"`
	UploaderName      string `json:"uploader_name"`
	UploaderAvatarURL string `json:"uploader_avatar_url"`
	Likes             int    `json:"likes"`
	CreatedAt         string `json:"created_at"`
	IsLiked           bool   `json:"is_liked,omitempty"`
	Description       string `json:"description,omitempty"`
	// Music-specific fields (for HipHop category)
	SongTitle   string `json:"song_title,omitempty"`
	Artist      string `json:"artist,omitempty"`
	RedirectURL string `json:"redirect_url,omitempty"`
}

// ImageListResponse represents paginated image list response
type ImageListResponse struct {
	Data   []ImageResponse `json:"data"`
	Total int64           `json:"total"`
	Page  int             `json:"page"`
	HasMore bool          `json:"has_more"`
}

// SerializeImages converts a slice of Image models to response format
// This centralizes the logic for handling uploader data and compatibility
func SerializeImages(images []models.Image, likedImageIDs map[uint]bool) []ImageResponse {
	response := make([]ImageResponse, len(images))

	for i, img := range images {
		response[i] = SerializeImage(img, likedImageIDs[img.ID])
	}

	return response
}

// SerializeImage converts a single Image model to response format
// Handles both new images (with uploader_id) and legacy images (without uploader_id)
func SerializeImage(img models.Image, isLiked bool) ImageResponse {
	// Handle uploader avatar URL
	avatarURL := img.UploaderAvatarURL

	if img.Uploader != nil && img.Uploader.AvatarURL != "" {
		// New image: Use avatar from preloaded User object
		avatarURL = img.Uploader.AvatarURL
	} else if img.UploaderID == nil && img.UploaderName != "" {
		// Legacy image: Try to find user by username
		var user models.User
		if err := internal.DB.Where("username = ?", img.UploaderName).First(&user).Error; err == nil {
			avatarURL = user.AvatarURL
		}
	}

	return ImageResponse{
		ID:                img.ID,
		Title:             img.Title,
		URL:               img.URL,
		Category:          img.Category,
		UploaderID:        img.UploaderID,
		UploaderType:      img.UploaderType,
		UploaderName:      img.UploaderName,
		UploaderAvatarURL: avatarURL,
		Likes:             img.Likes,
		CreatedAt:         img.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		IsLiked:           isLiked,
		Description:       img.Description,
		SongTitle:         img.SongTitle,
		Artist:            img.Artist,
		RedirectURL:       img.RedirectURL,
	}
}
