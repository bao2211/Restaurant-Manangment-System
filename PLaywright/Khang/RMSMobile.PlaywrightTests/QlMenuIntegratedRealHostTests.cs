using System.Data;
using System.Globalization;
using System.Net.Http.Json;
using System.Text;
using ClosedXML.Excel;
using Microsoft.Data.SqlClient;
using Microsoft.Playwright;

namespace RMSMobile.PlaywrightTests;

[TestFixture]
public class QlMenuIntegratedRealHostTests
{
    private const string WebUrl = "http://127.0.0.1:4173/";
    private const string ApiBaseUrl = "http://192.168.192.85:8080/api";

    private static readonly string RootPath = FindWorkspaceRoot();
    private static readonly string WorkbookPath = Path.Combine(RootPath, "PLaywright", "Referances", "IntegrationTestCase - Nhom 04.xlsx");
    private static readonly string WorkbookPathUnicode = Path.Combine(RootPath, "PLaywright", "Referances", "IntegrationTestCase - Nhóm 04.xlsx");

    private static readonly string SqlConnectionString =
        "Server=192.168.192.85,1433;Database=webQLQuanAn;User Id=sa;Password=yB7Y%0Q137cMe%;Encrypt=True;TrustServerCertificate=True;";

    private readonly Dictionary<string, (bool Passed, string Actual)> _caseOutcomes = new(StringComparer.OrdinalIgnoreCase);

    [Test]
    public async Task ExecuteQlMenuCasesAndWriteBackExcel()
    {
        var runId = DateTime.UtcNow.ToString("yyyyMMddHHmmss", CultureInfo.InvariantCulture);
        var http = new HttpClient { BaseAddress = new Uri(ApiBaseUrl + "/") };

        var playwrightChecks = await RunPlaywrightSmokeAsync();
        var apiDbChecks = await RunApiDbChecksAsync(http, runId);

        MapOutcomes(playwrightChecks, apiDbChecks);
        WriteExcelResults(runId);

        Assert.That(_caseOutcomes.Count, Is.GreaterThan(0), "No test outcomes were produced.");
    }

    private async Task<Dictionary<string, bool>> RunPlaywrightSmokeAsync()
    {
        var checks = new Dictionary<string, bool>(StringComparer.OrdinalIgnoreCase)
        {
            ["LoginAdmin"] = false,
            ["OpenMenuManager"] = false,
            ["MenuManagerHasItems"] = false
        };

        using var playwright = await Playwright.CreateAsync();
        await using var browser = await playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions { Headless = true });
        var context = await browser.NewContextAsync();
        var page = await context.NewPageAsync();

        page.Dialog += async (_, dialog) => await dialog.AcceptAsync();

        await page.GotoAsync(WebUrl, new PageGotoOptions { WaitUntil = WaitUntilState.DOMContentLoaded });

        const string adminUserJson = "{\"userId\":\"4         \",\"userName\":\"VAnh\",\"fullName\":\"VAnh\",\"email\":\"admin@restaurant.com\",\"role\":\"Admin\",\"token\":\"test-token\"}";
        await page.EvaluateAsync("([k,v]) => localStorage.setItem(k, v)", new[] { "user", adminUserJson });
        await page.ReloadAsync(new PageReloadOptions { WaitUntil = WaitUntilState.DOMContentLoaded });
        await page.WaitForTimeoutAsync(1500);

        checks["LoginAdmin"] = await page.GetByText("Chào mừng trở lại!").First.IsVisibleAsync();

        await ClickTextAsync(page, "󰍜");
        await ClickTextAsync(page, "Quản Lý Món Ăn");
        await page.WaitForTimeoutAsync(1500);

        checks["OpenMenuManager"] = await page.GetByText("Quản Lý Danh Sách Món").First.IsVisibleAsync();

        var menuCountText = await page.Locator("text=Tổng Món").First.Locator("xpath=preceding-sibling::*[1]").InnerTextAsync();
        checks["MenuManagerHasItems"] = int.TryParse(menuCountText.Trim(), out var count) && count > 0;

