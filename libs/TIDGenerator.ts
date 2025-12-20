
const S32_CHAR = '234567abcdefghijklmnopqrstuvwxyz'

/**
 * TID (Timestamp Identifier) Generator
 * Based on AT Protocol implementation
 * Format: <timestamp><clock_id>
 */
export class TIDGenerator {
    private static lastTimestamp = 0
    private static clockId = Math.floor(Math.random() * 32)

    public static next(): string {
        // 1. Get current time in microseconds
        // Note: Javascript Date.now() is ms. We multiply by 1000.
        // We add a random jitter or counter to ensure monotonicity within the ms if needed,
        // but for client-side simple usage just using random is fine.
        let timestamp = Date.now() * 1000

        // Ensure monotonicity locally (optional but good practice)
        if (timestamp <= this.lastTimestamp) {
            timestamp = this.lastTimestamp + 1
        }
        this.lastTimestamp = timestamp

        // 2. Encode timestamp (53-bit integer mostly safe in JS, but 64-bit needed for full range?
        // Date.now()*1000 is ~1.7e15, which is < 2^53 (9e15). Safe to use number.
        const timeStr = this.s32encode(timestamp)

        // 3. Generate random clock/worker ID (2 chars)
        // We just use random for client uniqueness
        const clockStr = this.s32encode(Math.floor(Math.random() * 32 * 32)).padStart(2, '2')

        // Pad timestamp to 11 chars (standard TID length is 13 total usually?)
        // Standard TID: 13 chars.
        // Timestamp part is usually 11 chars.
        return timeStr.padStart(11, '2') + clockStr
    }

    private static s32encode(i: number): string {
        let s = ''
        while (i > 0) {
            const c = i % 32
            i = Math.floor(i / 32)
            s = S32_CHAR[c] + s
        }
        return s
    }
}
