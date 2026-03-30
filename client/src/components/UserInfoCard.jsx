import getUserDetails from "../utils/getUserDetails"
import { showProfileImage } from "../utils/getProfileImage"
import { useState, useEffect } from "react"

function UserInfoCard() {
    const [profileImage, setProfileImage] = useState("'")
    const userID = getUserDetails("userID")
    useEffect(() => {
        showProfileImage(userID, setProfileImage)
    }, [])
    const userName = getUserDetails('userName')
    const userMail = getUserDetails('email')
    return (
        <div className="flex w-fit items-center">
            <img src={profileImage} alt="default-profile" className="w-14 mr-3 rounded-full" />
            <div className="lg:block hidden ">
                <p className="text-base">{userName}</p>
                <p className="text-[12px]">{userMail}</p>
            </div>
        </div>
    )
}

export default UserInfoCard
