import { database } from "./firebase-config.js";
import { ref, set, get, child } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

import { kiemTraChuyenHuong } from './kiemTraDuongDan.js';

document.addEventListener("DOMContentLoaded", function () {
    const formXacThuc = document.getElementById("form-xac-thuc");
    const nutHanhDong = document.getElementById("nut-hanh-dong");
    const truongDangKy = document.getElementById("register-fields");
    const chuyenSangDangKy = document.getElementById("chuyen-sang-dang-ky");

    let dangNhap = true;

    chuyenSangDangKy.addEventListener("click", function (event) {
        event.preventDefault();
        dangNhap = !dangNhap;

        document.getElementById("tieu-de-form").textContent = dangNhap ? "Đăng Nhập" : "Đăng Ký";
        nutHanhDong.textContent = dangNhap ? "Đăng Nhập" : "Đăng Ký";
        document.querySelector('label[for="ten-dang-nhap"]').textContent = dangNhap ? "Tên đăng nhập": "Số điện thoại đăng ký";
        truongDangKy.classList.toggle("hidden");
        chuyenSangDangKy.innerHTML = dangNhap
            ? "Chưa có tài khoản? <a href='#'>Đăng ký ngay</a>"
            : "Đã có tài khoản? <a href='#'>Đăng nhập ngay</a>";
    });

    formXacThuc.addEventListener("submit", async function (event) {
        event.preventDefault();

        const username = document.getElementById("ten-dang-nhap").value;
        const password = document.getElementById("mat-khau").value;
        const confirmPassword = document.getElementById("xac-nhan-mat-khau")?.value;

        if (!username || !password) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }
        const soDienThoaiRegex = /^(0\d{9,10})$/;
        const dauSoNhaMang = [
            "086", "096", "097", "098", // Viettel
            "089", "090", "093",        // MobiFone
            "088", "091", "094",        // VinaPhone
            "092",                      // Vietnamobile
            "056", "058",               // Vietnamobile (mới)
            "032", "033", "034", "035", "036", "037", "038", "039" // Viettel (11 số đổi về 10 số)
        ];
        
        if (!dangNhap && (!soDienThoaiRegex.test(username) || !dauSoNhaMang.some(dauSo => username.startsWith(dauSo)))) {
            alert("Số điện thoại không hợp lệ hoặc không thuộc nhà mạng Việt Nam!");
            return;
        }

        const userRef = ref(database, "Users/" + username);

        if (!dangNhap) {
            if (password !== confirmPassword) {
                alert("Mật khẩu xác nhận không khớp!");
                return;
            }

            try {
                // Kiểm tra tài khoản đã tồn tại chưa
                const snapshot = await get(userRef);
                if (snapshot.exists()) {
                    alert("Tên đăng nhập đã tồn tại!");
                    return;
                }

                await set(userRef, {
                    MatKhau: password,
                    VaiTro: "Khách hàng"
                });

                alert("Đăng ký thành công!");
                chuyenSangDangKy.click();
            } catch (error) {
                alert("Lỗi đăng ký: " + error.message);
            }
        } else {
            try {
                const snapshot = await get(userRef);
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    if (userData.MatKhau === password) {
                        alert(`Đăng nhập thành công! Vai trò: ${userData.VaiTro}`);
                        //window.location.href = "../index.html";
                        localStorage.setItem("username", username);
                        switch (userData.VaiTro) {
                            case "Khách hàng": 
                                kiemTraChuyenHuong("index.html");
                                break;
                            case "Nhân viên": 
                                kiemTraChuyenHuong("nhanvien.html");
                                break;
                            case "Admin": 
                                kiemTraChuyenHuong("admin.html");
                                break;
                            default:
                                alert("Vai trò không hợp lệ!");
                                break;
                        }
                    } else {
                        alert("Sai mật khẩu!");
                    }
                } else {
                    alert("Tài khoản không tồn tại!");
                }
            } catch (error) {
                alert("Lỗi đăng nhập: " + error.message);
            }
        }
    });
});
