package models

import (
	"time"
)

// AllowedCategories defines all allowed categories in the system
var AllowedCategories = []string{"haruhi", "other", "hiphop"}

// IsCategoryAllowed checks if a category is in the whitelist
func IsCategoryAllowed(cat string) bool {
	for _, c := range AllowedCategories {
		if c == cat {
			return true
		}
	}
	return false
}

// AdminCategories defines categories that require admin privileges
var AdminCategories = []string{}

// RequiresAdminCheck checks if a category requires admin privileges
func RequiresAdminCheck(c string) bool {
	for _, v := range AdminCategories {
		if v == c {
			return true
		}
	}
	return false
}

type Image struct {
	ID                uint      `json:"id" gorm:"primaryKey"`
	Title             string    `json:"title" gorm:"not null"`
	URL               string    `json:"url" gorm:"not null"`
	Category          string    `json:"category" gorm:"not null"`
	Description       string    `json:"description" gorm:"default:''"`
	SongTitle         string    `json:"song_title" gorm:"default:''"`
	Artist            string    `json:"artist" gorm:"default:''"`
	RedirectURL       string    `json:"redirect_url" gorm:"default:''"`
	UploaderID        *uint     `json:"uploader_id,omitempty"`
	Uploader          *User     `json:"uploader,omitempty" gorm:"foreignKey:UploaderID"`
	UploaderType      string    `json:"uploader_type" gorm:"not null"`
	UploaderName      string    `json:"uploader_name" gorm:"not null"`
	UploaderAvatarURL string    `json:"uploader_avatar_url" gorm:"default:''"`
	Likes             int       `json:"likes" gorm:"default:0"`
	CreatedAt         time.Time `json:"created_at"`
}

// UserLike tracks which images a user has liked
type UserLike struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id" gorm:"not null;uniqueIndex:idx_user_image"`
	ImageID   uint      `json:"image_id" gorm:"not null;uniqueIndex:idx_user_image"`
	CreatedAt time.Time `json:"created_at"`
}

// Follow represents a user-following-user relationship
type Follow struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	FollowerID  uint      `json:"follower_id" gorm:"not null;index"` // User who follows
	FollowingID uint      `json:"following_id" gorm:"not null;index"` // User being followed
	CreatedAt   time.Time `json:"created_at"`
}
