import axios from "axios";
import { API, RequestType } from "../clienttypes";
export default async function call<Req, Res = any>(
  api: API,
  body: Req | null = null
): Promise<Res> {
  let resp = (
    await axios.request({
      url: "/api/" + api.route + api.path,
      method: api.type == RequestType.GET ? "get" : "post",
      data: body,
    })
  ).data;

  if (resp.error) {
    console.error(resp.error);
    console.error("server trace: " + resp.trace);
    throw new Error();
  }
  // failure as an alternative
  return resp;
}
