package internal

import (
	"database/sql"
	"os"
	"sos-brigade-gallery/models"
	"time"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	_ "modernc.org/sqlite" // Pure Go SQLite driver (no CGO required)
)

var DB *gorm.DB

func InitDB() {
	var err error

	// Get database path from environment variable or use default
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "gallery.db"
	}

	// Use database/sql with modernc.org/sqlite, then pass to GORM
	sqlDB, err := sql.Open("sqlite", dbPath)
	if err != nil {
		panic("Failed to open database: " + err.Error())
	}

	// Test connection
	if err = sqlDB.Ping(); err != nil {
		panic("Failed to connect to database: " + err.Error())
	}

	// Create GORM DB from the sql.DB
	DB, err = gorm.Open(sqlite.Dialector{
		Conn: sqlDB,
	}, &gorm.Config{})
	if err != nil {
		panic("Failed to create GORM instance: " + err.Error())
	}

	// AutoMigrate all models
	err = DB.AutoMigrate(
		&models.Image{},
		&models.User{},
		&models.UserLike{},
		&models.Follow{},
	)
	if err != nil {
		panic("Failed to migrate database: " + err.Error())
	}

	// Configure connection pool
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)
}
