import axios from "axios";
import { BACKEND_URL } from "../config";


interface userParameters{
    id:string;
    jwt:string;
}
export async function createUser(): Promise<userParameters>{
    const USER_NAME = Math.random().toString(36).substring(2, 15);

    const signUpResponse = await axios.post(`${BACKEND_URL}/user/signup`, {
        username: USER_NAME,
        password: "password",
    })
    
    const signInResponse = await axios.post(`${BACKEND_URL}/user/signin`, {
        username: USER_NAME,
        password: "password",
    })

    return {
        id: signUpResponse.data.id,
        jwt: signInResponse.data.jwt
    }
}

export async function deleteUser(userId:string, jwt:string){
    await axios.post(`${BACKEND_URL}/user/delete`, {
        id: userId,
        jwt: jwt
    })
}