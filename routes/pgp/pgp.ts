import { Request, Response, Express } from "express";
import { App } from "../../main";

export default {
  path: "pgp",
  route: (state: App, req: Request, res: Response) => {
    res.setHeader("X-Robots-Tag", "noindex");
    // // res.setHeader("Content-Type", "text/plain");
    // res.setHeader('content-type', 'text/plain');
    // res.set('content-type', 'text/plain')
    // res.type("txt");
    res.contentType("text/plain");
    res.sendFile(global.rootDir + "/pgp.txt");

  },
  listeners: [],
  api: [],
  //   seopage: `
  // CoolElectronics (:3) <me@coolelectronics.me>
  // 04411967894A5ECAEE967FCBF63593D168636C50
  //
  // -----BEGIN PGP PUBLIC KEY BLOCK-----
  // mQGNBGRxdM0BDADGial/kBGT1OeEvO+GyLlCPbfxaOy6cN9sz5OryEIi7EeIMlju
  // avCYKjx/KglsyQnboT72xRk1qNGAueqVSIxwvmXQoEkv5uA6TiBECynxbdr/D6ju
  // dqWamZqGA5TOkumbbRC+1zjM6acaWnMxwljzvMA1kLgKeN3r02Dr33/Qza/1QPVZ
  // lHQeOuvu/Q2/4TAwojmI3N70ynM6cxEw2MmPf0a/SEeCM23ugmr5CY64qF7zPuyJ
  // VKcjUH9F6tRQmChGCJ5bA16WQZ5mZdrVGWcq4WnssHG3huqNlBnGywmQOm3y8XeB
  // kQ7A/LEw/kTyUfBgZ7AqJOY6CPDwkVwu1SN9DCWbkH5JCWdIHR+iTe9a/bvMXJEn
  // zdfd1lZLyX4lpGuZbKpKQKx00J5SsgntAJhnGYQclxryocBabbIaf8DzBaae4BF8
  // Xms//4kuEls5PaxiED5ZLH9OnzDHAv8zb0c92UO4vDXiEfDI7eeI0wSI861cD9ok
  // 2NhUx0w71GQJUGMAEQEAAbQsQ29vbEVsZWN0cm9uaWNzICg6MykgPG1lQGNvb2xl
  // bGVjdHJvbmljcy5tZT6JAc4EEwEIADgWIQQEQRlniUpeyu6Wf8v2NZPRaGNsUAUC
  // ZHF0zQIbAwULCQgHAgYVCgkICwIEFgIDAQIeAQIXgAAKCRD2NZPRaGNsUAIWC/wJ
  // XIoXxoC5u57aAEqUavd0BtQI1Qtd9ELH2A1YK4RGQF/pUjG0ki0MSWW3ad4fzwzn
  // FiHWYRH0Ar79pP0Z112KsTRB+fcP8KhEZ6ufSm83mv2FOuAgIYZ1QeYp4AOyd7mK
  // dMuv31h98JiYX5L4v/N9d8juMl3Lqu8VWFCtloRw+YNJYoCEFmxkMuWDAJ28vXak
  // VcbLVFQNaBThCFPBOcQaA0TSHO2X2X1BsEYLzkPhmhZ4aXskY23JcWPebHE75a7k
  // zuwpqPu/iMf0Rk6nJMoXRUYCs/cCEQPMQoxNcWxaD68EzSDGOs+cnWEFnFVhmQa3
  // j3R3yx9JMd46rPUH99WvTkA8E71WYjTEJ+ok4uQG9be1OhqqqO3BnzCpa9bVOAWw
  // 6r3n/BsemTJIlP64hEuYTJZyeDNxzSkEXwZFVXoDg6BqNObfRei0+KW2AttIPxoq
  // GGffcYrc3JNp5MGsledDZINdiae+jQtXZX91ScFtICaktaeR7bys0kocbxDnRnC5
  // AY0EZHF0zQEMALSXBDeKocR7LBE+RZFTR7zm5ANtnch2v2A/PPEeJBrP4XrnQy8G
  // sxOpsbKGuPl4xbmoBCVKUqyaSP0YGwlrZ0c6/I+fukUOMMcReQsiEueIm6qCQN9y
  // +IGtXibgSjRnmK0sE/umc0GTQYWtV9DVuzMhSMoPhZvOCiIr7ZE73rmouvx6qq5f
  // nVkO8T+mHZ7Tu0DAt3tAzvVdAoJB3vwi88kZdm1foFfX2FQIynsEvDjOk5ARPsdF
  // /8iwy9atVNZ6DiN67515A7rOl22O67ewop+yCDgkstmn8CCgwugUUBnQ0i9AKgqP
  // LyqSULFzTDmg8INIbACzmApIuKCxz23zZ7HUXRs+Zy4JQtjt0ziqnUWyat7m282n
  // jw48U5tSyrg0lWbnMkWuGL35/5RcRFxA+Mh/MOo/9IDPwX3jpV1ajzz2Kv2/Vr0G
  // dve/3E6RaY9xUO3qygHhzMrshXRhOVLw+TWw/ve9kPAfmCuWda/mORbAL255MEcL
  // Pgp9Hwg+yvdzjwARAQABiQG2BBgBCAAgFiEEBEEZZ4lKXsruln/L9jWT0WhjbFAF
  // AmRxdM0CGwwACgkQ9jWT0WhjbFDfvQv9Gr1Tw1mPON6fTK2f9JSQzLfWv0lsuzKe
  // u6AzcL9prnO7R1KDuuqRW2w6KYlFqj0OmwApJtljinPlp184lkcplOBug9R2pV8X
  // m8+9MvERSKDyDykFOEz7qBgQS11InyysQnGaqfaMDmrOVL52RsctCIK8JpGorpyE
  // yMDNMjr2RH0KRBYy8tW7Tt5N0n1LGG6oT8RLGVxe3MG3WjSV1lDbQZJHo/01vHoM
  // wZvAuA9RGy1cvNEyWwZXZqZ9JfjdwgYTmAv04QtVxwaOyU+46siywIp7rPPfSCbN
  // zqOpDlO3bDHLQIk4CbKXrkIgIWghkmkMt1LM0rUg9mFGXY54CRQZpC2/4KcIp29N
  // hOdnac1warHWmCWHEtlTf2OTpcCzRCIfR9m5inrCMxyL1pbr5OZEe+xwxI9r0Qig
  // GZvbob6A+W9WUe9+gGokC6lzOI9rEc+ufNw4nStNRO2qRKzBcf8UU01uyepD+e37
  // iwG8PNyPmZeA974DCeOZcsEmmWBSXRMq
  // =+rPZ
  // -----END PGP PUBLIC KEY BLOCK-----
  // `
}
