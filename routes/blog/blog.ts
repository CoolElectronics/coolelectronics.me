import express, { Application, Request, Response } from "express";
import { App } from "../../main";
import { promises as fs, default as fsSync } from "fs";
import MarkdownIt from "markdown-it";
import path from "path";
import readline from "readline";


const quotes = [
    "\"you should kill yourself\" - Bypassi",
    "i can't believe big ore lied to me",
    "whar?",
    "\"This is one of the only still sane servers actually\" - Mark",
    "run sudo rm -fr to remove the french language pack, saves a bunch of disk space"
]


export default {
    path: "blog",
    init: async (state: App, app: Application) => {
        app.use("/blog/", async (req: Request, res: Response, next) => {
            if (req.path == "/" || req.path.includes("/static/")) return next();
            try {
                let file = await fs.readFile(path.join(global.rootDir, "/blog", req.url + ".md"))
                let nloc = file.indexOf("\n");
                let props = JSON.parse(file.toString().substring(0, nloc));
                let raw = file.toString().substring(nloc);
                let md = new MarkdownIt({
                    html: true,
                    linkify: true,
                    typographer: true
                });
                let content = md.render(raw);

                let allPosts = await readdirChronoSorted(path.join(global.rootDir, "blog"), -1);
                let thisIndex = allPosts.indexOf(req.url.substring(1) + ".md");
                console.log(+ ".md")
                console.log(allPosts);
                console.log(thisIndex);

                let prev = thisIndex > 0 ? await getPreview(allPosts[thisIndex - 1]) : null;
                let next = thisIndex < allPosts.length - 1 ? await getPreview(allPosts[thisIndex + 1]) : null;

                console.log(prev);
                console.log(next);
                res.render("blog.ejs", {
                    content,
                    props,
                    prev,
                    next
                });
            } catch (e) {
                console.log(e);
                res.redirect("/404");
            }
        });
    },
    route: async (state: App, req: Request, res: Response) => {
        let dirs = await readdirChronoSorted(path.join(global.rootDir, "blog"));
        let previews: any[] = [];
        for (let dir of dirs) {
            previews.push(await getPreview(dir));
        }

        await state.db.modifyOneProp("Misc", { type: "blogcounter" }, "counter", (p) => p + 1);
        let counter = (await state.db.getOne("Misc", { type: "blogcounter" }))!.counter;

        res.render("bloglist.ejs", {
            quote: quotes[Math.floor(Math.random() * quotes.length)],
            num: counter,
            posts: previews
        });
    },
    listeners: [],
    api: [],
};

async function getPreview(filename: string) {
    let stream = fsSync.createReadStream(path.join(global.rootDir, "blog", filename))
    let rl = readline.createInterface({
        input: stream,
        crlfDelay: Infinity,
    })
    let props;
    for await (const l of rl) {
        props = JSON.parse(l);
        break;
    }
    props.url = "/blog/" + filename.split(".")[0];

    return props;
}

//https://stackoverflow.com/questions/10559685/using-node-js-how-do-you-get-a-list-of-files-in-chronological-order
async function readdirChronoSorted(dirpath, order = 1) {
    const files = await fs.readdir(dirpath);
    const stats = await Promise.all(
        files.map((filename) =>
            fs.stat(path.join(dirpath, filename))
                .then((stat) => ({ filename, mtime: stat.mtime }))
        )
    );
    return stats.sort((a, b) =>
        order * (b.mtime.getTime() - a.mtime.getTime())
    ).map((stat) => stat.filename);
}
