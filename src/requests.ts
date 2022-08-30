import axios, { Axios, AxiosResponse } from "axios";
import { API, RequestType } from "../clienttypes";
export default async function request<Req, Res = any>(
  api: API,
  body: Req | null = null
): Promise<Res> {
  let resp = await raw(api,body);
  if (resp.status == 401) {
    alert(
      "insufficient permissions. Ask CoolElectronics for the required permissions"
    );
  }else if (resp.status != 200){
    alert("wtf");
  }
  if (resp.data.error) {
    console.error(resp.data.error);
    console.error("server trace: " + resp.data.trace);
    throw new Error();
  }
  // failure as an alternative
  return resp.data;
}

export async function raw<Req, Res = any>(
  api: API,
  body: Req | null = null
): Promise<AxiosResponse> {
  return axios.request({
    url: "/api/" + api.route + api.path,
    method: api.type == RequestType.GET ? "get" : "post",
    data: body,
  })
}
