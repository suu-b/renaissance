import getDate from "../utils/getDate";

describe('getDate', () => {
    test('return date in ISO format', () => {
        const result = getDate()
        const isoReg = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
        expect(result).toMatch(isoReg)
    })
    
    test('returns null in case of any error', () => {
        const date = jest.spyOn(global.Date.prototype, 'toISOString')
        date.mockImplementation(() => {
            throw new Error("An Error occurred (Mock)")
        })
        const result = getDate()
        expect(result).toBeNull()
        date.mockRestore()
    })
})
