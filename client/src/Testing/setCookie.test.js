import setCookie from "../utils/setCookie";

describe('setCookie', () => {
    beforeEach(() => {
        document.cookie = ''
    })

    test('sets cookie with correct value', () => {
        const cookieName = 'testCookie'
        const cookieVal = 'cookieVal'
        const expiryDays = 5

        setCookie(cookieName, cookieVal, expiryDays)
        const cookie = document.cookie.split("; ").find(row => row.startsWith(cookieName + '='))
        expect(cookie).toBeDefined();
        if (cookie) {
            const val = cookie.split('=')[1]
            expect(decodeURIComponent(val)).toBe(cookieVal)
        }
    })

    test('sets cookie with no expiry provided', () => {
        const cookieName = 'testCookie'
        const cookieVal = 'cookieVal'        
        setCookie(cookieName, cookieVal)
        const cookie = document.cookie.split("; ").find(row => row.startsWith(cookieName + '='))
        expect(cookie).toBeDefined();
        if (cookie) {
            const val = cookie.split('=')[1]
            expect(decodeURIComponent(val)).toBe(cookieVal)
            expect(cookie.includes('; expires=')).toBeFalsy()
        }
    })
})