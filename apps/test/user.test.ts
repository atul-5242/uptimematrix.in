import axios from "axios";
import { describe, expect, it } from "bun:test";
import { BACKEND_URL } from "./config";

const USER_NAME_RANDOM = Math.random().toString(36).substring(2, 15);

describe("Signup end point", () => {
    it("Is not able to signup if username and password", async () => { 
        try {
            await axios.post(`${BACKEND_URL}/user/signup`, {
                email: USER_NAME_RANDOM,//just writing wrong field here so test failed and that means this testing got succeded
                password: "password"
            })
            expect(false, "Control should not reach here")
        } catch (error) {
            console.log("error", error)
        }
    })
    
    it("Is able to signup if body is correct", async () => { 
        try {
            const respose = await axios.post(`${BACKEND_URL}/user/signup`, {
                username: USER_NAME_RANDOM,//just writing wrong field here so test failed and that means this testing got succeded
                password: "password"
            }) 
            expect(respose.status).toBe(200);
            expect(respose.data.id).toBeDefined();    
        } catch (error) {
            console.log("error", error)
        }
        
    })

});



// Signin end point [Login]
describe("Signin end point", () => {
    it("Is not able to signin if username and password", async () => { 
        try {
            await axios.post(`${BACKEND_URL}/user/signip`, {
                email: USER_NAME_RANDOM,//just writing wrong field here so test failed and that means this testing got succeded
                password: "password"
            })
            expect(false, "Control should not reach here")
        } catch (error) {
            console.log("error", error)
        }
    })
    
    it("Is able to signin if body is correct", async () => { 
        try {
            console.log("username", USER_NAME_RANDOM);
            const respose = await axios.post(`${BACKEND_URL}/user/signin`, {
                username: USER_NAME_RANDOM,//just writing wrong field here so test failed and that means this testing got succeded
                password: "password"
            }) 
            console.log("respose", respose);
            expect(respose.status).toBe(200);
            expect(respose.data.jwt).toBeDefined();  
            console.log("jwt__________________________________________________________", respose.data.jwt);  
        } catch (error) {
            console.log("error", error);
        }
        
    })

});