package internal

import (
	"sos-brigade-gallery/models"
	"time"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	var err error
	DB, err = gorm.Open(sqlite.Open("gallery.db"), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to database")
	}

	// AutoMigrate all models
	err = DB.AutoMigrate(
		&models.Image{},
		&models.User{},
		&models.UserLike{},
		&models.Follow{},
	)
	if err != nil {
		panic("Failed to migrate database")
	}

	sqlDB, err := DB.DB()
	if err != nil {
		panic("Failed to get database instance")
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)
}
