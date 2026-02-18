"use client"
import { ImSpinner9 } from "react-icons/im";

function LoadingPage() {
  return (
    <div className="h-[70vh] overflow-hidden">
      <div className="flex item-center py-40 h-full overflow-hidden text-primary mx-auto gap-6">
        <ImSpinner9 size={70} className="animate-spin m-auto"/>
      </div>
    </div>
  )
}

export default LoadingPage