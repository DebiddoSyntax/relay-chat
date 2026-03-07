import CaptchaWrapper from "@/src/ui/authpages/CaptchaWrapper"
import SignupPage from "@/src/ui/authpages/SignupPage"

function signup() {
    return (
        <div>
            <CaptchaWrapper>
                <SignupPage />
            </CaptchaWrapper>
        </div>
    )
}

export default signup
