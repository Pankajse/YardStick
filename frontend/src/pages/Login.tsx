import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

type DecodedToken = {
    role: string;
    tenantId: string;
    tenantSlug: string;
    exp: number;
};


const Signin = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [msg, setMsg] = useState("")

    const onSubmitHandler = async (e: any) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/auth/login`, {
                email: username, password
            });
            if (response.status === 200) {
                const token = response.data.token;
                localStorage.setItem("token", token);

                const decoded: DecodedToken = jwtDecode(token);
                localStorage.setItem("role", decoded.role);
                localStorage.setItem("tenantId", decoded.tenantId);

                navigate("/notes");
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setMsg(error.response?.data?.msg || "Something went wrong");
            } else {
                setMsg("Network error. Please try again.");
            }
        }
    };


    return (
        <div className='bg-white h-screen w-screen fixed flex flex-col justify-center items-center gap-4 '>
            <h3 className='text-2xl font-semibold '>Log in to your account</h3>
            <form className='flex flex-col gap-3 w-full justify-center items-center p-5'>
                <Input placeholderText='EMAIL' type="text" id="username" value={username} onChange={(e) => { setUsername(e.target.value) }} />
                <Input placeholderText='PASSWORD' type="password" id="password" value={password} onChange={(e) => { setPassword(e.target.value) }} />
                <h6 className='text-sm text-red-600'>{msg}</h6>
                <Button text="Sign In" size="sm" variant="primary" onClick={onSubmitHandler} />
            </form>
        </div>
    )
}

export default Signin