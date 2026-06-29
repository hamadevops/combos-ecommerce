function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Không nhận được dữ liệu POST");
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Order");
    if (!sheet) throw new Error("Không tìm thấy sheet 'Order'");

    var expectedHeaders = [
      "ID Đơn hàng", "Ngày tạo", "Mã đơn hàng", "Tên khách hàng", "Số điện thoại", 
      "Địa chỉ", "Sản phẩm", "Số lượng", "Đơn giá", "Tổng", "Trạng thái", "Ghi chú",
      "Nguồn (utm_source)", "Phương tiện (utm_medium)", "Chiến dịch (utm_campaign)", 
      "Từ khóa (utm_term)", "Nội dung (utm_content)", "Nền tảng", "Platform ID"
    ];

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(expectedHeaders);
    } else {
      var lastCol = sheet.getLastColumn();
      if (lastCol < expectedHeaders.length) {
        var missingHeaders = expectedHeaders.slice(lastCol);
        sheet.getRange(1, lastCol + 1, 1, missingHeaders.length).setValues([missingHeaders]);
      }
    }

    var contents = JSON.parse(e.postData.contents);
    var orderData = contents.data;
    var items = orderData.items || [];

    var rowsToAppend = items.map(function(item) {
      // Định dạng ngày tháng về chuỗi để tránh Sheets tự nhảy định dạng bậy
      var formattedDate = Utilities.formatDate(new Date(orderData.createdAt), "GMT+7", "dd/MM/yyyy HH:mm:ss");

      return [
        "'" + orderData.id,               // Cột 1: Đã bỏ dấu phẩy thừa
        formattedDate,                    // Cột 2
        orderData.code,                   // Cột 3
        orderData.customerName,           // Cột 4
        "'" + (orderData.customerPhone || ""), // Cột 5
        orderData.shippingAddress,        // Cột 6
        item.productName,                 // Cột 7
        item.quantity,                    // Cột 8
        item.price,                       // Cột 9
        orderData.finalAmount,            // Cột 10
        orderData.status,                 // Cột 11
        orderData.notes || "",            // Cột 12
        orderData.utmSource || "",        // Cột 13
        orderData.utmMedium || "",        // Cột 14
        orderData.utmCampaign || "",      // Cột 15
        orderData.utmTerm || "",          // Cột 16
        orderData.utmContent || "",       // Cột 17
        orderData.marketingPlatform || "",// Cột 18
        orderData.marketingPlatformId || ""// Cột 19
      ];
    });

    if (rowsToAppend.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rowsToAppend.length, rowsToAppend[0].length)
           .setValues(rowsToAppend);
    }

    return ContentService.createTextOutput("Thành công!").setMimeType(ContentService.MimeType.TEXT);
    
  } catch (f) {
    console.error("Lỗi: " + f.toString());
    return ContentService.createTextOutput("Lỗi: " + f.message).setMimeType(ContentService.MimeType.TEXT);
  }
}