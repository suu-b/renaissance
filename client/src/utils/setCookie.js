function setCookie(cookiename, cookieVal, expiryDays) {
    let expires = ""
    if (expiryDays) {
        let date = new Date()
        date.setTime(date.getTime() + (expiryDays * 24 * 60 * 60 * 1000))
        expires = '; expires = ' + date.toUTCString()
    }
    cookieVal = encodeURIComponent(cookieVal)
    document.cookie = cookiename + "=" + cookieVal + expires + ";path=/"
}

export default setCookie