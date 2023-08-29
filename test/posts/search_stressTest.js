import http from 'k6/http';
import { check, sleep } from 'k6';

// import env from "../../.env.json";
const env = JSON.parse(open("../../.env.json"));

export const options = {
  discardResponseBodies: true,
  scenarios: {
    contacts: {
      executor: 'constant-arrival-rate',
      rate: 40,
      timeUnit: '1s',
      duration: '20s',
      preAllocatedVUs: 50,
      maxVUs: 150,
    },
  },
  insecureSkipTLSVerify: true,
};
// test HTTPS
export default function () {
  const res = http.get(
    `https://${env.cacheAddr}/api/${env.apiVer}/posts/search`,
    {
      "headers": {
        "Authorization": "Bearer eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwidHlwIjoiSldUIn0..KUf1X5Xcs_QVZvD-4fKTkg.JtnBuH8eTC1zPIAG1p_gxrSQHjMAk41meo4ZKSvuO_BbpRoygS2vJN3qAT1MOky2_wAu9fz70X2dsRODkgPBREFXhGDERxJLXhShvZcz36A.FcAgLp4SEzsvIPqcZBN9ew"
      },
    }
  );
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}
