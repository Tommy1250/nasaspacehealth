const fs = require("fs");
const path = require("path");

if(!fs.existsSync(path.join(__dirname, "..", "database", "users.json")))
    fs.writeFileSync(path.join(__dirname, "..", "database", "users.json"), "{}");

/**
 * 
 * @param {string} cookies 
 * @param {string} cname 
 * @returns 
 */
function getCookie(cookies, cname) {
    let name = cname + "=";
    let ca = cookies.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function userExist(cookies) {
    if(!cookies)
        return false;

    const sessionCookie = getCookie(cookies, "session");
    if(sessionCookie.trim() === "")
        return false;
    
    return checkRegisterd(sessionCookie);
    
}

function checkRegisterd(session) {
    const users = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "database", "users.json"), "utf-8"));

    if(users[session])
        return true;

    return false;
}

module.exports = { userExist, getCookie }