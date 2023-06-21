import express, { Application, Request, Response } from "express";
import { App } from "../../main";
import { promises as fs, default as fsSync } from "fs";
import MarkdownIt from "markdown-it";
import path from "path";
import readline from "readline";


const quotes = [
    "\"you should kill yourself\" - Bypassi",
    "whar?",
    "\"This is one of the only still sane servers actually\" - Mark",
    "run sudo rm -fr /* to remove the french language pack, saves a bunch of disk space",
    "A vegan, anti-vaxxer, linux user, and a femboy walked into a bar. How do I know? They told me.",
    "\"i can't believe square enix managed to make me a fan of eco-terrorism\" - Bideos",
    "L + Segmentation fault (core dumped) + ZSTD-compressed data is corrupt --System halted + Boot device mounted successfully, but /sbin/init does not exist. You are on your own, good luck + cannot access tty terminal - kaitlin",
    "can we ban this guy",
    "boy why are you so ears",
    "12/11 isn't real",
    "what is said in mercury stays in mercury",
    "\"furry porn promotes suicide\" - ThatOneDude80",
    "Two trucks having sex Two trucks having sex My muscles, my muscles Involuntarily flex Two trucks having sex Two trucks having sex My muscles, my muscles Involuntarily flex Two pickup trucks making love American made, built Ford tough Two beautiful murder machines American angels in the sky Grown men cry Two trucks having sex (oh yes) Two trucks having sex (oh yes) My muscles (uh!), my muscles (uh!) Involuntarily flex (huh!) Two trucks, having sex (oh yes) Two trucks, having sex (oh yes) My muscles (uh!), my muscles (uh!) Involuntarily flex (ha!) Right by my side, there's ZZ Top And Robert Z'Dar from Maniac Cop 1, 2, and 3 This barbecue could bring you to your knees And so could these two trucks Two trucks holding hands Two trucks holding hands The passion, the passion Is more than I can withstand Two trucks holding hands Two trucks holding hands The passion, the passion My big fat heart expands Two pickup trucks, one cylinder block Crush my body like a rock So beautiful, no stars tonight Just fireworks and eagles in the sky The Founding Fathers cry Two trucks having sex (oh yes) Two trucks having sex (oh yes) My muscles (uh!), my muscles (uh!) Involuntarily flex Two trucks, having sex (oh yes) Two trucks, having sex (oh yes) My muscles (uh!), my muscles (uh!) Involuntarily! Huh! Flex! (Ya he ya he ya he ya he ya he ya) Two trucks having sex Two trucks having sex My muscles, my muscles Involuntarily flex! Two trucks having sex Two trucks having sex My muscles, my muscles Involuntarily flex! Two trucks (having sex) Two trucks (having sex) Two trucks (having sex, having sex, having sex) Two trucks (having sex) Two trucks (having sex) Two trucks (having sex, having sex, having sex)",
    "At this point, I'd like to take a moment to speak to you about the Adobe PSD format. PSD is not a good format. PSD is not even a bad format. Calling it such would be an insult to other bad formats, such as PCX or JPEG. No, PSD is an abysmal format. Having worked on this code for several weeks now, my hate for PSD has grown to a raging fire that burns with the fierce passion of a million suns. If there are two different ways of doing something, PSD will do both, in different places. It will then make up three more ways no sane human would think of, and do those too. PSD makes inconsistency an art form. Why, for instance, did it suddenly decide that *these* particular chunks should be aligned to four bytes, and that this alignement should *not* be included in the size? Other chunks in other places are either unaligned, or aligned with the alignment included in the size. Here, though, it is not included. Either one of these three behaviours would be fine. A sane format would pick one. PSD, of course, uses all three, and more. Trying to get data out of a PSD file is like trying to find something in the attic of your eccentric old uncle who died in a freak freshwater shark attack on his 58th birthday. That last detail may not be important for the purposes of the simile, but at this point I am spending a lot of time imagining amusing fates for the people responsible for this Rube Goldberg of a file format. Earlier, I tried to get a hold of the latest specs for the PSD file format. To do this, I had to apply to them for permission to apply to them to have them consider sending me this sacred tome. This would have involved faxing them a copy of some document or other, probably signed in blood. I can only imagine that they make this process so difficult because they are intensely ashamed of having created this abomination. I was naturally not gullible enough to go through with this procedure, but if I had done so, I would have printed out every single page of the spec, and set them all on fire. Were it within my power, I would gather every single copy of those specs, and launch them on a spaceship directly into the sun. PSD is not my favourite file format. - xee",
    "I'd just like to interject for a moment. What you're refering to as Linux, is in fact, GNU/Linux, or as I've recently taken to calling it, GNU plus Linux. Linux is not an operating system unto itself, but rather another free component of a fully functioning GNU system made useful by the GNU corelibs, shell utilities and vital system components comprising a full OS as defined by POSIX.Many computer users run a modified version of the GNU system every day, without realizing it. Through a peculiar turn of events, the version of GNU which is widely used today is often called Linux, and many of its users are not aware that it is basically the GNU system, developed by the GNU Project.There really is a Linux, and these people are using it, but it is just a part of the system they use. Linux is the kernel: the program in the system that allocates the machine's resources to the other programs that you run. The kernel is an essential part of an operating system, but useless by itself; it can only function in the context of a complete operating system. Linux is normally used in combination with the GNU operating system: the whole system is basically GNU with Linux added, or GNU/Linux. All the so-called Linux distributions are really distributions of GNU/Linux!",
    "As someone who spends a lot of time on servers, I have come across my fair share of people who like to throw around hurtful words without thinking. One of the more common insults that I have seen is the term \"skid\", which is often used to refer to someone who uses other people's code without developing their own. This is a really unfair and hurtful thing to say to someone, and it can really damage their self-esteem and confidence. - some random dude on irwin :skull:",
    "Cloud, why don't you press up like a girl? It's the only way!",
    `i work on a low income computing environment that goes by the government name of "Dell Chromebook 11 (3100)"<br>
me and a group of my software control certain areas of this device in order to run our illegitimate chromeOS session<br>
we possess:<br>
unregistered chromeOS<br>
stolen software<br>
OS altering upstart units<br>
and only use cycles for computational calculations<br>
if anyone would like to settle any unfinished altercations, i will be more than happy to release my serial number<br>
i would like to warn you, i am a very dangerous person, and i regularly bypass admin restrictions`
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
                    linkify: false,
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
