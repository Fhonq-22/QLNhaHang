import { database } from "./firebase-config.js";
import { ref, get, set, update } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

document.addEventListener("DOMContentLoaded", function () {
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
    const btnXacNhanDatMon = document.getElementById("xac-nhan-dat-mon");
    const btnHuyDatMon = document.getElementById("huy-dat-mon");
    const userInfo = document.getElementById("btn-user");

    const username = localStorage.getItem("username");
    async function kiemTraDangNhap() {
        if (!username) return;
        try {
            const snapshot = await get(ref(database, `Users/${username}`));
            if (snapshot.exists()) {
                userInfo.textContent = `👤 ${username}`;
            } else {
                localStorage.removeItem("username");
            }
        } catch (error) {
            console.error("Lỗi khi lấy thông tin người dùng:", error);
        }
    }
    kiemTraDangNhap();

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
        let btnDatMon = document.querySelector(`.them-vao-gio[data-mamon="${maMon}"]`);
        let gioHangIcon = document.querySelector("#btn-gio-hang");
    
        if (!btnDatMon || !gioHangIcon) {
            console.error("LỖI: Không tìm thấy phần tử!");
            return;
        }
    
        // Cập nhật giỏ hàng
        gioHang[maMon] = (gioHang[maMon] || 0) + 1;
        luuGioHang();
    
        // Lấy vị trí bắt đầu và kết thúc
        let rectStart = btnDatMon.getBoundingClientRect();
        let rectEnd = gioHangIcon.getBoundingClientRect();
    
        // Tạo icon bay
        let flyItem = document.createElement("span");
        flyItem.classList.add("fly-item");
        flyItem.innerText = "🛒"; // Hoặc dùng hình ảnh sản phẩm nếu muốn
        document.body.appendChild(flyItem);
    
        // Đặt vị trí ban đầu
        flyItem.style.left = rectStart.left + "px";
        flyItem.style.top = rectStart.top + "px";
    
        // Thêm hiệu ứng bay
        setTimeout(() => {
            flyItem.style.transform = `translate(${rectEnd.left - rectStart.left}px, ${rectEnd.top - rectStart.top}px) scale(0.3)`;
            flyItem.style.opacity = "0";
        }, 50);
    
        // Xóa sau khi hiệu ứng hoàn tất
        setTimeout(() => {
            flyItem.remove();
        }, 1500);
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
                if (!username) {
                    alert("Bạn cần đăng nhập để đặt món!");
                    return;
                }
                formDatMon.classList.remove("hidden");
            });
        }
    }

    // Đặt món
    btnXacNhanDatMon.addEventListener("click", async () => {
        const maDatMon = maDatMonInput.value.trim();
        if (!maDatMon) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }
        try {
            const userRef = ref(database, `KhachHang/${username}`);
            const userSnapshot = await get(userRef);
            
            if (!userSnapshot.exists()) {
                alert("Không tìm thấy thông tin khách hàng!");
                return;
            }
    
            const userData = userSnapshot.val();
            const address = userData.DiaChi?.trim();
    
            if (!address) {
                alert("Bạn cần thêm địa chỉ để chúng tôi có thể giao đơn đặt!");
                return;
            }
    
            const thoiGianDat = new Date().toISOString();
            const tongTien = Object.entries(gioHang).reduce((sum, [_, soLuong]) => sum + (soLuong * 50000), 0);
    
            // 🔹 Tiến hành đặt món
            await set(ref(database, `DatMon/${maDatMon}`), {
                MaKhach: username,
                ThoiGianDat: thoiGianDat,
                DanhSachMon: { ...gioHang },
                TongTien: tongTien,
                DiaChi: address, // Lưu địa chỉ lấy từ Firebase
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
                        <p>${monAn.Gia.toLocaleString('vi-VN')} VND</p>
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

    const userModal = document.getElementById("user-modal");
    const closeModal = document.querySelector(".close");

    document.getElementById("btn-user").addEventListener("click", function () {
        const username = localStorage.getItem("username");
        if (!username) {
            window.location.href = "auth.html"; // Chuyển đến trang đăng nhập nếu chưa đăng nhập
        } else {
            // Hiển thị modal thông tin tài khoản
            userModal.style.display = "flex";
            userModal.classList.add("show");

            const userRef = ref(database, `KhachHang/${username}`);

            get(userRef)
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        const userData = snapshot.val();

                        // Đổ dữ liệu vào form
                        document.getElementById("ho-ten").value = userData.HoTen || "";
                        document.getElementById("ngay-sinh").value = userData.NgaySinh.split("T")[0] || "";
                        document.getElementById("dia-chi").value = userData.DiaChi || "";
                        document.getElementById("mon-yeu-thich").value = userData.MonYeuThich || "";
                        document.getElementById("hang-thanh-vien").value = userData.HangThanhVien || "";
                        document.getElementById("diem-tich-luy").value = userData.DiemTichLuy || 0;
                        document.getElementById("tong-chi-tieu").value = userData.TongChiTieu || 0;
                    } else {
                        alert("Không tìm thấy thông tin khách hàng!");
                    }
                })
                .catch((error) => {
                    console.error("Lỗi khi lấy dữ liệu khách hàng:", error);
                    alert("Lỗi khi tải thông tin, vui lòng thử lại.");
                });
        }
    });

    // Xử lý đóng modal
    closeModal.addEventListener("click", function () {
        userModal.style.display = "none";
        userModal.classList.remove("show");

    });

    // Cập nhật thông tin
    document.getElementById("btn-cap-nhat").addEventListener("click", function () {
        if (!username) {
            alert("Bạn cần đăng nhập để cập nhật thông tin!");
            return;
        }
    
        const updatedData = {
            HoTen: document.getElementById("ho-ten").value,
            NgaySinh: document.getElementById("ngay-sinh").value + "T00:00:00",
            DiaChi: document.getElementById("dia-chi").value,
            MonYeuThich: document.getElementById("mon-yeu-thich").value,
        };
    
        const userRef = ref(database, `KhachHang/${username}`);
    
        update(userRef, updatedData)
            .then(() => {
                alert("Cập nhật thông tin thành công!");
                console.log("Thông tin đã cập nhật:", updatedData);
            })
            .catch((error) => {
                console.error("Lỗi khi cập nhật thông tin:", error);
                alert("Lỗi khi cập nhật, vui lòng thử lại.");
            });
    });

    // Xử lý đăng xuất
    document.getElementById("btn-logout").addEventListener("click", function () {
        localStorage.removeItem("username"); // Xoá username khỏi localStorage
        userModal.style.display = "none"; // Đóng modal
        location.reload();
    });

    layDanhSachDanhMuc();
    layDanhSachMonAn();
    capNhatSoLuongGioHang();
});

window.handleUserClick = function () {
    const username = localStorage.getItem("username");
    if (!username) {
        window.location.href = "auth.html";
    }
};
