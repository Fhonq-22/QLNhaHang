export class User {
    constructor(TenNguoiDung, MatKhau, VaiTro = "Khách hàng") {
        this.TenNguoiDung = TenNguoiDung;
        this.MatKhau = MatKhau;
        this.VaiTro = VaiTro;
    }

    toJSON() {
        return {
            MatKhau: this.MatKhau,
            VaiTro: this.VaiTro
        };
    }
}

export class Menu {
    constructor(DanhMuc, MaMon, TenMon, MoTa, Gia, HinhAnh) {
        this.DanhMuc = DanhMuc;
        this.MaMon = MaMon;
        this.TenMon = TenMon;
        this.MoTa = MoTa;
        this.Gia = Gia;
        this.HinhAnh = HinhAnh;
    }

    toJSON() {
        return {
            TenMon: this.TenMon,
            MoTa: this.MoTa,
            Gia: this.Gia,
            HinhAnh: this.HinhAnh
        };
    }
}

export class KhachHang {
    constructor(SDT, HoTen, NgaySinh, DiaChi, MonYeuThich, HangThanhVien, DiemTichLuy, TongChiTieu) {
        this.SDT = SDT;
        this.HoTen = HoTen;
        this.NgaySinh = NgaySinh;
        this.DiaChi = DiaChi;
        this.MonYeuThich = MonYeuThich;
        this.HangThanhVien = HangThanhVien;
        this.DiemTichLuy = DiemTichLuy;
        this.TongChiTieu = TongChiTieu;
    }

    toJSON() {
        return {
            HoTen: this.HoTen,
            NgaySinh: this.NgaySinh,
            DiaChi: this.DiaChi,
            MonYeuThich: this.MonYeuThich,
            HangThanhVien: this.HangThanhVien,
            DiemTichLuy: this.DiemTichLuy,
            TongChiTieu: this.TongChiTieu,
        };
    }
}

export class DatMon {
    constructor(MaDat, MaKhach, NguoiDat, ThoiGianDat, DanhSachMon, TongTien, TrangThai) {
        this.MaDat = MaDat;
        this.MaKhach = MaKhach;
        this.NguoiDat = NguoiDat;
        this.ThoiGianDat = ThoiGianDat;
        this.DanhSachMon = DanhSachMon; // Object chứa mã món và số lượng
        this.TongTien = TongTien;
        this.TrangThai = TrangThai;
    }

    toJSON() {
        return {
            MaKhach: this.MaKhach,
            NguoiDat: this.NguoiDat,
            ThoiGianDat: this.ThoiGianDat,
            DanhSachMon: this.DanhSachMon,
            TongTien: this.TongTien,
            TrangThai: this.TrangThai,
        };
    }
}