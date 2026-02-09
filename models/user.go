package models

import (
	"time"
)

type User struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Username  string    `json:"username" gorm:"not null"`
	Email     string    `json:"email" gorm:"uniqueIndex;not null"`
	Password  string    `json:"-" gorm:"not null"` // "-" prevents password from being JSON serialized
	Bio       string    `json:"bio" gorm:"default:''"` // NEW: User bio field
	AvatarURL string    `json:"avatar_url" gorm:"default:''"`
	CreatedAt time.Time `json:"created_at"`
}
