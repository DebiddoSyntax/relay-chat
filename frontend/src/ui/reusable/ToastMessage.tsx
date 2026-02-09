import { useEffect } from "react";
import { IoClose } from "react-icons/io5";


type ToastProps = {
    message: string;
    type: 'success' | 'failure' | 'none'
    onClose: () => void;
};

export default function ToastMessage({ message, onClose, type }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const isSuccess = type === "success";

    return (
        <div className="fixed top-5 right-5 z-50 animate-[slideIn_0.3s_ease-out]">
            <div className={`relative bg-white border-l-4 ${isSuccess ? "border-green-500" : "border-red-500" } px-4 py-3 shadow-lg rounded-md min-w-[260px]`}>
                <p className={`"text-sm font-medium text-green-700"`}>
                    {message}
                </p>

                <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                    {/* ✕ */}
                    <IoClose />
                </button>

                {/* progress bar */}
                <div className={`absolute bottom-0 left-0 h-1 ${isSuccess ? "bg-green-500" : "bg-red-500" }  animate-[shrink_4s_linear_forwards]`}/>
            </div>

            {/* keyframes */}
            <style jsx>{`
                @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateX(20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
                }

                @keyframes shrink {
                from {
                    width: 100%;
                }
                to {
                    width: 0%;
                }
                }
            `}
            </style>
        </div>
    );
}
