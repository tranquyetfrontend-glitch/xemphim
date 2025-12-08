import { HoldRepository } from '../repositories/hold.repository.js';

const HOLD_REPO = new HoldRepository();
const HOLD_DURATION_MINUTES = 5;

export class HoldService{
    async processHold(showtimeId, userId, seatIds){
        await HOLD_REPO.releaseExpiredHolds(showtimeId);
        const currentStatuses = await HOLD_REPO.getSeatsStatus(showtimeId, seatIds);
        const statusMap = new Map();
        currentStatuses.forEach(s => statusMap.set(s.seat_id, s));
        const unavailableSeats = [];
        const seatsToHold = [];
        for (const seatId of seatIds){
            const statusEntry = statusMap.get(seatId);
            if (statusEntry){
                if (statusEntry.status === 'BOOKED'){
                    unavailableSeats.push({ seat_id: seatId, reason: 'Ghế đã được đặt.' });
                    continue;
                }
                if (statusEntry.status === 'HELD' && statusEntry.hold_expires_at > new Date()){
                    unavailableSeats.push({ 
                        seat_id: seatId, 
                        reason: `Ghế đang được giữ tạm thời.` 
                    });
                    continue;
                }
            }
            seatsToHold.push(seatId);
        }
        if (unavailableSeats.length > 0) {
            throw new Error(`Ghế không khả dụng: ${unavailableSeats.map(s => s.seat_id).join(', ')}`);
        }
        const expiresAt = new Date(Date.now() + HOLD_DURATION_MINUTES * 60000); 
        const successfulHolds = [];
        for (const seatId of seatsToHold){
            await HOLD_REPO.holdSeats(showtimeId, seatId, 'HELD', expiresAt);
            successfulHolds.push(seatId);
        }
        return{
            showtime_id: showtimeId,
            held_by_user: userId,
            held_seats: successfulHolds,
            hold_expires_at: expiresAt.toISOString(),
            hold_duration_minutes: HOLD_DURATION_MINUTES
        };
    }
}