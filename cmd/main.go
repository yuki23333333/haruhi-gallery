package main

import (
	"os"
	"sos-brigade-gallery/handlers"
	"sos-brigade-gallery/internal"
	"sos-brigade-gallery/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	internal.InitDB()
	// Initialize JWT secret
	internal.SetJWTSecret("")

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false,
	}))

	// API routes first (higher priority)
	api := r.Group("/api")
	{
		// Public routes
		api.POST("/register", handlers.Register)
		api.POST("/login", handlers.Login)
		api.GET("/images", handlers.GetImages)
		api.GET("/images/:id", handlers.GetImageByID)

		// User profile routes (public)
		api.GET("/users/:id", handlers.GetUserProfile)
		api.GET("/user/by-username", handlers.GetUserByUsername)
		api.GET("/users/:id/uploads", handlers.GetUserUploads)
		api.GET("/users/:id/likes", handlers.GetUserLikes)
		api.GET("/users/:id/followers", handlers.GetFollowers)
		api.GET("/users/:id/following", handlers.GetFollowing)

		// Protected routes (require authentication)
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			protected.GET("/me", handlers.GetCurrentUser)
			protected.POST("/images", handlers.UploadImage)
			protected.POST("/images/:id/like", handlers.LikeImage)
			protected.DELETE("/images/:id", handlers.DeleteImage)
			protected.PUT("/user/profile", handlers.UpdateProfile)

			// Follow routes
			protected.POST("/users/:id/follow", handlers.ToggleFollow)
			protected.GET("/users/:id/follow-status", handlers.CheckFollowStatus)
		}
	}

	// Static files for uploads
	r.Static("/uploads", "./uploads")

	// Frontend static assets
	r.Static("/assets", "./frontend/dist/assets")

	// Static files in root (PNG, images, etc.)
	r.StaticFile("/haruhi_login.png", "./frontend/dist/haruhi_login.png")
	r.StaticFile("/haruhi.png", "./frontend/dist/haruhi.png")
	r.StaticFile("/sos-logo.png", "./frontend/dist/sos-logo.png")
	r.StaticFile("/xiaoya.png", "./frontend/dist/xiaoya.png")
	r.StaticFile("/icon.png", "./frontend/dist/icon.png")
	r.StaticFile("/icon-192x192.png", "./frontend/dist/icon-192x192.png")
	r.StaticFile("/icon-512x512.png", "./frontend/dist/icon-512x512.png")
	r.StaticFile("/sw.js", "./frontend/dist/sw.js")
	r.StaticFile("/manifest.webmanifest", "./frontend/dist/manifest.webmanifest")
	r.StaticFile("/registerSW.js", "./frontend/dist/registerSW.js")
	r.StaticFile("/workbox-1d305bb8.js", "./frontend/dist/workbox-1d305bb8.js")

	// SPA fallback - serve index.html for all other routes
	r.NoRoute(func(c *gin.Context) {
		c.File("./frontend/dist/index.html")
	})

	// Get port from environment variable or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	r.Run("0.0.0.0:" + port)
}
