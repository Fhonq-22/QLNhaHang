import { layDanhSachDatMon, layDanhSachDanhMuc, layDanhSachMonAn } from "./CONTROLLER.js";

document.querySelector(".jsFilter").addEventListener("click", function () {
    document.querySelector(".filter-menu").classList.toggle("active");
});

document.querySelector(".grid").addEventListener("click", function () {
    document.querySelector(".list").classList.remove("active");
    document.querySelector(".grid").classList.add("active");
    document.querySelector(".table-wrapper").classList.add("gridView");
    document.querySelector(".table-wrapper").classList.remove("tableView");
});

document.querySelector(".list").addEventListener("click", function () {
    document.querySelector(".list").classList.add("active");
    document.querySelector(".grid").classList.remove("active");
    document.querySelector(".table-wrapper").classList.remove("gridView");
    document.querySelector(".table-wrapper").classList.add("tableView");
});

var modeSwitch = document.querySelector('.mode-switch');
modeSwitch.addEventListener('click', function () {
    document.documentElement.classList.toggle('light');
    modeSwitch.classList.toggle('active');
});



// Khai báo biến toàn cục
const username = localStorage.getItem("username");
let dsMonAn = {};
let currentFilters = {
    kieuDat: 'Tất cả',
    trangThai: 'Tất cả'
};

// Cache DOM elements
const filterMenu = document.querySelector('.filter-menu');
const typeFilter = filterMenu.querySelector('select:nth-child(2)');
const statusFilter = filterMenu.querySelector('select:nth-child(4)');
const applyBtn = document.querySelector('.filter-button.apply');
const resetBtn = document.querySelector('.filter-button.reset');
const filterBtn = document.querySelector('.jsFilter');
const tableWrapper = document.querySelector(".table-wrapper.tableView");

// Hàm chính
async function addOrder() {
    if (!dsMonAn || Object.keys(dsMonAn).length === 0) return;

    const filteredOrders = (await layDanhSachDatMon()).filter(datMon => {
        if (datMon.MaKhach !== username) return false;

        if (currentFilters.kieuDat !== 'Tất cả') {
            const isOnline = datMon.NguoiDat === username;
            if (currentFilters.kieuDat === 'Đặt online' && !isOnline) return false;
            if (currentFilters.kieuDat === 'Đặt tại nhà hàng' && isOnline) return false;
        }

        if (currentFilters.trangThai !== 'Tất cả' &&
            datMon.TrangThai !== currentFilters.trangThai) return false;

        return true;
    });

    hienThiDonDatMon(filteredOrders);
}

