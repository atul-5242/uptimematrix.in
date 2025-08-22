// we can also use supertest to test the API but with this we can not test the rust backend for testing.
import {describe,it,expect,beforeAll} from "vitest";
import axios from "axios";
import { createUser } from "./utils/user_creation";
import { BACKEND_URL } from "./config";

let BASE_URL = "http://localhost:3000";

describe("Website gets created", () => {
  let token:String;

  beforeAll(async()=>{
    const data = await createUser();
    token =data.jwt ;
  })

  // URL is not present:
  it("Website not created if url is not present", async () => {
    try {
        const response = await axios.post(`${BASE_URL}/website/websiteCreate`, {
          
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
      const response = await axios.post(`${BACKEND_URL}/website/websiteCreate`, {
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
      const response = await axios.post(`${BASE_URL}/website/websiteCreate`,{
        
        url: "https://www.google.com"
      })
      expect(false, "Website shouldnt be created if no auth header");
    } catch (error) {
      console.log(error);
    }
  });
});



// New test are start:

describe("Can fetch websites", () => {
    let token1 : String;
    let token2 : String;
    let userId1 : String;
    let userId2 : String;
    beforeAll(async () => {
        const data1 = await createUser();
        const data2 = await createUser();
        token1 = data1.jwt;
        token2 = data2.jwt;
        userId1 = data1.id;
        userId2 = data2.id;
    });

    it("Is able to fetch a website that the user created",async () => {
      // This websiteRepose part is done because we here create website and easily pass to the get request
      // for getting the website response back easily. 
      const websiteResponse = await axios.post(`${BACKEND_URL}/website/websiteCreate`, {
        url: "https://www.google.com"
      }, {
          headers: {
              Authorization: `Bearer ${token1}`
          }
      });

      const getWbesiteResponse = await axios.get(`/website/${BACKEND_URL}/status/${websiteResponse.data.id}`, {
          headers: {
              Authorization: `Bearer ${token1}`
          }
      });
      expect(getWbesiteResponse.data.id).toBe(websiteResponse.data.id);
      expect(getWbesiteResponse.data.userId).toBe(userId1);
    })

    it("Can't access website created by other user",async () => {
      const websiteResponse = await axios.post(`${BACKEND_URL}/website/websiteCreate`, {
        url: "https://www.google.com"
      }, {
          headers: {
              Authorization: `Bearer ${token1}`
          }
      });
      try {
          const getWbesiteResponse = await axios.get(`/website/${BACKEND_URL}/status/${websiteResponse.data.id}`, {
            headers: {
                Authorization: `Bearer ${token2}`
            }
          });
          expect(false, "Should not be able to access website created by other user");
      } catch (error) {
        console.log(error);
      }
    })
});