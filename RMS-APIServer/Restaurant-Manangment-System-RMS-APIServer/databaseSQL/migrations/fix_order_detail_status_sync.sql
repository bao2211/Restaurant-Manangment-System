SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateOrderStatus]
    @OrderID CHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @NormalizedOrderID CHAR(10) = CAST(LEFT(LTRIM(RTRIM(@OrderID)) + REPLICATE(' ', 10), 10) AS CHAR(10));

    IF NOT EXISTS (SELECT 1 FROM [dbo].[Order_Detail] WHERE OrderID = @NormalizedOrderID)
    BEGIN
        UPDATE [dbo].[Order]
        SET Status = N'Chưa làm',
            Total = 0
        WHERE OrderID = @NormalizedOrderID;

        RETURN;
    END;

    ;WITH DetailState AS
    (
        SELECT
            od.OrderID,
            SUM(COALESCE(od.UnitPrice, fi.UnitPrice, 0) * COALESCE(od.Quantity, 0)) AS TotalAmount,
            MIN(CASE WHEN LTRIM(RTRIM(COALESCE(od.Status, N'Chưa làm'))) = N'Hoàn tất' THEN 1 ELSE 0 END) AS AllCompleted,
            MAX(CASE WHEN LTRIM(RTRIM(COALESCE(od.Status, N'Chưa làm'))) IN (N'Đang xử lý', N'Hoàn tất') THEN 1 ELSE 0 END) AS AnyInProgressOrCompleted
        FROM [dbo].[Order_Detail] od
        LEFT JOIN [dbo].[Food_Info] fi ON fi.FoodID = od.FoodID
        WHERE od.OrderID = @NormalizedOrderID
        GROUP BY od.OrderID
    )
    UPDATE o
    SET
        o.Total = ds.TotalAmount,
        o.Status = CASE
            WHEN ds.AllCompleted = 1 THEN N'Hoàn tất'
            WHEN ds.AnyInProgressOrCompleted = 1 THEN N'Đang xử lý'
            ELSE N'Chưa làm'
        END
    FROM [dbo].[Order] o
    INNER JOIN DetailState ds ON ds.OrderID = o.OrderID;
END;
GO

CREATE OR ALTER TRIGGER [dbo].[TR_C_Order_Detail_UpdateStatus]
ON [dbo].[Order_Detail]
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @OrderIds TABLE (OrderID CHAR(10) PRIMARY KEY);

    INSERT INTO @OrderIds (OrderID)
    SELECT DISTINCT CAST(LEFT(LTRIM(RTRIM(OrderID)) + REPLICATE(' ', 10), 10) AS CHAR(10))
    FROM inserted
    WHERE OrderID IS NOT NULL;

    INSERT INTO @OrderIds (OrderID)
    SELECT DISTINCT CAST(LEFT(LTRIM(RTRIM(OrderID)) + REPLICATE(' ', 10), 10) AS CHAR(10))
    FROM deleted
    WHERE OrderID IS NOT NULL
      AND NOT EXISTS (
          SELECT 1
          FROM @OrderIds ids
          WHERE ids.OrderID = CAST(LEFT(LTRIM(RTRIM(deleted.OrderID)) + REPLICATE(' ', 10), 10) AS CHAR(10))
      );

    DECLARE @CurrentOrderID CHAR(10);

    DECLARE order_cursor CURSOR LOCAL FAST_FORWARD FOR
        SELECT OrderID FROM @OrderIds;

    OPEN order_cursor;
    FETCH NEXT FROM order_cursor INTO @CurrentOrderID;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        EXEC [dbo].[sp_UpdateOrderStatus] @CurrentOrderID;
        FETCH NEXT FROM order_cursor INTO @CurrentOrderID;
    END;

    CLOSE order_cursor;
    DEALLOCATE order_cursor;
END;
GO