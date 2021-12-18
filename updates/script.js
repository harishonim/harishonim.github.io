import { Octokit } from "https://cdn.skypack.dev/@octokit/rest";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
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

async function getSHA(path) {
    const result = await octokit.repos.getContent({
      owner: "harishonim",
      repo: "harishonim.github.io",
      path,
    });
  
    const sha = result?.data?.sha;
  
    return sha;
}

async function getFile(path)
{
    const resp = await octokit.repos.getContent({
        owner: "harishonim",
        repo: "harishonim.github.io",
        path,
    });

    return resp.data.content;
}

async function setFile(path, content)
{
    const sha = await getSHA(path);

    const { data } = await octokit.repos.createOrUpdateFileContents({
      owner: "harishonim",
      repo: "harishonim.github.io",
      path: path,
      message: "updated " + path + ". " + new Date().toLocaleString(),
      content: content,
      sha: sha,
      committer: {
        name: `Octokit Bot`,
        email: "amir.rave@gmail.com",
      },
      author: {
        name: "Octokit Bot",
        email: "amir.rave@gmail.com",
      },
    });
}

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

var octokit;

var encrypedPassword = "U2FsdGVkX1/nLXF5tdA83utHA+gsOFHvO/zTWVysPZ/AACi6bdl8Sm5PGZrgYIZLQHwaqHD+pnr4JKwfr8u69Q==";

var uploaded = document.getElementById("file");
var dropDown = document.getElementById("day");
var button = document.getElementById("upload");

var upload = null;

button.addEventListener("click", async () => {
    if (upload == null)
    {
        alert('לא הוגש שום קובץ');
        return;
    }
    
    var auth = getCookie('auth');

    if (auth === "" || auth.startsWith("ghp"))
    {
      auth = prompt("אנא הכנסו את הסיסמא: ");
      document.cookie = "auth=" + auth;
    }

    var decryptedBytes = CryptoJS.AES.decrypt(encrypedPassword, auth);
    var password = decryptedBytes.toString(CryptoJS.enc.Utf8);
	console.log(password);

    octokit = new Octokit({password});

    var isDaily = dropDown.value == "daily"
	const uploadContent = upload.split("base64,", 2)[1];

    if (isDaily)
    {
		setFile("first.docx", uploadContent);
    }
	else
	{
		setFile("weekly.docx", uploadContent);
	}

    document.getElementById("submitScreen").style = "display: none;";
    document.getElementById("doneScreen").style = "";
});

uploaded.addEventListener("change", evt => {
    var file = evt.target.files[0]
    var reader = new FileReader();

    reader.onload = () => {
        upload = reader.result;
    }

    reader.readAsDataURL(file);
}, false);