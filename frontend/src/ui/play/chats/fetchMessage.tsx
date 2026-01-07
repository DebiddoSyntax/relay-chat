import api from "../../../functions/auth/AxiosConfig"

export const fetchAllMessages = async(activeId: number | null) => {
    try{
        const response = await api.get(`/chat/${activeId}/messages/`)
        console.log('fetched mess', response.data)
        return response.data
    }catch(error){
        console.log('fetch messages', error)
        return
    }
}