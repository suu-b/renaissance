import getDateFromISO from "../utils/getDateFromISO";

describe('getDateFromISO', () => {
    test('returns MMMM do, yyyy format for ISO format', () => {
        const isoString = '2024-06-28T12:00:00Z'
        const expectedFormat = 'June 28th, 2024'
        expect(getDateFromISO(isoString)).toBe(expectedFormat)
    })

    test('returns null for non-string input', () => {
        const isoString = 12345
        expect(getDateFromISO(isoString)).toBeNull()
    })
    
    test('returns null for any error in conversion', () => {
        const isoStringWithWrongFormat = '2:00:00'
        expect(getDateFromISO(isoStringWithWrongFormat)).toBeNull()

    })
})