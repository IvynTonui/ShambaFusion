import React from "react";
import { XCircle, CheckCircle, AlertTriangle } from "lucide-react";

const variants = {
    success: {
        icon: <CheckCircle className="h-5 w-5 text-green-600" />,
        bg: "bg-green-100 border-green-400 text-green-700",
    },
    error: {
        icon: <XCircle className="h-5 w-5 text-red-600" />,
        bg: "bg-red-100 border-red-400 text-red-700",
    },
    warning: {
        icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
        bg: "bg-yellow-100 border-yellow-400 text-yellow-700",
    },
};

const Alert = ({ variant = "error", children }) => {
    return (
        <div className={`flex items-center border px-4 py-3 rounded-lg ${variants[variant].bg}`}>
            {variants[variant].icon}
            <span className="ml-3">{children}</span>
        </div>
    );
};

export default Alert;
