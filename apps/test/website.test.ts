// we can also use supertest to test the API but with this we can not test the rust backend for testing.
import {describe,it,expect,beforeAll} from "bun:test";
import axios from "axios";
import { createUser } from "./utils/user_creation";
import { BACKEND_URL } from "./config";

let BASE_URL = "http://localhost:3000";

describe("Website gets created", () => {

  let id_:String;
  let token:String;


  beforeAll(async()=>{
    const data = await createUser();
    id_ = data.id;
    token =data.jwt ;
  })

  // URL is not present:
  it("Website not created if url is not present", async () => {
    try {
        const response = await axios.post(`${BASE_URL}/website`, {
          
        },{
            headers:{
                Authorization: `Bearer ${token}`
            }
        });
        expect(false, "Website created when it shouldnt");
    } catch (error) {

    }
  });


  // Authenticated URL present:
    it("Website is created if url is present", async () => {
      console.log("token------------------------------------------------------------------------------", token);
      const response = await axios.post(`${BACKEND_URL}/website`, {
          url: "https://google.com11"
      },{
          headers:{
              Authorization: `Bearer ${token}`
          }
      }
      )
      expect(response.data.id).not.toBeNull();
  })



  // UnAthenticated
  it("Website is not created if Headers are not present", async () => {
    try {
      const response = await axios.post(`${BASE_URL}/website`,{
        
        url: "https://www.google.com"
      })
      expect(false, "Website shouldnt be created if no auth header");
    } catch (error) {
      console.log(error);
    }
  });
});