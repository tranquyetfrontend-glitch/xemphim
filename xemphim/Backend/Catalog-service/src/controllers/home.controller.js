import { MovieRepository } from '../repositories/movie.repository.js';

const movieRepo = new MovieRepository();

export const getHomeComposite = async (req, res) => {
    try {
        const data = await movieRepo.getHomeCompositeData();

        const mapMovie = (m, subText) => ({
            id: m.movie_id,
            title: m.title,
            poster: m.poster_url || 'https://via.placeholder.com/300x450',
            age: m.age_rating || 'P',
            sub: subText || m.description?.substring(0, 20) + '...' || 'Phụ đề',
            score: m.score || 9.0
        });

        const responseBlocks = [
            {
                type: "MOVIE_GRID",
                title: "PHIM ĐANG CHIẾU",
                data: data.nowShowing.map(m => mapMovie(m, "Đang chiếu"))
            },
            {
                type: "MOVIE_GRID",
                title: "PHIM SẮP CHIẾU",
                data: data.comingSoon.map(m => mapMovie(m, "Sắp khởi chiếu"))
            },
            {
                type: "MOVIE_CAROUSEL",
                title: "BOM TẤN HÀNH ĐỘNG",
                data: data.action.map(m => mapMovie(m, "Hành động"))
            },
            {
                type: "MOVIE_CAROUSEL",
                title: "LÃNG MẠN NGỌT NGÀO",
                data: data.romance.map(m => mapMovie(m, "Tình cảm"))
            },
            {
                type: "RANKING",
                title: "TOP PHIM MỚI NHẤT",
                icon: "🔥",
                data: data.ranking.map(m => mapMovie(m, "Hot"))
            },
            {
                type: "MOVIE_CAROUSEL",
                title: "KINH DỊ RÙNG RỢN",
                data: data.horror.map(m => mapMovie(m, "Kinh dị"))
            },
            
            {
                type: "EVENT_BANNER",
                data: {
                    title: "TUẦN LỄ PHIM MIỄN PHÍ",
                    desc: "Ưu đãi đặc biệt dành cho thành viên mới đăng ký trong tháng này.",
                    bgImage: "images/free-event-bg.jpg",
                    btnText: "NHẬN VÉ NGAY"
                }
            },
            {
                type: "NEWS_LIST",
                title: "TIN TỨC ĐIỆN ẢNH",
                data: [
                    { title: "Review 'Mai': Trấn Thành phá kỷ lục", date: "20/02/2026", image: "images/news1.jpg" },
                    { title: "Deadpool 3 hé lộ trailer cực bựa", date: "18/02/2026", image: "images/news2.jpg" },
                    { title: "Oscar 2026: Những ứng cử viên sáng giá", date: "15/02/2026", image: "images/news3.jpg" }
                ]
            },
            {
                type: "MEMBERSHIP_INFO",
                data: [
                    { name: "STAR", price: "0đ", type: "standard", benefits: ["Tích điểm", "Quà sinh nhật"] },
                    { name: "GOLD", price: "199k", type: "gold", benefits: ["Giảm 10%", "Free bắp nước"] },
                    { name: "DIAMOND", price: "499k", type: "diamond", benefits: ["Giảm 20%", "VIP Lounge"] }
                ]
            }
        ];

        res.status(200).json(responseBlocks);

    } catch (error) {
        console.error("Lỗi Home Controller:", error);
        res.status(500).json({ message: "Lỗi Server khi lấy dữ liệu trang chủ" });
    }
};