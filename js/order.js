import { layNguoiDung, layDanhSachDanhMuc, layDanhSachMonAn, layKhachHang, suaKhachHang, themDatMon, timDanhMucTuMaMon, layMonAn } from "./CONTROLLER.js";

document.addEventListener("DOMContentLoaded", function () {
    // Local Storage
    let gioHang = JSON.parse(localStorage.getItem("gioHang")) || {};
    let username = localStorage.getItem("username");

    // #region Menu (navbar, sidebar), user-modal: Đăng nhập và hiển thị người dùng, hiển thị giỏ hàng
    const userModal = document.getElementById("user-modal");

    document.getElementById('open-sidebar').addEventListener('click', () => {
        document.getElementById('sidebar').classList.add('active');
    });
    document.getElementById('close-sidebar').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('active');
    });

    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', function() {
            document.getElementById('close-sidebar').click();
        });
    });

    function capNhatSoLuongGioHang() {
        localStorage.setItem("gioHang", JSON.stringify(gioHang));
        document.querySelector('i#gio-hang-icon span.so-luong-gio-hang').textContent = Object.values(gioHang).reduce((acc, sl) => acc + sl, 0);
        document.querySelector('a#gio-hang-open i span.so-luong-gio-hang').textContent = Object.values(gioHang).reduce((acc, sl) => acc + sl, 0);
    }

    function themVaoGioHang(maMon, btnBatDau, soLuong=1) {
        if (!btnBatDau || !document.querySelector("#gio-hang-icon")) {
            console.error("LỖI: Không tìm thấy phần tử!");
            return;
        }

        let rectStart = btnBatDau.getBoundingClientRect();
        let rectEnd = document.querySelector("#gio-hang-icon").getBoundingClientRect();
        const productImg = document.querySelector(`.mon-an button[data-mamon="${maMon}"]`)
                      .closest('.mon-an')
                      .querySelector('img').src;

        let flyItem = document.createElement("img");
        flyItem.src = productImg;
        flyItem.classList.add("fly-item");
        Object.assign(flyItem.style, {
            position: 'fixed',
            width: '60px',
            height: '60px',
            objectFit: 'cover',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: '9999',
            left: `${rectStart.left}px`,
            top: `${rectStart.top}px`,
            transition: 'all 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55)'
        });
        document.body.appendChild(flyItem);
        setTimeout(() => {
            flyItem.style.transform = `translate(${rectEnd.left - rectStart.left}px, ${rectEnd.top - rectStart.top}px) scale(0.2)`;
            flyItem.style.opacity = '0';
        }, 50);
        setTimeout(() => {
            flyItem.remove();
            gioHang[maMon] = (gioHang[maMon] || 0) + parseInt(soLuong);
            console.log(gioHang);
            capNhatSoLuongGioHang();
        }, 1000);
    }

    document.querySelectorAll("#gio-hang-open, #gio-hang-icon").forEach(el => {
        el.addEventListener("click", () => {
            hienThiGioHang();
            document.getElementById("gio-hang-modal").classList.remove("hidden");
            document.getElementById("overlay").classList.remove("hidden");
        })
    });
    document.getElementById("gio-hang-modal").querySelector(".close").onclick = function() {
        document.getElementById("gio-hang-modal").classList.add("hidden");
        document.getElementById("overlay").classList.add("hidden");
    };

    function hienThiGioHang() {
        document.getElementById("gio-hang-chi-tiet").innerHTML = Object.keys(gioHang).length === 0
            ? "<li>Giỏ hàng trống</li>"
            : Object.keys(gioHang).map(maMon => `
            <li>
                <span>${maMon} (x${gioHang[maMon]})</span>
                <button class="xoa-mon" data-mamon="${maMon}">❌</button>
            </li>`).join("") + `<li><button id="dat-mon">Đặt món</button></li>`;
        document.getElementById("gio-hang-chi-tiet").querySelectorAll(".xoa-mon").forEach(button => {
            button.addEventListener("click", (e) => {
                delete gioHang[e.target.dataset.mamon];
                capNhatSoLuongGioHang();
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
                document.getElementById("dat-mon-modal").classList.remove("hidden");
            });
        }
    }

    async function kiemTraDangNhap() {
        if (!username) {
            document.querySelectorAll('.user-info i.user-icon').forEach(icon => {
                icon.classList.replace('bxs-user', 'bx-user-circle');
            });
            document.querySelector('.user-info h3').innerHTML = `Đăng nhập`;
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

                // document.querySelector("#user-info i").textContent = "face";
                document.querySelectorAll('.user-info i.user-icon').forEach(icon => {
                    icon.classList.replace('bx-user-circle', 'bxs-user');
                });
                document.querySelector('.user-info h3').innerHTML = `${username}`;

            } else {
                alert("Tài khoản không tồn tại! Tự động đăng xuất.");
                localStorage.removeItem("username");
            }
        } catch (error) {
            console.error("Lỗi khi lấy thông tin người dùng:", error);
        }
    }

    document.querySelectorAll('.user-info').forEach(el => {
        el.addEventListener("click", async function () {
            if (!username) {
                window.location.href = "auth.html";
                return;
            }
            document.getElementById('close-sidebar').click();

            try {
                const khachHang = await layKhachHang(username);
                if (!khachHang) {
                    alert("Không tìm thấy thông tin khách hàng!");
                    return;
                }

                userModal.style.display = "flex";
                userModal.classList.add("show");

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
        })
    });

    userModal.querySelector(".close").addEventListener("click", function () {
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

    document.getElementById("btn-logout").addEventListener("click", function () {
        localStorage.removeItem("username");
        userModal.style.display = "none";
        username = null;
        kiemTraDangNhap();
    });
    
    kiemTraDangNhap();
    capNhatSoLuongGioHang();
    // #endregion

    // #region Filters: Bộ lọc món ăn, lấy danh mục
    const chonDanhMuc = document.getElementById("danh-muc-select");

    document.querySelector('input[name="price"]').addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        const formattedValue = (value / 1).toLocaleString('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
            useGrouping: true
        });
        document.getElementById('price').textContent = formattedValue;

        document.querySelector('.price-slider').value = value;
        const currentCategory = document.getElementById("danh-muc-select").value;
        const currentSearch = document.getElementById("tim-kiem-input").value;
        hienThiDanhSachMonAnUI(currentCategory, currentSearch, value);
    });

    chonDanhMuc.addEventListener("change", () => hienThiDanhSachMonAnUI(chonDanhMuc.value, document.getElementById("tim-kiem-input").value), document.querySelector('input[name="price"]').value);
    document.getElementById("tim-kiem-input").addEventListener("input", () => hienThiDanhSachMonAnUI(chonDanhMuc.value, document.getElementById("tim-kiem-input").value), document.querySelector('input[name="price"]').value);
    
    document.querySelector(".clear-btn").addEventListener("click", () => {
        document.getElementById("tim-kiem-input").value = "";
        document.getElementById("danh-muc-select").value = "tat-ca";
        document.querySelector(".price-slider").value = document.querySelector(".price-slider").max;
        document.getElementById('price').textContent = 
            parseInt(document.querySelector(".price-slider").max).toLocaleString('vi-VN') + ' ₫';
    
        // Gọi lại hàm hiển thị
        hienThiDanhSachMonAnUI("tat-ca", "", document.querySelector(".price-slider").max);
    });

    async function layDanhSachDanhMucUI() {
        let danhMucList = await layDanhSachDanhMuc();
        chonDanhMuc.innerHTML = ""; // Xóa option cũ
        chonDanhMuc.appendChild(new Option("Tất cả", "tat-ca")); // Thêm option mặc định
        chonDanhMuc.innerHTML = `<option value="tat-ca">Tất cả</option>` +
            danhMucList.map(danhMuc => `<option value="${danhMuc}">${danhMuc}</option>`).join("");
    }
    layDanhSachDanhMucUI();
    // #endregion

    // #region Products-display: Hiển thị món ăn, mở modal thêm món vào giỏ
    const danhSachMonAn = document.getElementById("danh-sach-mon-an");

    async function hienThiDanhSachMonAnUI(danhMucDaChon = "tat-ca", tuKhoaTimKiem = "", giaToiDa = 2200000) {
        danhSachMonAn.innerHTML = "";
        try {
            // document.getElementById("btn-len-dau-trang").click();
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
            // Sau đó lọc theo giá
            danhSachMon = giaToiDa==0? [] : danhSachMon.filter(mon => mon.Gia <= giaToiDa);

            document.getElementById("so-luong-mon").textContent = `${danhSachMon.length} món`;
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
                    <i class='bx bxs-cart-add'></i> Thêm vào giỏ hàng
                </button>
                <div class="hover-mon">
                    <button class="tim-kiem-tuong-tu">
                        <i class='bx bx-search'></i> tương tự
                    </button>
                    <button class="them-1-vao-gio">
                        <i class='bx bx-cart-add'></i> +1
                    </button>
                </div>`;

                monAnDiv.querySelector(".tim-kiem-tuong-tu").addEventListener("click", () => {
                    chonDanhMuc.value = "tat-ca";
                    document.getElementById("tim-kiem-input").value = DanhMuc;
                    hienThiDanhSachMonAnUI(chonDanhMuc.value, document.getElementById("tim-kiem-input").value);
                });

                monAnDiv.querySelector(".them-1-vao-gio").addEventListener("click", function () {
                    themVaoGioHang(MaMon, this, 1);
                });

                // monAnDiv.querySelector(".them-vao-gio").addEventListener("click", (e) => {
                //     if (e.target.classList.contains("them-vao-gio")) themVaoGioHang(e.target.dataset.mamon, e.target);
                // });

                monAnDiv.querySelector(".them-vao-gio").addEventListener("click", async (e) => {
                    if (e.target.classList.contains("them-vao-gio")) {
                        const maMon = e.target.dataset.mamon;
                        const targetElement = e.target;
                        
                        try {
                            const danhMuc = await timDanhMucTuMaMon(maMon);
                            if (!danhMuc) {
                                alert("Không tìm thấy danh mục món ăn!");
                                return;
                            }
                            const monAn = await layMonAn(danhMuc, maMon);
                            if (!monAn) {
                                alert(`Món ${maMon} không tồn tại trong danh mục ${danhMuc}`);
                                return;
                            }
                            const modal = document.getElementById("them-vao-gio-modal");
                            modal.style.display = "flex";
                            modal.classList.add("show");
                            
                            document.getElementById("anh-mon").src = monAn.HinhAnh;
                            document.getElementById("anh-mon").alt = monAn.TenMon;
                            document.getElementById("ten-mon").value = monAn.TenMon;
                            document.getElementById("gia-mon").value = monAn.Gia.toLocaleString('vi-VN');
                            document.getElementById("so-luong").value = 1;

                            // Thêm sự kiện input
                            document.getElementById("so-luong").addEventListener('input', () => {
                                let soLuong = parseInt(document.getElementById("so-luong").value);
                                document.getElementById("gia-mon").value = (monAn.Gia * soLuong).toLocaleString('vi-VN');
                            });
                            
                            // 4. Xử lý nút xác nhận
                            document.getElementById("btn-xac-nhan").onclick = function() {
                                const soLuong = parseInt(document.getElementById("so-luong").value);
                                if(isNaN(soLuong) || soLuong<1){
                                    alert("Số lượng không hợp lệ!");
                                    document.getElementById("so-luong").focus();
                                    return;
                                }
                                themVaoGioHang(maMon, targetElement, soLuong);
                                modal.style.display = "none";
                                modal.classList.remove("show");
                            };
                            
                            // 5. Xử lý nút đóng modal
                            modal.querySelector(".close").onclick = function() {
                                modal.style.display = "none";
                                modal.classList.remove("show");
                            };
                            
                        } catch (error) {
                            console.error("Lỗi khi thêm vào giỏ:", error);
                            alert("Có lỗi xảy ra khi thêm vào giỏ!");
                        }
                    }
                });

                fragment.appendChild(monAnDiv);
                window.scrollTo({ top: 0, behavior: "smooth" });
            });

            danhSachMonAn.appendChild(fragment);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách món ăn:", error);
        }
    }
    hienThiDanhSachMonAnUI();
    // #endregion

    // #region Modal/popup: Đặt món
    document.getElementById("xac-nhan-dat-mon").addEventListener("click", async () => {
        const maDatMon = document.getElementById("ma-dat-mon").value.trim();
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
            document.getElementById("dat-mon-modal").classList.add("hidden");
        } catch (error) {
            console.error("Lỗi đặt món:", error);
            alert("Lỗi khi đặt món, vui lòng thử lại.");
        }
    });    

    document.getElementById("huy-dat-mon").addEventListener("click", () => document.getElementById("dat-mon-modal").classList.add("hidden"));

    document.getElementById("tu-tao-ma").addEventListener("change", () => {
        document.getElementById("ma-dat-mon").value = document.getElementById("tu-tao-ma").checked ? "DAT" + Date.now() : "";
        document.getElementById("ma-dat-mon").disabled = document.getElementById("tu-tao-ma").checked;
    });
    // #endregion
});