// Hàm render
function hienThiDonDatMon(orders) {
    const existingRows = tableWrapper.querySelectorAll('.orders-row');
    existingRows.forEach(row => row.remove());

    orders.forEach(datmon => {
        // Tìm món có số lượng lớn nhất
        const [monIdMax] = Object.entries(datmon.DanhSachMon).reduce(
            (max, [monId, soLuong]) => soLuong > max[1] ? [monId, soLuong] : max,
            [null, 0]
        );
        if (!monIdMax) return;
        const monChinh = Object.values(dsMonAn).find(danhMuc =>
            danhMuc[monIdMax]
        )?.[monIdMax];
        if (!monChinh) {
            console.warn('Không tìm thấy món', monIdMax);
            return;
        }
        const soMonKhac = Object.keys(datmon.DanhSachMon).length - 1;
        tableWrapper.insertAdjacentHTML('beforeend', `
            <div class="orders-row" data-trangthai="${datmon.TrangThai}">
                <div class="header-cell image">
                    <img src="${monChinh.HinhAnh}" alt="${monChinh.TenMon}">
                    ${soMonKhac > 0 ? `<span>+${soMonKhac} món khác</span>` : ``}
                </div>
                <div class="header-cell order-type">
                    <span class="cell-label">Kiểu đặt:</span>
                    ${datmon.NguoiDat === username ? "Đặt online" : "Đặt tại nhà hàng"}
                </div>
                <div class="header-cell order-status">
                    <span class="cell-label">Trạng thái:</span>
                    <span class="status ${{
                            'Đang xử lý': 'dang-xu-ly',
                            'Đang chuẩn bị': 'dang-chuan-bi',
                            'Đang giao': 'dang-giao',
                            'Hoàn tất': 'hoan-tat',
                            'Hủy': 'huy'
                        }[datmon.TrangThai] || 'disabled'
                        }">
                        ${datmon.TrangThai}
                    </span>
                </div>
                <div class="header-cell order-time">
                    <span class="cell-label">Thời gian:</span>
                    ${new Date(datmon.ThoiGianDat).toLocaleString('vi-VN')}
                </div>
                <div class="header-cell order-code">
                    <span class="cell-label">Mã đặt món:</span>${datmon.MaDat}
                </div>
                <div class="header-cell order-total">
                    <span class="cell-label">Tổng tiền:</span>
                    ${datmon.TongTien?.toLocaleString('vi-VN') || '0'} VND
                </div>
            </div>
        `);
    });

    // Xử lý sự kiện mở modal
    document.querySelectorAll(".orders-row").forEach(button => {
        button.addEventListener("click", function () {
            const trangThai = this.getAttribute("data-trangthai");
            hienThiTienTrinhGiao(trangThai);
        });
    });

    // Đóng modal
    document.querySelector(".close").addEventListener("click", function () {
        document.getElementById("tracking-modal").style.display = "none";
    });

    window.addEventListener("click", function (event) {
        const modal = document.getElementById("tracking-modal");
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
}

// Sự kiện
window.addEventListener('DOMContentLoaded', async () => {
    await taiToanBoMenu();
    addOrder();
});

applyBtn.addEventListener('click', () => {
    currentFilters = {
        kieuDat: typeFilter.value,
        trangThai: statusFilter.value
    };
    addOrder();
    filterBtn.click();
});

resetBtn.addEventListener('click', () => {
    typeFilter.value = 'Tất cả';
    statusFilter.value = 'Tất cả';
    currentFilters = {
        kieuDat: 'Tất cả',
        trangThai: 'Tất cả'
    };
    addOrder();
    filterBtn.click();
});

async function taiToanBoMenu() {
    const danhSachDanhMuc = await layDanhSachDanhMuc();

    for (const danhMuc of danhSachDanhMuc) {
        const monAnTrongDanhMuc = await layDanhSachMonAn(danhMuc);
        dsMonAn[danhMuc] = {};

        monAnTrongDanhMuc.forEach(mon => {
            dsMonAn[danhMuc][mon.MaMon] = mon;
        });
    }
    console.log('Đã tải', Object.keys(dsMonAn).length, 'danh mục');
}



// Thêm biến lưu trạng thái tìm kiếm
let currentSearchTerm = '';

// Hàm tìm kiếm đơn hàng
function timKiemDonDatMon(orders, searchTerm) {
    if (!searchTerm.trim()) return orders;

    const searchLower = searchTerm.toLowerCase();
    return orders.filter(order => {
        // Tìm theo mã đơn
        if (order.MaDat.toLowerCase().includes(searchLower)) return true;

        // Tìm theo trạng thái
        if (order.ThoiGianDat.toLowerCase().includes(searchLower)) return true;

        // Tìm theo tổng tiền (nếu nhập số)
        if (!isNaN(searchTerm) && order.TongTien) {
            return order.TongTien.toString().includes(searchTerm);
        }

        return false;
    });
}

// Sự kiện tìm kiếm với debounce
let searchDebounce;
document.querySelector('.search-bar').addEventListener('input', function (e) {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
        currentSearchTerm = e.target.value;
        boLocKetHop();
    }, 300);
});

// Hàm kết hợp lọc và tìm kiếm
async function boLocKetHop() {
    if (!dsMonAn || Object.keys(dsMonAn).length === 0) return;

    // Lấy toàn bộ đơn hàng đã lọc theo bộ lọc
    let filteredOrders = (await layDanhSachDatMon()).filter(datMon => {
        if (datMon.MaKhach !== username) return false;

        if (currentFilters.kieuDat !== 'Tất cả') {
            const isOnline = datMon.NguoiDat === username;
            if (currentFilters.kieuDat === 'Đặt online' && !isOnline) return false;
            if (currentFilters.kieuDat === 'Đặt tại nhà hàng' && isOnline) return false;
        }

        if (currentFilters.trangThai !== 'Tất cả' &&
            datMon.TrangThai !== currentFilters.trangThai) return false;

        return true;
    });

    // Áp dụng tìm kiếm
    const finalOrders = timKiemDonDatMon(filteredOrders, currentSearchTerm);
    hienThiDonDatMon(finalOrders);
}

