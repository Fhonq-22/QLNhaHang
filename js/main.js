import { database } from "./firebase-config.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const danhSachMonAn = document.getElementById("danh-sach-mon-an");
const chonDanhMuc = document.getElementById("chon-danh-muc");
const timKiem = document.getElementById("tim-kiem");
const btnGioHang = document.getElementById("btn-gio-hang");
const soLuongGioHang = document.getElementById("so-luong-gio-hang");
const overlay = document.getElementById("overlay");
const gioHangPopup = document.getElementById("gio-hang-popup");
const btnDongGioHang = document.getElementById("dong-gio-hang");

// Lấy giỏ hàng từ localStorage
let gioHang = JSON.parse(localStorage.getItem("gioHang")) || {};

// Lưu giỏ hàng vào localStorage
function luuGioHang() {
    localStorage.setItem("gioHang", JSON.stringify(gioHang));
    capNhatSoLuongGioHang();
}

// Cập nhật số lượng trên biểu tượng giỏ hàng
function capNhatSoLuongGioHang() {
    const tongSoLuong = Object.values(gioHang).reduce((acc, sl) => acc + sl, 0);
    soLuongGioHang.textContent = tongSoLuong;
}

// Thêm món vào giỏ hàng
function themVaoGioHang(maMon) {
    gioHang[maMon] = (gioHang[maMon] || 0) + 1;
    luuGioHang();
    //alert("Đã thêm vào giỏ hàng! 🛒");
}

// Hiển thị giỏ hàng
function hienThiGioHang() {
    // Cập nhật danh sách giỏ hàng ở cả danh sách nhỏ và popup
    const gioHangChiTiet = document.getElementById("gio-hang-chi-tiet");
    
    if (Object.keys(gioHang).length === 0) {
        gioHangChiTiet.innerHTML = "<li>Giỏ hàng trống</li>";
    } else {
        const danhSachHTML = Object.keys(gioHang).map(maMon => `
            <li>
                <span>${maMon} (x${gioHang[maMon]})</span>
                <button class="xoa-mon" data-mamon="${maMon}">❌</button>
            </li>
        `).join("");
        gioHangChiTiet.innerHTML = danhSachHTML;
    }

    document.querySelectorAll(".xoa-mon").forEach(button => {
        button.addEventListener("click", (e) => {
            delete gioHang[e.target.getAttribute("data-mamon")];
            luuGioHang();
            hienThiGioHang();
        });
    });
}
btnGioHang.addEventListener("click", () => {
    console.log("Mở giỏ hàng");
    hienThiGioHang();
    gioHangPopup.classList.remove("hidden");
    overlay.classList.remove("hidden");
});

btnDongGioHang.addEventListener("click", () => {
    console.log("Đóng giỏ hàng");
    gioHangPopup.classList.add("hidden");
    overlay.classList.add("hidden");
});

// Lấy danh mục từ Firebase
async function layDanhSachDanhMuc() {
    const snapshot = await get(ref(database, "Menu"));
    if (snapshot.exists()) {
        chonDanhMuc.innerHTML += Object.keys(snapshot.val()).map(danhMuc => 
            `<option value="${danhMuc}">${danhMuc}</option>`).join("");
    }
}

// Lấy danh sách món ăn
async function layDanhSachMonAn(danhMucDaChon = "tat-ca", tuKhoaTimKiem = "") {
    danhSachMonAn.innerHTML = "";
    const snapshot = await get(ref(database, "Menu"));
    if (!snapshot.exists()) return;
    
    const duLieuMenu = snapshot.val();
    Object.keys(duLieuMenu).forEach(danhMuc => {
        if (danhMucDaChon !== "tat-ca" && danhMucDaChon !== danhMuc) return;
        
        Object.keys(duLieuMenu[danhMuc]).forEach(maMon => {
            const monAn = duLieuMenu[danhMuc][maMon];
            if ([monAn.TenMon, monAn.MoTa, monAn.Gia.toString()].some(field => 
                field.toLowerCase().includes(tuKhoaTimKiem))) {
                
                danhSachMonAn.innerHTML += `
                    <div class="mon-an">
                        <img src="${monAn.HinhAnh}" alt="${monAn.TenMon}">
                        <h3 class="ten-mon">${monAn.TenMon}</h3>
                        <p class="mo-ta-mon">${monAn.MoTa}</p>
                        <p class="gia-mon">${monAn.Gia} VND</p>
                        <button class="them-vao-gio" data-mamon="${maMon}">Thêm vào giỏ hàng</button>
                    </div>`;
            }
        });
    });
    
    document.querySelectorAll(".them-vao-gio").forEach(button => {
        button.addEventListener("click", (e) => {
            themVaoGioHang(e.target.getAttribute("data-mamon"));
        });
    });
}

// Xử lý sự kiện thay đổi danh mục và tìm kiếm
chonDanhMuc.addEventListener("change", () => layDanhSachMonAn(chonDanhMuc.value, timKiem.value.toLowerCase()));
timKiem.addEventListener("input", () => layDanhSachMonAn(chonDanhMuc.value, timKiem.value.toLowerCase()));

// Khởi động
layDanhSachDanhMuc();
layDanhSachMonAn();
capNhatSoLuongGioHang();