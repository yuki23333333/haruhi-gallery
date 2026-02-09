package main

import (
	"fmt"
	"sos-brigade-gallery/internal"
	"sos-brigade-gallery/models"
	"strings"
)

func main() {
	internal.InitDB()

	// 查找所有没有 uploader_id 但有 uploader_name 的图片
	var images []models.Image
	internal.DB.Where("uploader_id IS NULL AND uploader_name IS NOT NULL AND uploader_name != ''").Find(&images)

	fmt.Printf("Found %d images without uploader_id\n", len(images))

	updatedCount := 0
	for _, img := range images {
		// 根据 uploader_name 查找对应用户
		var user models.User
		err := internal.DB.Where("username = ?", img.UploaderName).First(&user).Error

		if err == nil {
			// 找到用户，更新 uploader_id
			internal.DB.Model(&img).Update("uploader_id", user.ID)
			fmt.Printf("Updated image %d: linked to user %s (ID: %d)\n", img.ID, user.Username, user.ID)
			updatedCount++
		} else {
			// 没找到用户，尝试模糊匹配
			var users []models.User
			internal.DB.Where("username LIKE ?", "%"+img.UploaderName+"%").Find(&users)

			if len(users) > 0 {
				// 使用第一个匹配的用户
				user := users[0]
				internal.DB.Model(&img).Update("uploader_id", user.ID)
				fmt.Printf("Updated image %d: fuzzy matched to user %s (ID: %d)\n", img.ID, user.Username, user.ID)
				updatedCount++
			} else {
				fmt.Printf("Skipping image %d: no user found for uploader_name '%s'\n", img.ID, img.UploaderName)
			}
		}
	}

	fmt.Printf("\nMigration complete! Updated %d images\n", updatedCount)
}
