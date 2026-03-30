export const getDisplayPicture = async (userID) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_USER_URI}/get-profile-image/${userID}`)
        if (!response.ok) {
            console.log("Failed to get any response")
            return null
        }
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        return url
    }
    catch (error) {
        console.log("Error getting the profile images", error)
        return null
    }
}

