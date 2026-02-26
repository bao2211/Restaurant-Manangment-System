-- Create UserFavorites table
CREATE TABLE UserFavorites (
    UserFavoriteId CHAR(10) NOT NULL,
    UserId CHAR(10) NOT NULL,
    FoodId CHAR(10) NOT NULL,
    CreatedTime DATETIME NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT PK_UserFavorite PRIMARY KEY (UserFavoriteId),
    CONSTRAINT FK_UserFavorites_User FOREIGN KEY (UserId) REFERENCES [[User]](UserID) ON DELETE CASCADE,
    CONSTRAINT FK_UserFavorites_Food FOREIGN KEY (FoodId) REFERENCES [Food_Info](FoodID) ON DELETE CASCADE,
    CONSTRAINT UQ_UserFavorites_UserId_FoodId UNIQUE (UserId, FoodId)
);

-- Create index for performance
CREATE INDEX IX_UserFavorites_UserId ON UserFavorites(UserId);

-- Create OrderHistory table
CREATE TABLE OrderHistory (
    OrderHistoryId CHAR(10) NOT NULL,
    UserId CHAR(10) NOT NULL,
    OrderId CHAR(10) NOT NULL,
    CreatedTime DATETIME NOT NULL DEFAULT GETUTCDATE(),
    Status NVARCHAR(20) NULL,
    Total DECIMAL(18,2) NULL,
    Note NVARCHAR(200) NULL,
    TableId CHAR(10) NULL,
    CONSTRAINT PK_OrderHistory PRIMARY KEY (OrderHistoryId),
    CONSTRAINT FK_OrderHistory_User FOREIGN KEY (UserId) REFERENCES [User](UserID) ON DELETE CASCADE,
    CONSTRAINT FK_OrderHistory_Order FOREIGN KEY (OrderId) REFERENCES [Order](OrderID) ON DELETE CASCADE,
    CONSTRAINT FK_OrderHistory_Table FOREIGN KEY (TableId) REFERENCES [Table](TableID)
);

-- Create index for performance
CREATE INDEX IX_OrderHistory_UserId ON OrderHistory(UserId);
CREATE INDEX IX_OrderHistory_OrderId ON OrderHistory(OrderId);

-- Create TableReservationHistory table  
CREATE TABLE TableReservationHistory (
    ReservationHistoryId CHAR(10) NOT NULL,
    UserId CHAR(10) NOT NULL,
    TableId CHAR(10) NOT NULL,
    ReservationDate DATETIME NOT NULL,
    ReservationTime TIME NOT NULL,
    CreatedTime DATETIME NOT NULL DEFAULT GETUTCDATE(),
    Status NVARCHAR(20) NOT NULL DEFAULT 'Pending',
    PartySize INT NOT NULL,
    Note NVARCHAR(200) NULL,
    CancelledTime DATETIME NULL,
    CONSTRAINT PK_TableReservationHistory PRIMARY KEY (ReservationHistoryId),
    CONSTRAINT FK_TableReservationHistory_User FOREIGN KEY (UserId) REFERENCES [User](UserID) ON DELETE CASCADE,
    CONSTRAINT FK_TableReservationHistory_Table FOREIGN KEY (TableId) REFERENCES [Table](TableID) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IX_TableReservationHistory_UserId ON TableReservationHistory(UserId);
CREATE INDEX IX_TableReservationHistory_TableId ON TableReservationHistory(TableId);
CREATE INDEX IX_TableReservationHistory_ReservationDate ON TableReservationHistory(ReservationDate);