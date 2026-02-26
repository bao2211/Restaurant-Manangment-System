-- Add foreign key constraints for UserFavorites
ALTER TABLE UserFavorites ADD CONSTRAINT FK_UserFavorites_User FOREIGN KEY (UserId) REFERENCES [User](UserID) ON DELETE CASCADE;
ALTER TABLE UserFavorites ADD CONSTRAINT FK_UserFavorites_Food FOREIGN KEY (FoodId) REFERENCES [Food_Info](FoodID) ON DELETE CASCADE;
ALTER TABLE UserFavorites ADD CONSTRAINT UQ_UserFavorites_UserId_FoodId UNIQUE (UserId, FoodId);

-- Create index for performance
CREATE INDEX IX_UserFavorites_UserId ON UserFavorites(UserId);