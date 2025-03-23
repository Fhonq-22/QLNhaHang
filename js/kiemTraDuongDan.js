export function kiemTraChuyenHuong(url) {
    fetch(url, { method: 'HEAD' })
        .then(response => {
            if (response.ok) {
                window.location.href = url;
            } else {
                window.location.href = '404.html';
            }
        })
        .catch(() => {
            window.location.href = '404.html';
        });
}