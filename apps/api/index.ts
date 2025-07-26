import express from "express";
import {prismaClient} from "store/client"
import { AuthInput } from "./types";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./middleware";
import { url } from "zod";
import { id } from "zod/locales";

const app = express();

app.use(express.json());

app.post("/website", authMiddleware,async (req, res) => {
  if(!req.body.url) {
    return res.status(411).json({message: "URL is required"});
  }
  const website = await prismaClient.website.create({
    data: {
      url: req.body.url,
      timeAdded: new Date(),
      user_id: req.userId!,
    }
  })

  res.json({
    message: "Website added successfully",
    id: website.id,
  });
});

app.get("/status/:websiteId",authMiddleware , async (req, res) => {
  const website = await prismaClient.website.findFirst({
    where:{
      user_id:req.userId!,
      id:req.params.websiteId
    },
    include:{
      ticks:{
        orderBy:[{
          createdAt:"desc"
        }],
        take:1
      }
    }
  })

  if(!website) {
    res.status(409).json({
      message: "Website not found"
    })
    return;
  }


  res.json({
    message: "Website status fetched successfully",
    url: website.url,
    status: website.ticks[0]!.status,
    id: website.id,
    user_id: website.user_id,
  })
});

app.post("/user/signup", async(req, res) => {
  const data = AuthInput.safeParse(req.body);
  if(!data.success) {
    res.status(403).send(""+data.error);
    return;
  }

  try {
    let user =await prismaClient.user.create({
      data: {
        username: data.data.username,
        password: data.data.password,
      }
    })
    res.json({
      message: "User created successfully",
      id: user.id,
    })
  } catch (error) {
    
  }
});

app.post("/user/signin",async (req, res) => {
  const data = AuthInput.safeParse(req.body);
  if(!data.success) {
    res.status(403).send(""+data.error);
    return;
  }
  try {
        let user = await prismaClient.user.findFirst({
          where: {
            username: data.data.username,
            password: data.data.password,
          }
        })
      
        if(user?.password !== data.data.password) {
          res.status(403).send("Invalid username or password");
          return;
        }
        if(user?.username !== data.data.username) {
          res.status(403).send("Invalid username or password");
          return;
        }
        
        let token = jwt.sign({
          sub: user.id,
        },process.env.JWT_SECRET!);

        res.json({
          jwt: token,
          message: "User signed in successfully",
        })
  } catch (error) {

  }
  

});


app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
