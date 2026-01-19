import { useAuth } from "../auth/Store"
import { OverviewDataProps } from "../types/ChatType";

export const handlePrivateChatName = (isGroup: boolean, chat: OverviewDataProps | undefined) => {
    const user = useAuth((state)=> state.user)
        if(isGroup || !chat){
            return
        }

        const otherUser = chat?.users?.find(
            (u) => u.id !== user?.id
        )
        return `${otherUser?.firstname} ${otherUser?.lastname}`.trim() || otherUser?.email
    }