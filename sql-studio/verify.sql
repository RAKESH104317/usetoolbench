USE SAP_B1_PRACTICE;
GO
CREATE TABLE #Result (DocEntry int, DocNum int, CardCode nvarchar(15), DocDate date, DocTotal decimal(19,6));
INSERT #Result EXEC dbo.GetSalesOrders @TopRows=1;
IF (SELECT COUNT(*) FROM #Result) <> 1 OR NOT EXISTS (SELECT 1 FROM #Result WHERE DocEntry=2)
    THROW 50001, 'Stored procedure returned unexpected result', 1;
SELECT TOP 1 * FROM dbo.ORDR ORDER BY DocEntry DESC;
SELECT a.DocEntry FROM dbo.ORDR a INNER JOIN dbo.ORDR b ON a.DocEntry=b.DocEntry;
SELECT a.DocEntry FROM dbo.ORDR a LEFT JOIN dbo.ORDR b ON a.DocEntry=b.DocEntry;
SELECT a.DocEntry FROM dbo.ORDR a RIGHT JOIN dbo.ORDR b ON a.DocEntry=b.DocEntry;
SELECT a.DocEntry FROM dbo.ORDR a FULL OUTER JOIN dbo.ORDR b ON a.DocEntry=b.DocEntry;
PRINT 'SQL Studio integration tests passed';
GO
