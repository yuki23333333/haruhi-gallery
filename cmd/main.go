package main

import (
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
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	r.Static("/uploads", "./uploads")

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

	r.Run(":8081")
}
