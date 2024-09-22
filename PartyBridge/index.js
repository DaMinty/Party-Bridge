/// <reference types="../CTAutocomplete" />
import request from "../requestV2"

// Utils
const prefix = "&7[&9PartyBridge&7]&r"
const line = ChatLib.getChatBreak("&m-")

let toggled = false;
let mode = 0;

// Post
register('messageSent', (message, event) => {
    if (mode !== 2) return
    if (message.startsWith("/") || !toggled) return
    cancel(event)
    console.log("Canceled message, requested message")
    request({
        url: "http://127.0.0.1:5000/postdata",
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: {
            "message": message
        }
    })
    .catch((error) => {
        ChatLib.chat("Error: " + error.message);
    });
    setTimeout(() => {
        ChatLib.chat(`${prefix} &fSent message through PartyBridge`)
    }, 200)
})

// Recieve
let lastUpdate = 0;
const checkServer = register("tick", () => {
    if (mode != 1) {
        checkServer.unregister();
        return;
    }
    if (Date.now() - lastUpdate > 100 && toggled) {
        lastUpdate = Date.now();
        console.log("Checking for messages!")
        request({
            url: "http://127.0.0.1:5000/getmessage",
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            let data = JSON.parse(response);
            if (data.message) {
                console.log("Sent found message")
                ChatLib.say(data.message);
                ChatLib.chat(`${prefix} &8&o${data.message}&r &fSent from localhost`);
            }
        })
        .catch((error) => {
            ChatLib.chat("&cError while polling for messages: " + error.message);
        });
    }
}).unregister()


// Commands
const suggest =  "&8|| &eClick to Suggest Command"
register("command", (...args) => {
    const subCommand = args[0] == undefined ? undefined : args[0].toLowerCase();
    const subCommand2 = args[1] == undefined ? undefined : args[1].toLowerCase();

    switch (subCommand) {
        // case undefined:
        //     Settings.openGUI();
        //     break
        case 'help':
            new Message(
                new TextComponent(`&7${line}`), `\n`,
                new TextComponent(`&5List of commands: &8(&c&o* &r&7= Required&8)`), `\n`,
                new TextComponent(`&d/pcb help`).setHover("show_text", `&dShows this help block ${suggest}`).setClick("suggest_command", `/pcb help`), `\n`,
                new TextComponent(`&d/pcb toggle`).setHover("show_text", `&dAdd a emoji ${suggest}`).setClick("suggest_command", `/pcb toggle`), `\n`,
                new TextComponent(`&d/pcb mode &f[&dnone&f|&dunmute&f|&dmute&f]&c&o*`).setHover("show_text", `&dMode for the bridge  ${suggest}`).setClick("suggest_command", `/pcb mode`), `\n`,
                new TextComponent(`&7${line}`)
            ).chat()
            break
        case 'toggle':
            toggled = !toggled
            ChatLib.chat(`${prefix} ${toggled ?  "&aToggle: Enabled" : "&cToggle: Disabled"}`)
            break
        case 'mode':
            args.shift();
            switch (subCommand2) {
                case "0":
                case "none":
                case "unselect":
                case "off":
                    args.shift();
                    mode = 0
                    ChatLib.chat(`${prefix} &aMode: unselected`)
                    checkServer.unregister()
                    break;
                case "1":
                case "reciever":
                case "sender":
                case "receiving":
                case "unmute":
                case "unmuted":
                    args.shift();
                    mode = 1
                    ChatLib.chat(`${prefix} &aMode: receiving`)
                    checkServer.register()
                    break;
                case "2":
                case "post":
                case "posting":
                case "mute":
                case "muted":
                    args.shift();
                    mode = 2
                    ChatLib.chat(`${prefix} &aMode: posting`)
                    checkServer.unregister()
                    break;
                case undefined:
                default:
                    ChatLib.chat(`${prefix} &cUnknown subcommand for mode. Use /pcb help for a list of arguments.`)
                }
            break
        case undefined:
        default:
            ChatLib.chat(`${prefix} &cUnknown subcommand. Use /pcb help for a list of commands.`)
            break
    }
}).setName("pcb").setAliases("pcbridge").setAliases("partychatbridge")