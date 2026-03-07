'use client'
import React from 'react'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'

function CaptchaWrapper({ children }: { children: React.ReactNode }) {
    return (
        <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE!}>
            {children}
        </GoogleReCaptchaProvider>
    )
}

export default CaptchaWrapper
