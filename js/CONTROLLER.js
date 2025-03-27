import { addData, getData, updateData, deleteData } from "./firebase-CRUD.js";
import { User, Menu, KhachHang, DatMon } from "./MODEL.js";

// #region XỬ LÝ USER
/**
 * Thêm tài khoản người dùng vào database
 * @param {User} user - Đối tượng người dùng cần thêm
 */
export async function themNguoiDung(nguoiDung) {
    await addData("Users", nguoiDung.TenNguoiDung, new User(...Object.values(nguoiDung)).toJSON());
}

/**
 * Lấy thông tin 1 người dùng
 * @param {string} username
 * @returns {User|null}
 */
export async function layNguoiDung(username) {
    const data = await getData("Users", username);
    return data ? new User(username, data.MatKhau, data.VaiTro) : null; 
    // Sửa lại đúng tên trường theo User.toJSON()
}

/**
 * Lấy toàn bộ người dùng
 * @returns {Array<User>} - Danh sách người dùng
 */
export async function layDanhSachNguoiDung() {
    const data = await getData("Users","");
    return data ? Object.keys(data) : [];
}

/**
 * Cập nhật người dùng
 * @param {string} username
 * @param {object} newData - Dữ liệu mới
 */
export async function suaNguoiDung(username, newData) {
    const updatedUser = new User(username, newData.MatKhau, newData.VaiTro);
    await updateData("Users", username, updatedUser.toJSON());
}

/**
 * Xóa người dùng
 * @param {string} username
 */
export async function xoaNguoiDung(username) {
    await deleteData("Users", username);
}
// #endregion

// #region XỬ LÝ MENU
/**
 * Thêm món ăn vào danh mục
 * @param {string} danhMuc - Tên danh mục (VD: "BBQ", "Burger & Sandwich")
 * @param {string} maMon - Mã món ăn (VD: "BBQ01", "BUR02")
 * @param {Menu} monAn - Đối tượng món ăn (Menu)
 */
export async function themMonAn(danhMuc, maMon, monAn) {
    await addData(`Menu/${danhMuc}/${maMon}`, monAn.toJSON());
}

/**
 * Lấy thông tin một món ăn
 * @param {string} danhMuc - Tên danh mục
 * @param {string} maMon - Mã món ăn
 * @returns {Menu|null} - Đối tượng món ăn hoặc null nếu không tồn tại
 */
export async function layMonAn(danhMuc, maMon) {
    const data = await getData(`Menu/${danhMuc}/${maMon}`);
    return data ? new Menu(danhMuc, maMon, data.TenMon, data.MoTa, data.Gia, data.HinhAnh) : null;
}

/**
 * Lấy danh sách món ăn trong một danh mục
 * @param {string} danhMuc - Tên danh mục
 * @returns {Array<Menu>} - Danh sách món ăn trong danh mục
 */
export async function layDanhSachMonAn(danhMuc) {
    const data = await getData(`Menu`, danhMuc);
    if (!data) return [];

    return Object.entries(data).map(([maMon, monAn]) => {
        return new Menu(danhMuc, maMon, monAn.TenMon, monAn.MoTa, monAn.Gia, monAn.HinhAnh);
    });
}

/**
 * Lấy toàn bộ danh mục (BBQ, Burger & Sandwich,...)
 * @returns {Array<string>} - Danh sách tên danh mục
 */
export async function layDanhSachDanhMuc() {
    const data = await getData("Menu","");
    return data ? Object.keys(data) : [];
}

/**
 * Cập nhật thông tin món ăn
 * @param {string} danhMuc - Tên danh mục
 * @param {string} maMon - Mã món ăn
 * @param {Menu|object} newData - Đối tượng `Menu` hoặc object chứa thông tin mới
 */
export async function suaMonAn(danhMuc, maMon, newData) {
    const updatedData = newData instanceof Menu ? newData.toJSON() : newData;
    await updateData(`Menu/${danhMuc}/${maMon}`, updatedData);
}

/**
 * Xóa món ăn khỏi danh mục
 * @param {string} danhMuc - Tên danh mục
 * @param {string} maMon - Mã món ăn
 */
export async function xoaMonAn(danhMuc, maMon) {
    await deleteData(`Menu/${danhMuc}/${maMon}`);
}
// #endregion

// #region XỬ LÝ KHACHHANG
/**
 * Lấy thông tin khách hàng từ database
 * @param {string} SDT - Số điện thoại khách hàng (dùng làm key)
 * @returns {KhachHang|null}
 */
export async function layKhachHang(SDT) {
    const data = await getData("KhachHang", SDT);
    return data
        ? new KhachHang(SDT, data.HoTen, data.NgaySinh, data.DiaChi, data.MonYeuThich, data.HangThanhVien, data.DiemTichLuy, data.TongChiTieu)
        : null;
}

/**
 * Cập nhật thông tin khách hàng
 * @param {KhachHang} updatedKhachHang - Đối tượng khách hàng cần thêm
 */
export async function suaKhachHang(updatedKhachHang) {
    await updateData("KhachHang", updatedKhachHang.SDT, new KhachHang(...Object.values(updatedKhachHang)).toJSON());
}
// #endregion

// #region XỬ LÝ DATMON
/**
 * Thêm đơn đặt món vào database
 * @param {DatMon} datMon - Đối tượng đơn đặt món cần thêm
 */
export async function themDatMon(datMon) {
    await updateData("DatMon", datMon.MaDat, new DatMon(...Object.values(datMon)).toJSON());
}
// #endregion