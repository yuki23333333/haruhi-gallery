package handlers

import (
	"fmt"
	"net/http"
	"sos-brigade-gallery/internal"
	"sos-brigade-gallery/models"

	"github.com/gin-gonic/gin"
)

// ToggleFollow handles follow/unfollow requests
func ToggleFollow(c *gin.Context) {
	followingID := c.Param("id") // The user to follow/unfollow

	// Get current user from context (set by auth middleware)
	currentUser, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	user := currentUser.(models.User)

	// Convert followingID to uint
	var followingIDUint uint
	if _, err := fmt.Sscanf(followingID, "%d", &followingIDUint); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Cannot follow yourself
	if user.ID == followingIDUint {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot follow yourself"})
		return
	}

	// Check if target user exists
	var targetUser models.User
	if err := internal.DB.First(&targetUser, followingIDUint).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Check if already following
	var existingFollow models.Follow
	err := internal.DB.Where("follower_id = ? AND following_id = ?", user.ID, followingIDUint).First(&existingFollow).Error

	if err == nil {
		// Already following, so unfollow
		if err := internal.DB.Delete(&existingFollow).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unfollow"})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"following": false,
			"message":   "Successfully unfollowed",
		})
	} else {
		// Not following, so follow
		newFollow := models.Follow{
			FollowerID:  user.ID,
			FollowingID: followingIDUint,
		}
		if err := internal.DB.Create(&newFollow).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to follow"})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"following": true,
			"message":   "Successfully followed",
		})
	}
}

// GetFollowers returns list of users who follow the specified user
func GetFollowers(c *gin.Context) {
	userID := c.Param("id")

	var followers []models.User
	if err := internal.DB.Table("users").
		Joins("JOIN follows ON users.id = follows.follower_id").
		Where("follows.following_id = ?", userID).
		Find(&followers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch followers"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": followers,
	})
}

// GetFollowing returns list of users that the specified user follows
func GetFollowing(c *gin.Context) {
	userID := c.Param("id")

	var following []models.User
	if err := internal.DB.Table("users").
		Joins("JOIN follows ON users.id = follows.following_id").
		Where("follows.follower_id = ?", userID).
		Find(&following).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch following"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": following,
	})
}

// CheckFollowStatus checks if current user is following the target user
func CheckFollowStatus(c *gin.Context) {
	targetUserID := c.Param("id")

	// Get current user from context
	currentUser, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	user := currentUser.(models.User)

	var followCount int64
	internal.DB.Table("follows").
		Where("follower_id = ? AND following_id = ?", user.ID, targetUserID).
		Count(&followCount)

	c.JSON(http.StatusOK, gin.H{
		"is_following": followCount > 0,
	})
}
