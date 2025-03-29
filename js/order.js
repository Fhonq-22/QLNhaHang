import { layNguoiDung, layDanhSachDanhMuc, layDanhSachMonAn, layKhachHang, suaKhachHang, themDatMon } from "./CONTROLLER.js";

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('open-sidebar').addEventListener('click', () => {
        document.getElementById('sidebar').classList.add('active');
    });
    document.getElementById('close-sidebar').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('active');
    });
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
    });



    const danhSachMonAn = document.getElementById("danh-sach-mon-an");
    const chonDanhMuc = document.getElementById("danh-muc-select");
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
    layDanhSachDanhMucUI();
    layDanhSachMonAnUI();
});