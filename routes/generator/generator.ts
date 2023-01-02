import express, { Application, Request, Response } from "express";
import { App } from "../../main";
import { promises as fs, default as fsSync } from "fs";
import MarkdownIt from "markdown-it";
import path from "path";
import readline from "readline";
import { RequestType } from "../../clienttypes";
var data = {
    goals: ["unenroll", "unenroll without crosh", "disable filters", "remove extensions", "enable developer mode", "install linux", "unblock sites", "downgrade"],
    verbs: ["bruteforce", "hack", "bypass", "run the unenroll script on", "use LTBEEF on", "playstore bypass", "crack", "bypass", "ddos", "rm -rf", "use a bookmarklet on", "exploit", "remove", "uninstall", "downgrade"],
    nouns: ["crosh shell", "about:blank page", "proxy", "bookmarklet", "chromebook", "website", "extension", "extension page", "skid", "shim", "enrollment chip", "goguardian", "filter", "servers", "luphoria", "RWFW partition"],
    patterns: ["if you want to <goal>, first <verb> the <noun>, then restart and you should be set",
        "yeah so you want to <verb> the <noun>, you don't want to <verb> the <noun>",
        "...that's not how it works. if you want to <goal> the only way to do that is to <verb> the <noun>",
        "why do you want to <goal>? just <verb> the <noun> to <goal>",
        "sure just <verb> the <noun>",
        "to <goal>, you need to <verb> the <noun>",
        "if you <verb> the <noun> that breaks the <noun> so we want to <verb> the <noun> to <goal> instead",
        "uhh yeah <noun> is better just do <verb> to do <goal>"]
};

export default {
    path: "generator",
    route: async (state: App, req: Request, res: Response) => {
        res.render("generator.ejs", {
            data
        });
    },
    listeners: [],
    api: [{
        path: "/gen",
        type: RequestType.GET,
        route: async (state: App, req, res) => {
            res.send(generate())
        },
    },],
};
Array.prototype["rand"] = function () {
    return this[Math.floor(Math.random() * this.length)]
}
function generate() {
    let pattern = data.patterns["rand"]();
    let i = 0;
    while (i < pattern.length) {
        let char = pattern[i];

        let buffer = "";
        if (char == "<") {
            let repstart = i;
            while (char != ">") {
                i += 1;
                char = pattern[i];
                buffer += char;
            }
            buffer = buffer.substring(0, buffer.length - 1) + "s";
            let sub = data[buffer].rand() //yeah  yeah yeah ik
            pattern = pattern.substring(0, repstart) + sub + pattern.substring(i + 1)
        }
        i += 1;
    }
    return pattern
}