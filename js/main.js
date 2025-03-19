import { database } from "./firebase-config.js";
import { ref, get, set } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// DOM Elements
const danhSachMonAn = document.getElementById("danh-sach-mon-an");
const chonDanhMuc = document.getElementById("chon-danh-muc");
const timKiem = document.getElementById("tim-kiem");
const btnGioHang = document.getElementById("btn-gio-hang");
const soLuongGioHang = document.getElementById("so-luong-gio-hang");
const overlay = document.getElementById("overlay");
const gioHangPopup = document.getElementById("gio-hang-popup");
const btnDongGioHang = document.getElementById("dong-gio-hang");
const gioHangChiTiet = document.getElementById("gio-hang-chi-tiet");
const formDatMon = document.getElementById("form-dat-mon");
const maDatMonInput = document.getElementById("ma-dat-mon");
const tuTaoMaCheckbox = document.getElementById("tu-tao-ma");
const soDienThoaiInput = document.getElementById("so-dien-thoai");
const btnXacNhanDatMon = document.getElementById("xac-nhan-dat-mon");
const btnHuyDatMon = document.getElementById("huy-dat-mon");

// Local Storage - Giỏ hàng
let gioHang = JSON.parse(localStorage.getItem("gioHang")) || {};
function luuGioHang() {
    localStorage.setItem("gioHang", JSON.stringify(gioHang));
    capNhatSoLuongGioHang();
}
function capNhatSoLuongGioHang() {
    soLuongGioHang.textContent = Object.values(gioHang).reduce((acc, sl) => acc + sl, 0);
}

// Giỏ hàng
function themVaoGioHang(maMon) {
    gioHang[maMon] = (gioHang[maMon] || 0) + 1;
    luuGioHang();
}
function hienThiGioHang() {
    gioHangChiTiet.innerHTML = Object.keys(gioHang).length === 0
        ? "<li>Giỏ hàng trống</li>"
        : Object.keys(gioHang).map(maMon => `
            <li>
                <span>${maMon} (x${gioHang[maMon]})</span>
                <button class="xoa-mon" data-mamon="${maMon}">❌</button>
            </li>`).join("") + `<li><button id="dat-mon">Đặt món</button></li>`;
    gioHangChiTiet.querySelectorAll(".xoa-mon").forEach(button => {
        button.addEventListener("click", (e) => {
            delete gioHang[e.target.dataset.mamon];
            luuGioHang();
            hienThiGioHang();
        });
    });
    const nutDatMon = document.getElementById("dat-mon");
    if (nutDatMon) {
        nutDatMon.addEventListener("click", () => {
            formDatMon.classList.remove("hidden");
        });
    }
}

// Đặt món
btnXacNhanDatMon.addEventListener("click", async () => {
    const maDatMon = maDatMonInput.value.trim();
    const soDienThoai = soDienThoaiInput.value.trim();
    if (!maDatMon || !soDienThoai) return alert("Vui lòng nhập đầy đủ thông tin!");
    const thoiGianDat = new Date().toISOString();
    const tongTien = Object.entries(gioHang).reduce((sum, [_, soLuong]) => sum + (soLuong * 50000), 0);
    try {
        await set(ref(database, `DatMon/${maDatMon}`), {
            MaKhach: soDienThoai,
            ThoiGianDat: thoiGianDat,
            DanhSachMon: { ...gioHang },
            TongTien: tongTien,
            TrangThai: "Đang xử lý",
        });
        alert("Đặt món thành công!");
        gioHang = {};
        luuGioHang();
        hienThiGioHang();
        formDatMon.classList.add("hidden");
    } catch (error) {
        console.error("Lỗi đặt món:", error);
        alert("Lỗi khi đặt món, vui lòng thử lại.");
    }
});
btnHuyDatMon.addEventListener("click", () => formDatMon.classList.add("hidden"));

tuTaoMaCheckbox.addEventListener("change", () => {
    maDatMonInput.value = tuTaoMaCheckbox.checked ? "DAT" + Date.now() : "";
    maDatMonInput.disabled = tuTaoMaCheckbox.checked;
});

// Lấy danh mục và món ăn từ Firebase
async function layDanhSachDanhMuc() {
    try {
        const snapshot = await get(ref(database, "Menu"));
        if (snapshot.exists()) {
            chonDanhMuc.innerHTML += Object.keys(snapshot.val()).map(danhMuc => `<option value="${danhMuc}">${danhMuc}</option>`).join("");
        }
    } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
    }
}
async function layDanhSachMonAn(danhMucDaChon = "tat-ca", tuKhoaTimKiem = "") {
    danhSachMonAn.innerHTML = "";
    try {
        const snapshot = await get(ref(database, "Menu"));
        if (!snapshot.exists()) return;
        const fragment = document.createDocumentFragment();
        const tuKhoa = tuKhoaTimKiem.toLowerCase();
        Object.entries(snapshot.val()).forEach(([danhMuc, monAnList]) => {
            if (danhMucDaChon !== "tat-ca" && danhMucDaChon !== danhMuc) return;
            Object.entries(monAnList).forEach(([maMon, monAn]) => {
                if ([monAn.TenMon, monAn.MoTa, monAn.Gia.toString()].some(field => field.toLowerCase().includes(tuKhoa))) {
                    const monAnDiv = document.createElement("div");
                    monAnDiv.classList.add("mon-an");
                    monAnDiv.innerHTML = `
                        <img src="${monAn.HinhAnh}" alt="${monAn.TenMon}">
                        <h3>${monAn.TenMon}</h3>
                        <p>${monAn.MoTa}</p>
                        <p>${monAn.Gia} VND</p>
                        <button class="them-vao-gio" data-mamon="${maMon}">Thêm vào giỏ hàng</button>`;
                    fragment.appendChild(monAnDiv);
                }
            });
        });
        danhSachMonAn.appendChild(fragment);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách món ăn:", error);
    }
}

// Sự kiện
chonDanhMuc.addEventListener("change", () => layDanhSachMonAn(chonDanhMuc.value, timKiem.value));
timKiem.addEventListener("input", () => layDanhSachMonAn(chonDanhMuc.value, timKiem.value));
danhSachMonAn.addEventListener("click", (e) => {
    if (e.target.classList.contains("them-vao-gio")) themVaoGioHang(e.target.dataset.mamon);
});
btnGioHang.addEventListener("click", () => {
    hienThiGioHang();
    gioHangPopup.classList.remove("hidden");
    overlay.classList.remove("hidden");
});
btnDongGioHang.addEventListener("click", () => {
    gioHangPopup.classList.add("hidden");
    overlay.classList.add("hidden");
});

layDanhSachDanhMuc();
layDanhSachMonAn();
capNhatSoLuongGioHang();
