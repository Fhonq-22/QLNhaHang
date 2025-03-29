import { layNguoiDung, layDanhSachDanhMuc, layDanhSachMonAn, layKhachHang, suaKhachHang, themDatMon } from "./CONTROLLER.js";

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
    const lichSuContainer = document.getElementById("lich-su-container");
    const btnUser = document.getElementById("btn-user");

    const username = localStorage.getItem("username");


    async function kiemTraDangNhap() {
        if (!username) {
            return;
        }

        try {
            const userData = await layNguoiDung(username); // Gọi từ CONTROLLER.js

            if (userData) {
                const role = userData.VaiTro || "Khách hàng"; // Mặc định nếu không có VaiTro

                if (role !== "Khách hàng") {
                    alert("Bạn không có quyền truy cập! Vui lòng đăng nhập với tài khoản khách hàng.");
                    localStorage.removeItem("username");
                    return;
                }

                document.querySelector("#user-info i").textContent = "face";
                btnUser.innerHTML = `${username}`;

            } else {
                alert("Tài khoản không tồn tại! Tự động đăng xuất.");
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
    function themVaoGioHang(maMon, btnBatDau) {
        let gioHangIcon = document.querySelector("#btn-gio-hang");

        if (!btnBatDau || !gioHangIcon) {
            console.error("LỖI: Không tìm thấy phần tử!");
            return;
        }

        let rectStart = btnBatDau.getBoundingClientRect();
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
        }, 100);

        // Xóa sau khi hiệu ứng hoàn tất
        setTimeout(() => {
            flyItem.remove();
            gioHang[maMon] = (gioHang[maMon] || 0) + 1;
            luuGioHang();
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

    btnXacNhanDatMon.addEventListener("click", async () => {
        const maDatMon = maDatMonInput.value.trim();
        if (!maDatMon) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }
    
        try {
            // 🔹 Lấy thông tin khách hàng từ database
            const khachHang = await layKhachHang(username);
            if (!khachHang) {
                alert("Không tìm thấy thông tin khách hàng!");
                return;
            }
    
            if (!khachHang.DiaChi?.trim()) {
                alert("Bạn cần thêm địa chỉ để chúng tôi có thể giao đơn đặt!");
                return;
            }
    
            // 🔹 Tính tổng tiền
            const tongTien = Object.entries(gioHang).reduce((sum, [_, soLuong]) => sum + soLuong * 50000, 0);
    
            // 🔹 Tạo đơn đặt món
            const donDatMon = {
                MaDat: maDatMon,
                MaKhach: username,
                NguoiDat: username,
                ThoiGianDat: new Date().toISOString(),
                DanhSachMon: { ...gioHang },
                TongTien: tongTien,
                TrangThai: "Đang xử lý"
            };
    
            // 🔹 Thêm đơn đặt món vào database
            await themDatMon(donDatMon);
    
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

    async function layDanhSachDanhMucUI() {
        let danhMucList = await layDanhSachDanhMuc();
        chonDanhMuc.innerHTML = ""; // Xóa option cũ
        chonDanhMuc.appendChild(new Option("Tất cả", "tat-ca")); // Thêm option mặc định
        chonDanhMuc.innerHTML = `<option value="tat-ca">Tất cả</option>` +
            danhMucList.map(danhMuc => `<option value="${danhMuc}">${danhMuc}</option>`).join("");
    }

    async function layDanhSachMonAnUI(danhMucDaChon = "tat-ca", tuKhoaTimKiem = "") {
        danhSachMonAn.innerHTML = "";
        try {
            document.getElementById("btn-len-dau-trang").click();
            // Nếu chọn "tat-ca", ta lấy danh sách của tất cả danh mục
            let danhSachMon = danhMucDaChon === "tat-ca"
                ? (await Promise.all((await layDanhSachDanhMuc()).map(layDanhSachMonAn))).flat()
                : await layDanhSachMonAn(danhMucDaChon);

            // Lọc theo từ khóa tìm kiếm
            const tuKhoa = tuKhoaTimKiem?.toLowerCase() || "";
            danhSachMon = danhSachMon.filter(mon =>
                [mon.DanhMuc, mon.TenMon, mon.MoTa, mon.Gia?.toString()]
                    .some(field => field?.toLowerCase().includes(tuKhoa))
            );

            const fragment = document.createDocumentFragment();
            danhSachMon.forEach(({ DanhMuc, MaMon, TenMon, MoTa, Gia, HinhAnh }) => {
                const monAnDiv = document.createElement("div");
                monAnDiv.classList.add("mon-an", "shine");
                monAnDiv.innerHTML = `
                <img src="${HinhAnh}" alt="${TenMon}">
                <h3>${TenMon}</h3>
                <p>${MoTa}</p>
                <p>${Gia.toLocaleString('vi-VN')} VND</p>
                <button class="them-vao-gio" data-mamon="${MaMon}">
                    <i class="material-icons">add_shopping_cart</i> Thêm vào giỏ hàng
                </button>
                <div class="hover-mon">
                    <button class="tim-kiem-tuong-tu">
                        <i class="material-icons">search</i> tương tự
                    </button>
                    <button class="them-1-vao-gio">
                        <i class="material-icons">add_shopping_cart</i> +1
                    </button>
                </div>`;

                monAnDiv.querySelector(".tim-kiem-tuong-tu").addEventListener("click", () => {
                    chonDanhMuc.value = "tat-ca";
                    timKiem.value = DanhMuc;
                    layDanhSachMonAnUI(chonDanhMuc.value, timKiem.value);
                });

                monAnDiv.querySelector(".them-1-vao-gio").addEventListener("click", function () {
                    themVaoGioHang(MaMon, this);
                });

                fragment.appendChild(monAnDiv);
            });

            danhSachMonAn.appendChild(fragment);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách món ăn:", error);
        }
    }


    // Sự kiện
    chonDanhMuc.addEventListener("change", () => layDanhSachMonAnUI(chonDanhMuc.value, timKiem.value));
    timKiem.addEventListener("input", () => layDanhSachMonAnUI(chonDanhMuc.value, timKiem.value));
    danhSachMonAn.addEventListener("click", (e) => {
        if (e.target.classList.contains("them-vao-gio")) themVaoGioHang(e.target.dataset.mamon, e.target);
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

    document.getElementById("btn-user").addEventListener("click", async function () {
        const username = localStorage.getItem("username");
        if (!username) {
            window.location.href = "auth.html";
            return;
        }

        try {
            const khachHang = await layKhachHang(username);
            if (!khachHang) {
                alert("Không tìm thấy thông tin khách hàng!");
                return;
            }

            // Hiển thị modal thông tin tài khoản
            userModal.style.display = "flex";
            userModal.classList.add("show");

            // Đổ dữ liệu vào form
            document.getElementById("ho-ten").value = khachHang.HoTen || "";
            document.getElementById("ngay-sinh").value = khachHang.NgaySinh.split("T")[0] || "";
            document.getElementById("dia-chi").value = khachHang.DiaChi || "";
            document.getElementById("mon-yeu-thich").value = khachHang.MonYeuThich || "";
            document.getElementById("hang-thanh-vien").value = khachHang.HangThanhVien || "";
            document.getElementById("diem-tich-luy").value = khachHang.DiemTichLuy || 0;
            document.getElementById("tong-chi-tieu").value = khachHang.TongChiTieu || 0;
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu khách hàng:", error);
            alert("Lỗi khi tải thông tin, vui lòng thử lại.");
        }
    });


    // Xử lý đóng modal
    closeModal.addEventListener("click", function () {
        userModal.style.display = "none";
        userModal.classList.remove("show");

    });

    document.getElementById("btn-cap-nhat").addEventListener("click", async function () {
        const khachHang = {
            SDT: username,
            HoTen: document.getElementById("ho-ten").value,
            NgaySinh: document.getElementById("ngay-sinh").value + "T00:00:00",
            DiaChi: document.getElementById("dia-chi").value,
            MonYeuThich: document.getElementById("mon-yeu-thich").value,
            HangThanhVien: document.getElementById("hang-thanh-vien").value,
            DiemTichLuy: parseInt(document.getElementById("diem-tich-luy").value) || 0,
            TongChiTieu: parseFloat(document.getElementById("tong-chi-tieu").value) || 0
        };
    
        try {
            await suaKhachHang(khachHang);
            alert("Cập nhật thông tin thành công!");
        } catch (error) {
            alert("Lỗi khi cập nhật, vui lòng thử lại.");
        }
    });    

    // Xử lý đăng xuất
    document.getElementById("btn-logout").addEventListener("click", function () {
        localStorage.removeItem("username"); // Xoá username khỏi localStorage
        userModal.style.display = "none"; // Đóng modal
        location.reload();
    });

    document.getElementById("btn-lich-su").addEventListener("click", function () {
        window.location.href = "my-order.html";
    });

    layDanhSachDanhMucUI();
    layDanhSachMonAnUI();
    capNhatSoLuongGioHang();
});

window.handleUserClick = function () {
    const username = localStorage.getItem("username");
    if (!username) {
        window.location.href = "auth.html";
    }
};


document.addEventListener("DOMContentLoaded", function () {
    const items = document.querySelectorAll(".menu li");

    function canhChinh(selectedItem) {
        // Xóa class active khỏi tất cả các item
        items.forEach(item => item.classList.remove("active"));

        // Thêm class active cho item được chọn
        selectedItem.classList.add("active");

        // Lấy div.tieu-de tương ứng với item được chọn
        const title = selectedItem.querySelector(".tieu-de");

        // Cập nhật màu nền cho tiêu đề từ data-mau
        title.style.backgroundColor = selectedItem.getAttribute("data-mau");
    }

    // Mặc định chọn item đầu tiên
    if (items.length > 0) {
        canhChinh(items[0]);
    }

    // Thêm sự kiện click cho từng item
    items.forEach(item => {
        item.addEventListener("click", function () {
            canhChinh(this);
        });
    });
});


window.onscroll = function () {
    let nut = document.getElementById("btn-len-dau-trang");

    // Hiển thị khi cuộn xuống hơn 200px
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
        nut.style.display = "block";
    } else {
        nut.style.display = "none";
    }
};

document.getElementById("btn-len-dau-trang").addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
});