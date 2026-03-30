function getDate() {
    try {
        const currentDate = new Date()
        const currentDateInISO = currentDate.toISOString()
        return currentDateInISO
    }
    catch (error) {
        console.log(error)
        return null
    }
}

export default getDate