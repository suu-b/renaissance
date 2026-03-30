import getCookie from '../utils/getCookie'

describe('getCookie', () => {
  beforeEach(() => {
    document.cookie = ''
  })

  test('returns the value of the specified cookie', () => {
    document.cookie = 'username=Renaissance'
    expect(getCookie('username')).toBe('Renaissance')
  })

  test('returns null for non-existent cookies', () => {
    document.cookie = 'username=Renaissance'
    expect(getCookie('dateofBirth')).toBeNull()
  })

  test('returns the value of the specified cookie among multiple cookies', () => {
    document.cookie = 'username=Renaissance; accessToken=123'
    expect(getCookie('username')).toBe('Renaissance')
  })

  test('handles cookies with space around = sign', () => {
    document.cookie = 'username = Renaissance; accessToken=123'
    expect(getCookie('username')).toBe('Renaissance')
  })
})