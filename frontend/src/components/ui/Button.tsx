import { type ReactElement } from 'react'

interface ButtonProps {
  variant: "primary" | "secondary" | "destructive";
  size: "xs" | "sm" | "md" | "lg" | "fit" | "full";
  text: string;
  startIcon?: ReactElement;
  onClick: any;
  disabled? : boolean;
}


const variantStyles = {
  "primary" : "bg-purple-600 hover:bg-purple-700 text-white ",
  "secondary" : "bg-purple-200 hover:bg-purple-300 text-purple-500",
  "destructive" : "bg-red-600 hover:bg-red-700 text-black "
}

const sizeStyles = {
  "xs" : "w-xs",
  "sm" : "w-sm",
  "md" : 'w-md',
  "lg" : "w-lg",
  "fit" : "w-fit",
  "full" : "w-[90%]"
}

const defaultStyles = "py-1 px-4 rounded-lg text-center flex items-center gap-2 justify-center hover:cursor-pointer "

const Button = (props : ButtonProps) => {
  return (
    <button className= {`${variantStyles[props.variant]} ${sizeStyles[props.size]} ${defaultStyles}`}
    onClick={props.onClick}
    >
      {props.startIcon}
      {props.text}
    </button>
  )
}

export default Button