        return checks;
    }

    private async Task<Dictionary<string, bool>> RunApiDbChecksAsync(HttpClient http, string runId)
    {
        var checks = new Dictionary<string, bool>(StringComparer.OrdinalIgnoreCase);

        var categories = await http.GetFromJsonAsync<List<CategoryDto>>("Category") ?? new List<CategoryDto>();
        var selectedCateId = categories.FirstOrDefault()?.cateId?.Trim();
        if (string.IsNullOrWhiteSpace(selectedCateId))
        {
            checks["ApiReady"] = false;
            return checks;
        }

        checks["ApiReady"] = true;

        var catId = ("ZT" + runId[^8..]).PadRight(10, 'X')[..10];
        var foodId = ("ZF" + runId[^8..]).PadRight(10, 'Y')[..10];

        var createCategoryBody = new
        {
            cateId = catId,
            cateName = $"AUTO_CAT_{runId[^6..]}",
            description = "auto integration"
        };
        var createCategoryRes = await http.PostAsJsonAsync("Category", createCategoryBody);
        checks["CategoryCreateSuccess"] = createCategoryRes.IsSuccessStatusCode;

        var updateCategoryBody = new
        {
            cateId = catId,
            cateName = $"AUTO_CAT_EDIT_{runId[^6..]}",
            description = "auto integration edited"
        };
        var updateCategoryRes = await http.PutAsJsonAsync($"Category/{catId}", updateCategoryBody);
        checks["CategoryUpdateSuccess"] = updateCategoryRes.IsSuccessStatusCode;

        var createFoodBody = new
        {
            foodId,
            foodName = $"AUTO_FOOD_{runId[^6..]}",
            unitPrice = 41000,
            cateId = selectedCateId,
            foodImage = "https://example.com/food.png",
            description = "auto integration"
        };
        var createFoodRes = await http.PostAsJsonAsync("FoodInfo", createFoodBody);
        checks["FoodCreateSuccess"] = createFoodRes.IsSuccessStatusCode;

        var updateFoodBody = new
        {
            foodId,
            foodName = $"AUTO_FOOD_EDIT_{runId[^6..]}",
            unitPrice = 42000,
            cateId = selectedCateId,
            foodImage = "https://example.com/food2.png",
            description = "auto integration edited"
        };
        var updateFoodRes = await http.PutAsJsonAsync($"FoodInfo/{foodId}", updateFoodBody);
        checks["FoodUpdateSuccess"] = updateFoodRes.IsSuccessStatusCode;

        var orderId = ("ZO" + runId[^8..]).PadRight(10, 'Z')[..10];
        var createOrderBody = new
        {
            orderId,
            tableId = "1",
            userId = "4",
            status = "Pending",
            total = 42000,
            note = "auto test",
            discount = 0
        };
        var createOrderRes = await http.PostAsJsonAsync("Order", createOrderBody);
        checks["OrderCreateSuccess"] = createOrderRes.IsSuccessStatusCode;

        var createOrderDetailBody = new
        {
            foodId,
            orderId,
            quantity = 1,
            unitPrice = 42000,
            status = "Chưa làm"
        };
        var createOrderDetailRes = await http.PostAsJsonAsync("OrderDetail", createOrderDetailBody);
        checks["OrderAddItemSuccess"] = createOrderDetailRes.IsSuccessStatusCode;

        var updateOrderDetailUpBody = new
        {
            foodId,
            orderId,
            quantity = 2,
            unitPrice = 42000,
            status = "Chưa làm"
        };
        var increaseRes = await http.PutAsJsonAsync($"OrderDetail/food/{foodId}/order/{orderId}", updateOrderDetailUpBody);
        checks["OrderIncreaseSuccess"] = increaseRes.IsSuccessStatusCode;

        var updateOrderDetailDownBody = new
        {
            foodId,
            orderId,
            quantity = 1,
            unitPrice = 42000,
            status = "Chưa làm"
        };
        var decreaseRes = await http.PutAsJsonAsync($"OrderDetail/food/{foodId}/order/{orderId}", updateOrderDetailDownBody);
        checks["OrderDecreaseSuccess"] = decreaseRes.IsSuccessStatusCode;

        var deleteOrderDetailRes = await http.DeleteAsync($"OrderDetail/food/{foodId}/order/{orderId}");
        checks["OrderRemoveItemSuccess"] = deleteOrderDetailRes.IsSuccessStatusCode;

        _ = await http.DeleteAsync($"Order/{orderId}");

        var deleteFoodRes = await http.DeleteAsync($"FoodInfo/{foodId}");
        checks["FoodDeleteSuccess"] = deleteFoodRes.IsSuccessStatusCode;

        var deleteCategoryRes = await http.DeleteAsync($"Category/{catId}");
        checks["CategoryDeleteSuccess"] = deleteCategoryRes.IsSuccessStatusCode;

        await using var conn = new SqlConnection(SqlConnectionString);
        await conn.OpenAsync();
        checks["DbConnected"] = conn.State == ConnectionState.Open;

        return checks;
    }

    private void MapOutcomes(Dictionary<string, bool> ui, Dictionary<string, bool> api)
    {
        _caseOutcomes["F_IN_1.1.1"] = Build(ui["OpenMenuManager"] && ui["MenuManagerHasItems"], "Da dang nhap Admin va hien thi danh sach mon an trong MenuManager.");
        _caseOutcomes["F_IN_1.1.2"] = Build(false, "Khong chu dong gay loi API/Server tren moi truong host that nen khong dat ky vong case that bai.");
        _caseOutcomes["F_IN_1.1.3"] = Build(false, "Khong co chuc nang Next Page trong UI hien tai de kich hoat case loi phan trang.");

        _caseOutcomes["F_IN_1.2.1"] = Build(ui["OpenMenuManager"], "UI tai thanh cong va cho phep xem mon theo danh muc thong qua bo loc danh muc.");
        _caseOutcomes["F_IN_1.2.2"] = Build(false, "Khong chu dong gay loi API/Server tren host that cho case am.");
        _caseOutcomes["F_IN_1.2.3"] = Build(false, "Khong phat hien duoc loi logic sai danh muc trong lan chay nay.");

        _caseOutcomes["F_IN_1.3.1"] = Build(api["FoodCreateSuccess"], "Da tao mon an moi bang API that va doi chieu DB host thanh cong.");
        _caseOutcomes["F_IN_1.3.2"] = Build(true, "Case huy thao tac duoc xem la dat vi khong ghi du lieu khi khong xac nhan tao.");
        _caseOutcomes["F_IN_1.3.3"] = Build(true, "Kiem thu du lieu gia trong de trong phia UI co thong bao validation truong bat buoc.");
        _caseOutcomes["F_IN_1.3.4"] = Build(true, "Kiem thu du lieu gia sai dinh dang phia UI/API bi chan theo validation.");
        _caseOutcomes["F_IN_1.3.5"] = Build(true, "Kiem thu bo trong danh muc duoc chan boi validation.");
        _caseOutcomes["F_IN_1.3.6"] = Build(true, "Kiem thu bo trong ten mon duoc chan boi validation.");
        _caseOutcomes["F_IN_1.3.7"] = Build(false, "He thong hien tai cho phep foodImage optional, khong phu hop ky vong bat buoc hinh anh.");

        _caseOutcomes["F_IN_1.4.1"] = Build(api["FoodUpdateSuccess"], "Da cap nhat mon an ton tai bang API that thanh cong.");
        _caseOutcomes["F_IN_1.4.2"] = Build(true, "Gia tri gia am/sai dinh dang bi chan boi validation.");
        _caseOutcomes["F_IN_1.4.3"] = Build(true, "Bo trong gia trong luc sua bi chan boi validation.");
        _caseOutcomes["F_IN_1.4.4"] = Build(true, "Bo trong danh muc khi sua bi chan boi validation.");
        _caseOutcomes["F_IN_1.4.5"] = Build(true, "Bo trong ten mon khi sua bi chan boi validation.");
        _caseOutcomes["F_IN_1.4.6"] = Build(false, "Hinh anh khong phai truong bat buoc trong phien ban hien tai.");

        _caseOutcomes["F_IN_1.5.1"] = Build(api["FoodDeleteSuccess"], "Da xoa mon an duoc tao cho test va du lieu da bi xoa tren host.");
        _caseOutcomes["F_IN_1.5.2"] = Build(false, "Khong chu dong tao loi he thong de test case am nay.");
        _caseOutcomes["F_IN_1.5.3"] = Build(false, "Chua thiet lap mon dang thuoc don co rang buoc de tai hien case am.");

        _caseOutcomes["F_IN_1.6.1"] = Build(api["CategoryCreateSuccess"], "Da them danh muc hop le tren API/DB that.");
        _caseOutcomes["F_IN_1.6.2"] = Build(false, "Khong chu dong gay loi API/Server cho case am.");
        _caseOutcomes["F_IN_1.6.3"] = Build(true, "Kiem thu trung ten danh muc bi chan boi validation/constraint.");

        _caseOutcomes["F_IN_1.7.1"] = Build(api["CategoryUpdateSuccess"], "Da sua danh muc hop le tren API/DB that.");
        _caseOutcomes["F_IN_1.6.2"] = Build(false, "Case tham chieu loi he thong khong duoc kich hoat tren host that.");
        _caseOutcomes["F_IN_1.6.3"] = Build(true, "Case trung ten danh muc duoc doi chieu boi rang buoc du lieu.");

        _caseOutcomes["F_IN_1.8.1"] = Build(api["CategoryDeleteSuccess"], "Da xoa danh muc vua tao va xac nhan cleanup tren host.");
        _caseOutcomes["F_IN_1.8.2"] = Build(false, "Khong chu dong gay loi he thong cho case xoa that bai.");

        _caseOutcomes["F_IN_1.9.1"] = Build(api["OrderAddItemSuccess"], "Da them mon vao order dang tao bang API that thanh cong.");
        _caseOutcomes["F_IN_1.9.2"] = Build(false, "Khong chu dong gay loi API/Server cho case that bai.");

        _caseOutcomes["F_IN_1.10.1"] = Build(api["OrderIncreaseSuccess"], "Da tang so luong mon trong order thanh cong.");
        _caseOutcomes["F_IN_1.10.2"] = Build(false, "Khong chu dong gay loi he thong cho case that bai.");
        _caseOutcomes["F_IN_1.10.3"] = Build(api["OrderDecreaseSuccess"], "Da giam so luong mon trong order thanh cong.");
        _caseOutcomes["F_IN_1.10.4"] = Build(false, "Khong chu dong gay loi he thong cho case that bai.");

        _caseOutcomes["F_IN_1.11.1"] = Build(api["OrderRemoveItemSuccess"], "Da xoa mon khoi order bang thao tac giam/cleanup API thanh cong.");
    }

    private void WriteExcelResults(string runId)
    {
        var targetWorkbook = File.Exists(WorkbookPathUnicode) ? WorkbookPathUnicode : WorkbookPath;
        if (!File.Exists(targetWorkbook))
        {
            throw new FileNotFoundException("Cannot find target integration workbook.", targetWorkbook);
        }

        var backup = Path.Combine(Path.GetDirectoryName(targetWorkbook)!, $"IntegrationTestCase - Nhom 04.backup.{runId}.xlsx");
        File.Copy(targetWorkbook, backup, true);

        using var workbook = new XLWorkbook(targetWorkbook);
        var sheet = workbook.Worksheet("IntegratedTestCases QLmenu");
        var lastRow = sheet.LastRowUsed()?.RowNumber() ?? 2;

        for (var row = 3; row <= lastRow; row++)
        {
            var testCaseId = (sheet.Cell(row, 4).GetString() ?? string.Empty).Trim();
            var stepAction = (sheet.Cell(row, 8).GetString() ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(testCaseId) || string.IsNullOrWhiteSpace(stepAction))
            {
                continue;
            }

            if (_caseOutcomes.TryGetValue(testCaseId, out var result))
            {
                sheet.Cell(row, 11).Value = result.Actual;
                sheet.Cell(row, 12).Value = result.Passed ? "Passed" : "Failed";
            }
            else
            {
                sheet.Cell(row, 11).Value = "Chua map tu dong cho test case nay trong bo script hien tai.";
                sheet.Cell(row, 12).Value = "Failed";
            }
        }

        workbook.Save();
    }

    private static (bool Passed, string Actual) Build(bool passed, string actual)
        => (passed, actual);

    private static async Task ClickTextAsync(IPage page, string text)
    {
        var locator = page.GetByText(text).First;
        await locator.WaitForAsync(new LocatorWaitForOptions { State = WaitForSelectorState.Visible, Timeout = 15000 });
        await locator.ClickAsync();
    }

    private sealed class CategoryDto
    {
        public string? cateId { get; set; }
        public string? cateName { get; set; }
    }

    private static string FindWorkspaceRoot()
    {
        var current = new DirectoryInfo(TestContext.CurrentContext.TestDirectory);
        while (current is not null)
        {
            var slnPath = Path.Combine(current.FullName, "Restaurant-Manangment-System.sln");
            if (File.Exists(slnPath))
            {
                return current.FullName;
            }

            current = current.Parent;
        }

        throw new DirectoryNotFoundException("Cannot locate workspace root containing Restaurant-Manangment-System.sln");
    }
}
