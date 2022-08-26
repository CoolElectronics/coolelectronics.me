const App = app();
function app() {
    return {
        editor: null,
        v: true,
        consoleout: "***ZSP PLAYGROUND***<br>",
        init() {
            this.editor = ace.edit("editor");
            this.editor.setTheme("ace/theme/gruvbox");
        },
        execute() {
            try {
                window.run(this.editor.getValue());
            } catch {
                stdout("<p class = \"np cred\">interpreter panicked. check console for error</p>")
            }
        },
        reset() {
            window.reset();
        },
    }
}
window.stdout = (str) => {
    document.querySelector('#container')._x_dataStack[0].consoleout += str.replaceAll("\n", "<br>") + "<br>";

    setTimeout(() => {
        let c = document.getElementById('console')
        c.scrollTop = c.scrollHeight
    }, 20);
}