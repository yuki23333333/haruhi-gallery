package repositories

import (
	"sos-brigade-gallery/models"
	"sos-brigade-gallery/internal"

	"gorm.io/gorm"
)

// UserRepository handles all database operations for users
type UserRepository struct {
	db *gorm.DB
}

// NewUserRepository creates a new user repository
func NewUserRepository() *UserRepository {
	return &UserRepository{
		db: internal.DB,
	}
}

// FindByID retrieves a user by ID
func (r *UserRepository) FindByID(id uint) (*models.User, error) {
	var user models.User
	err := r.db.First(&user, id).Error
	return &user, err
}

// FindByEmail retrieves a user by email
func (r *UserRepository) FindByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.db.Where("email = ?", email).First(&user).Error
	return &user, err
}

// FindByUsername retrieves a user by username
func (r *UserRepository) FindByUsername(username string) (*models.User, error) {
	var user models.User
	err := r.db.Where("username = ?", username).First(&user).Error
	return &user, err
}

// Create saves a new user to database
func (r *UserRepository) Create(user *models.User) error {
	return r.db.Create(user).Error
}

// Update updates user information
func (r *UserRepository) Update(user *models.User) error {
	return r.db.Save(user).Error
}

// FindFollowers retrieves users who follow the specified user
func (r *UserRepository) FindFollowers(userID uint) ([]models.User, error) {
	var users []models.User
	err := r.db.
		Joins("JOIN follows ON users.id = follows.follower_id").
		Where("follows.following_id = ?", userID).
		Find(&users).Error
	return users, err
}

// FindFollowing retrieves users that the specified user follows
func (r *UserRepository) FindFollowing(userID uint) ([]models.User, error) {
	var users []models.User
	err := r.db.
		Joins("JOIN follows ON users.id = follows.following_id").
		Where("follows.follower_id = ?", userID).
		Find(&users).Error
	return users, err
}

// ToggleFollow toggles a follow relationship between two users
func (r *UserRepository) ToggleFollow(followerID, followingID uint) (bool, error) {
	var follow models.Follow
	err := r.db.Where("follower_id = ? AND following_id = ?", followerID, followingID).First(&follow).Error

	if err == nil {
		// Already following, unfollow
		r.db.Delete(&follow)
		return false, nil
	}

	// Not following, follow
	follow = models.Follow{
		FollowerID:  followerID,
		FollowingID: followingID,
	}
	if err := r.db.Create(&follow).Error; err != nil {
		return false, err
	}
	return true, nil
}

// IsFollowing checks if followerID follows followingID
func (r *UserRepository) IsFollowing(followerID, followingID uint) bool {
	var count int64
	r.db.Model(&models.Follow{}).
		Where("follower_id = ? AND following_id = ?", followerID, followingID).
		Count(&count)
	return count > 0
}

// FindLikedImageIDs retrieves all image IDs liked by a user
func (r *UserRepository) FindLikedImageIDs(userID uint) (map[uint]bool, error) {
	var likes []models.UserLike
	err := r.db.Where("user_id = ?", userID).Find(&likes).Error

	if err != nil {
		return nil, err
	}

	likedIDs := make(map[uint]bool)
	for _, like := range likes {
		likedIDs[like.ImageID] = true
	}

	return likedIDs, nil
}
