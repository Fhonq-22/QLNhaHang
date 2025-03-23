import { database } from "./firebase-config.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

document.addEventListener("DOMContentLoaded", function () {
    const username = localStorage.getItem("username");
    const donHangContainer = document.getElementById("don-hang-container");
    const filterOnlineCheckbox = document.getElementById("filter-online"); // Checkbox lọc đơn online

    async function taiDonHang() {
        try {
            const donHangRef = ref(database, "DatMon");
            const snapshot = await get(donHangRef);

            if (snapshot.exists()) {
                const data = snapshot.val();
                const danhSachDon = Object.keys(data)
                    .map(key => ({
                        maDatMon: key,
                        ...data[key]
                    }))
                    .filter(don => don.MaKhach === username); // Chỉ lấy đơn của khách hiện tại

                if (danhSachDon.length > 0) {
                    hienThiDonHang(danhSachDon);
                } else {
                    donHangContainer.innerHTML = "<p>Không có đơn nào được đặt.</p>";
                }
            } else {
                donHangContainer.innerHTML = "<p>Không có đơn nào được đặt.</p>";
            }
        } catch (error) {
            console.error("Lỗi tải đơn đặt món:", error);
            donHangContainer.innerHTML = "<p>Lỗi khi tải đơn đặt món.</p>";
        }
    }

    function hienThiDonHang(donHangs) {
        donHangContainer.innerHTML = "";

        // Kiểm tra checkbox lọc đơn online
        const isFilterOnline = filterOnlineCheckbox.checked;
        const donHangFiltered = isFilterOnline
            ? donHangs.filter(don => don.MaKhach === username && don.NguoiLap === username) // Lọc đơn đặt online
            : donHangs;

        if (donHangFiltered.length === 0) {
            donHangContainer.innerHTML = "<p>Không có đơn nào phù hợp.</p>";
            return;
        }

        donHangFiltered.forEach(don => {
            const donHangDiv = document.createElement("div");
            donHangDiv.classList.add("don-hang");

            let nutTheoDoi = "";
            if (don.NguoiLap === username) {
                nutTheoDoi = `<button class="theo-doi" data-id="${don.maDatMon}"><i class="material-icons">preview</i> Tiến trình</button>`;
            }

            const formatter = new Intl.DateTimeFormat("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
            });

            donHangDiv.innerHTML = `
                <h2>Đơn: #${don.maDatMon}</h2>
                <p><strong><i class="material-icons">schedule</i>Thời gian đặt:</strong> ${formatter.format(new Date(don.ThoiGianDat))}</p>
                <p><strong><i class="material-icons">savings</i>Tổng tiền:</strong> ${don.TongTien.toLocaleString()} VNĐ</p>
                <p class="trang-thai"><strong><i class="material-icons">info</i>Trạng thái:</strong> ${don.TrangThai}</p>
                ${nutTheoDoi}
            `;
            donHangContainer.appendChild(donHangDiv);
        });

        // Xử lý sự kiện mở modal
        document.querySelectorAll(".theo-doi").forEach(button => {
            button.addEventListener("click", function () {
                const maDatMon = this.getAttribute("data-id");
                hienThiTienTrinhGiao(maDatMon);
            });
        });

        // Đóng modal
        document.querySelector(".close").addEventListener("click", function () {
            document.getElementById("tracking-modal").style.display = "none";
        });

        window.addEventListener("click", function (event) {
            const modal = document.getElementById("tracking-modal");
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });
    }

    // Bắt sự kiện khi người dùng thay đổi checkbox
    filterOnlineCheckbox.addEventListener("change", () => {
        taiDonHang(); // Gọi lại để cập nhật danh sách đơn hàng
    });

    // Hàm hiển thị tiến trình giao hàng theo dạng timeline
    async function hienThiTienTrinhGiao(maDatMon) {
        const trackingTimeline = document.getElementById("tracking-timeline");
        const trackingMessage = document.getElementById("tracking-message");
        trackingTimeline.innerHTML = "<p>Đang tải...</p>";
        trackingMessage.innerHTML = "";

        try {
            const donHangRef = ref(database, `DatMon/${maDatMon}`);
            const snapshot = await get(donHangRef);

            if (snapshot.exists()) {
                const don = snapshot.val();
                const trangThai = don.TrangThai;

                // Danh sách trạng thái theo thứ tự
                const trangThaiSteps = [
                    "Đang xử lý",
                    "Đang chuẩn bị",
                    "Đang giao",
                    "Hoàn tất"
                ];

                // Danh sách icon tương ứng với trạng thái
                const trangThaiIcons = {
                    "Đang xử lý": "pending_actions", // ⏳
                    "Đang chuẩn bị": "restaurant_menu", // 🍽️
                    "Đang giao": "local_shipping", // 🚚
                    "Hoàn tất": "check_circle" // ✅
                };

                // Thông điệp tương ứng với trạng thái
                const trangThaiMessages = {
                    "Đang xử lý": "Đơn đặt món của bạn đã được tiếp nhận! Chúng tôi sẽ xác nhận và xử lý trong thời gian sớm nhất.",
                    "Đang chuẩn bị": "Bếp trưởng và đội ngũ đầu bếp đang tất bật chế biến món ăn cho bạn. Hãy kiên nhẫn chờ đợi một chút nhé!",
                    "Đang giao": "Tài xế đang trên đường giao đơn đặt của bạn. Hãy đảm bảo điện thoại của bạn sẵn sàng để nhận hàng và chuẩn bị sẵn số tiền thanh toán nhé!",
                    "Hoàn tất": "Đơn đặt món đã được giao thành công! Cảm ơn bạn đã ủng hộ. Chúc bạn có một bữa ăn ngon miệng!"
                };

                // Xác định trạng thái hiện tại
                const trangThaiIndex = trangThaiSteps.indexOf(trangThai);
                const progressWidth = trangThai === "Hoàn tất" ? 80 : (trangThaiIndex / (trangThaiSteps.length - 1)) * 100;

                // Render giao diện tiến trình với icon
                trackingTimeline.innerHTML = `
                <div class="tracking-timeline">
                    <div class="progress-bar" style="width: ${progressWidth}%;"></div>
                    ${trangThaiSteps
                        .map(
                            (step, index) =>
                                `<div>
                                    <div class="tracking-step ${index <= trangThaiIndex ? "active" : ""}">
                                        <i class="material-icons">${trangThaiIcons[step]}</i>
                                    </div>
                                    <div class="tracking-label">${step}</div>
                                </div>`
                        )
                        .join("")}
                </div>
                `;
                // Hiển thị thông điệp phù hợp
                trackingMessage.innerHTML = trangThaiMessages[trangThai] || "Trạng thái không xác định.";

            } else {
                trackingTimeline.innerHTML = "<p>Không tìm thấy thông tin đơn hàng.</p>";
            }
        } catch (error) {
            console.error("Lỗi tải tiến trình giao hàng:", error);
            trackingTimeline.innerHTML = "<p>Lỗi tải dữ liệu.</p>";
        }

        // Hiển thị modal
        document.getElementById("tracking-modal").style.display = "flex";
    }

    document.getElementById("btn-dat-mon").addEventListener("click", function () {
        window.location.href = "index.html";
    });


    taiDonHang();
});