// Cập nhật các sự kiện lọc gọi boLocKetHop()
document.querySelector('.filter-button.apply').addEventListener('click', boLocKetHop);
document.querySelector('.filter-button.reset').addEventListener('click', function () {
    document.querySelectorAll('.filter-menu select').forEach(select => {
        select.selectedIndex = 0;
    });
    currentFilters = {
        kieuDat: 'Tất cả',
        trangThai: 'Tất cả'
    };
    document.querySelector('.search-bar').value = '';
    currentSearchTerm = '';
    boLocKetHop();
});

// Hàm hiển thị tiến trình giao hàng theo dạng timeline
async function hienThiTienTrinhGiao(trangThai) {
    const trackingTimeline = document.getElementById("tracking-timeline");
    const trackingMessage = document.getElementById("tracking-message");
    trackingTimeline.innerHTML = "<p>Đang tải...</p>";
    trackingMessage.innerHTML = "";

    try {
        // Danh sách trạng thái theo thứ tự
        const trangThaiSteps = [
            "Đang xử lý",
            "Đang chuẩn bị",
            "Đang giao",
            "Hoàn tất"
        ];

        // Kiểm tra nếu trạng thái không hợp lệ
        if (!trangThaiSteps.includes(trangThai)) {
            trackingTimeline.innerHTML = "<p>Trạng thái không hợp lệ</p>";
            return;
        }

        // Danh sách icon tương ứng với trạng thái
        const trangThaiIcons = {
            "Đang xử lý": "bx bx-time",          // Icon đồng hồ
            "Đang chuẩn bị": "bx bx-restaurant", // Icon nhà hàng/nấu ăn
            "Đang giao": "bx bxs-truck",          // Icon xe tải giao hàng
            "Hoàn tất": "bx bx-check-circle"     // Icon dấu tích hoàn thành
        };

        // Thông điệp tương ứng với trạng thái
        const trangThaiMessages = {
            "Đang xử lý": "Đơn đặt món của bạn đã được tiếp nhận! Chúng tôi sẽ xác nhận và xử lý trong thời gian sớm nhất.",
            "Đang chuẩn bị": "Bếp trưởng và đội ngũ đầu bếp đang tất bật chế biến món ăn cho bạn. Hãy kiên nhẫn chờ đợi một chút nhé!",
            "Đang giao": "Tài xế đang trên đường giao đơn đặt của bạn. Hãy đảm bảo điện thoại của bạn sẵn sàng để nhận hàng và chuẩn bị sẵn số tiền thanh toán nhé!",
            "Hoàn tất": "Đơn đặt món đã được giao thành công! Cảm ơn bạn đã ủng hộ. Chúc bạn có một bữa ăn ngon miệng!"
        };

        // Xác định trạng thái hiện tại
        const trangThaiIndex = trangThaiSteps.indexOf(trangThai);
        const progressWidth = trangThai === "Hoàn tất" ? 80 : (trangThaiIndex / (trangThaiSteps.length - 1)) * 100;

        // Render giao diện tiến trình với icon
        trackingTimeline.innerHTML = `
        <div class="tracking-timeline">
            <div class="progress-bar" style="width: ${progressWidth}%;"></div>
            ${trangThaiSteps
                .map(
                    (step, index) =>
                        `<div>
                            <div class="tracking-step ${index <= trangThaiIndex ? "active" : ""}">
                                <i class="${trangThaiIcons[step]}"></i>
                            </div>
                            <div class="tracking-label">${step}</div>
                        </div>`
                )
                .join("")}
        </div>
        `;
        
        // Hiển thị thông điệp phù hợp
        trackingMessage.innerHTML = trangThaiMessages[trangThai] || "Trạng thái không xác định.";

        // Hiển thị modal
        document.getElementById("tracking-modal").style.display = "flex";
    } catch (error) {
        console.error("Lỗi tải tiến trình giao hàng:", error);
        trackingTimeline.innerHTML = "<p>Lỗi tải dữ liệu.</p>";
    }
}

document.getElementById("btn-dat-mon").addEventListener("click", function () {
    window.location.href = "index.html";
});