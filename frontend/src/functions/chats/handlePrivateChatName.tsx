import { useAuth } from "../auth/Store"
import { OverviewDataProps } from "../types/ChatType";

export const handlePrivateChatName = (isGroup: boolean, chat: OverviewDataProps | undefined) => {
    const user = useAuth((state)=> state.user)
    if(isGroup || !chat) return

    const otherUser = chat?.users?.find(
        (u) => u.id !== user?.id
    )

    const returnData = { 
        name: `${otherUser?.firstname} ${otherUser?.lastname}`.trim() || otherUser?.email,
        image_url: `${otherUser?.image_url}`
    }
    return returnData
}