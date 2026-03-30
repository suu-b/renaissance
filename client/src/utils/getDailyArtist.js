const getDailyArtist = (items) => {
    const currentDate = new Date();
    const dayOfYear = Math.floor((currentDate - new Date(currentDate.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24)
    const selIndex = dayOfYear % items.length
    return items[selIndex]
}

export default getDailyArtist