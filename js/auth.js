import { layNguoiDung, themNguoiDung } from "./CONTROLLER.js";
import { kiemTraChuyenHuong } from './kiemTraDuongDan.js';

document.addEventListener("DOMContentLoaded", function () {
    const container = document.querySelector('.container');
    const dangKyBtn = document.querySelector('.dang-ky-btn');
    const dangNhapBtn = document.querySelector('.dang-nhap-btn');
    dangKyBtn.addEventListener('click', () => {
        container.classList.add('active');
    })
    dangNhapBtn.addEventListener('click', () => {
        container.classList.remove('active');
    })

    document.getElementById('form-dang-nhap').addEventListener('submit', async function (event) {
        event.preventDefault();
        const username = document.getElementById("ten-dang-nhap").value;
        const password = document.getElementById("mat-khau-dang-nhap").value;
        if (!username || !password) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }
        const userData = await layNguoiDung(username);
        try {
            if (userData) {
                if (userData.MatKhau === password) {
                    alert(`Đăng nhập thành công! Vai trò: ${userData.VaiTro}`);
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
    });

    document.getElementById('form-dang-ky').addEventListener('submit', async function (event) {
        event.preventDefault();
        const username = document.getElementById("ten-dang-ky").value;
        const password = document.getElementById("mat-khau-dang-ky").value;
        const repass = document.getElementById("nhap-lai-mat-khau")?.value;
        if (!username || !password || !repass) {
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
        if (!soDienThoaiRegex.test(username) || !dauSoNhaMang.some(dauSo => username.startsWith(dauSo))) {
            alert("Số điện thoại không hợp lệ hoặc không thuộc nhà mạng Việt Nam!");
            return;
        }
        if (password !== repass) {
            alert("Mật khẩu xác nhận không khớp!");
            return;
        }
        const userData = await layNguoiDung(username);
        try {
            if (userData) {
                alert("Số điện thoại đã tồn tại!");
                return;
            }
            const nguoiDung = {
                TenNguoiDung: username,
                MatKhau: password,
                VaiTro: "Khách hàng"
            };
            await themNguoiDung(nguoiDung);
            alert("Đăng ký thành công!");
            document.getElementById("ten-dang-nhap").value = username;
            document.getElementById("mat-khau-dang-nhap").value = password;
            dangNhapBtn.click();
        } catch (error) {
            alert("Lỗi đăng ký: " + error.message);
        }
    });
});