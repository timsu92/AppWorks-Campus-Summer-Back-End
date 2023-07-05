import express from "express";
import z from "zod";

export default function(req: express.Request, res: express.Response, next: express.NextFunction): void {
  if(req.headers["content-type"] !== "application/json"){
    res.status(400).send({error: "invalid content type"});
  }

  const bodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
  });

  const parsedReq = bodySchema.safeParse(req.body);
  if(parsedReq.success){
    console.log("registered ", parsedReq.data);
    res.status(200).send("success");
  }else{
    console.warn("fail registering ", req.body);
    console.warn("\treason:\n", parsedReq.error.message);
    res.status(400).send({error: parsedReq.error.message});
  }
}
