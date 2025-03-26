export const svgAssets = {
    fruits: {
        apple: {
            svg: `<svg viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="8" fill="#e94560"/>
                <path d="M10 2C8 2 7 4 7 4s2-1 3-1 3 1 3 1-1-2-3-2z" fill="#4CAF50"/>
            </svg>`
        },
        banana: {
            svg: `<svg viewBox="0 0 20 20">
                <path d="M4 12c0 4 3 6 6 6s6-2 6-6c0-4-3-8-6-8S4 8 4 12z" fill="#ffeb3b"/>
            </svg>`
        },
        cherry: {
            svg: `<svg viewBox="0 0 20 20">
                <circle cx="8" cy="12" r="6" fill="#f44336"/>
                <circle cx="14" cy="10" r="6" fill="#f44336"/>
                <path d="M8 6c0 0 2-4 6-4" stroke="#4CAF50" fill="none" stroke-width="2"/>
            </svg>`
        },
        strawberry: {
            svg: `<svg viewBox="0 0 20 20">
                <path d="M10 2c-4 0-8 4-8 8s4 8 8 8 8-4 8-8-4-8-8-8z" fill="#e91e63"/>
                <circle cx="7" cy="8" r="1" fill="#fff"/>
                <circle cx="13" cy="8" r="1" fill="#fff"/>
                <circle cx="10" cy="12" r="1" fill="#fff"/>
            </svg>`
        },
        orange: {
            svg: `<svg viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="8" fill="#ff9800"/>
                <path d="M10 4c2 2 2 4 0 6s-2 4 0 6" fill="none" stroke="#ffcc80" stroke-width="1"/>
            </svg>`
        }
    },
    powerUps: {
        doublePoints: {
            svg: `<svg viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="8" fill="#ffeb3b"/>
                <text x="10" y="12" text-anchor="middle" fill="#000" font-size="10">×2</text>
            </svg>`
        },
        speedBoost: {
            svg: `<svg viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="8" fill="#4caf50"/>
                <path d="M6 10l4-4 4 4-4 4z" fill="#fff"/>
            </svg>`
        },
        shield: {
            svg: `<svg viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="8" fill="#2196f3"/>
                <path d="M10 4l5 2v4c0 3-2 6-5 7-3-1-5-4-5-7V6z" fill="#fff"/>
            </svg>`
        }
    }
};