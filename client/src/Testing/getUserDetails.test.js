import { jwtDecode } from "jwt-decode";
import getUserDetails from "../utils/getUserDetails";
jest.mock('../utils/getCookie', () => ({
    __esModule: true,
    default: jest.fn()
}))

jest.mock('jwt-decode', () => ({
    jwtDecode: jest.fn()
}))

describe('getUserDetails', () => {
    test('returns user details for the valid token', () => {
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiIxMjM0NTY3ODkwIiwidXNlck5hbWUiOiJSZW5haXNzYW5jZSIsImVtYWlsIjoicmVuQG1haWwuY29tIn0.zCS2UBJf-flmvR0v9KUE2SKvSXllEGi-TlXKavunIFo'
        const mockDecodedToken = {
            "userID": "1234567890",
            "userName": "Renaissance",
            "email": "ren@mail.com"
        }
        jest.requireMock('../utils/getCookie').default.mockReturnValue(mockToken)
        jest.requireMock('jwt-decode').jwtDecode.mockReturnValue(mockDecodedToken)

        expect(getUserDetails('userID')).toBe('1234567890')
        expect(getUserDetails('userName')).toBe('Renaissance')
    })

    test('returns null when no token passed', () => {
        const mockToken = null
        jest.requireMock('../utils/getCookie').default.mockReturnValue(mockToken)
        expect(getUserDetails('userID')).toBeNull()
    })

    test('return null when an internal error occurred', () => {
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiIxMjM0NTY3ODkwIiwidXNlck5hbWUiOiJSZW5haXNzYW5jZSIsImVtYWlsIjoicmVuQG1haWwuY29tIn0.zCS2UBJf-flmvR0v9KUE2SKvSXllEGi-TlXKavunIFo'
        const mockError = new Error("An error occurred")
        jest.requireMock('../utils/getCookie').default.mockReturnValue(mockToken)
        jest.requireMock('jwt-decode').jwtDecode.mockImplementation(() => { throw mockError })

        expect(getUserDetails('userID')).toBeNull()
    })
})