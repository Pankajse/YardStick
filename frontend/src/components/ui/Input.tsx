import React from 'react'

const Input = ({placeholderText, type, id , value , onChange}:{
    placeholderText : string;
    type : string;
    id : string;
    value : string;
    onChange : (e: React.ChangeEvent<HTMLInputElement>) => void
}) => {
    return (
        <div className='rounded-lg bg-[#ede9e9] flex flex-col p-1  mx-5 w-full max-w-92  focus-within:outline-2 focus-within:outline-black '>
            <label htmlFor={id} className=' hover:cursor-pointer text-xs font-normal text-[#808080] px-2  '>{placeholderText}</label>
            <input id={id} type={type} value={value} onChange={onChange} className='  outline-0 px-2 py-1  ' />
        </div>
    )
}

export default Input