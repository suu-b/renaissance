export const showProfileImage = (userID, setImgURL) => {
    fetch(`${import.meta.env.VITE_API_USER_URI}/get-profile-image/${userID}`)
        .then(response => {
            return response.blob()
        })
        .then(blob => {
            const url = URL.createObjectURL(blob)
            setImgURL(url)
        })
        .catch(error => console.log(error))
}