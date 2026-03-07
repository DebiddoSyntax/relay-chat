import SetPassword from "@/src/ui/authpages/SetPassword"
import ResetPassword from "@/src/ui/authpages/reset/ResetPassword"

function resetpassword() {
    return (
        <div>
            <SetPassword reset={true}/>
        </div>
    )
}

export default resetpassword
