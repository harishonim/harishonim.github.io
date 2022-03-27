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

var uploaded = document.getElementById("file");
var dayDrop = document.getElementById("day");
var button = document.getElementById("upload");

var upload = null;

button.addEventListener("click", async () => {
    if (upload == null)
    {
        alert('לא הוגש שום קובץ');
        return;
    }
    
    var auth = getCookie('auth');

    if (auth === "")
    {
      auth = prompt("אנא הכנסו את הסיסמא: ");
      document.cookie = "auth=" + auth;
    }

    octokit = new Octokit({auth});

    var dbData = await getFile('db.json');
    const json = JSON.parse(atob(dbData));

    var first = new Date(json[0]);
    var second = new Date(json[1]);
    first.setHours(0, 0, 0, 0);
    second.setHours(0, 0, 0, 0);
    
    const uploadContent = upload.split("base64,", 2)[1];

    var day = new Date();
    day.setHours(0, 0, 0, 0);

    var today = dayDrop.value == "today";
    if (!today)
        day = day.addDays(1);

    if (day.getTime() == second.getTime())
    {
        // update second
        console.log('update second');
        await setFile('second.docx', uploadContent);
    }
    else if (day.getTime() == first.getTime())
    {
        // update first
        console.log('update first');
        await setFile('first.docx', uploadContent);
    }
    else if (day < first && second < day)
    {
        console.log('swap second with today');
        second = day; // swap second with today
        await setFile('second.docx', uploadContent);
    }
    else if (day > first)
    {
        // swap second with first, swap first with today
        console.log('swap second with first, swap first with today');
        second = first;
        first = day;
        var firstFile = await getFile('first.docx');
        await setFile('second.docx', firstFile);
        await sleep(500);
        await setFile('first.docx', uploadContent);
    }

    const offset = first.getTimezoneOffset()
    first = new Date(first.getTime() - (offset*60*1000))
    second = new Date(second.getTime() - (offset*60*1000))

    var string = '["' + first.toISOString().split('T')[0] + '","' + second.toISOString().split('T')[0] + '"]';
    await sleep(500);
    await setFile('db.json', btoa(string));

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

async function main(content)
{
    /*const path = "first.docx";
    const contentEncoded = content.split("base64,", 2)[1];//btoa(content);
    //console.log(contentEncoded);

    const sha = await getSHA(path);
    console.log(sha);

    const { data } = await octokit.repos.createOrUpdateFileContents({
      // replace the owner and email with your own details
      owner: "harishonim",
      repo: "harishonim.github.io",
      path: path,
      message: "updated " + path + ". " + new Date().toLocaleString(),
      content: contentEncoded,
      sha: sha,
      committer: {
        name: `Octokit Bot`,
        email: "amir.rave@gmail.com",
      },
      author: {
        name: "Octokit Bot",
        email: "amir.rave@gmail.com",
      },
    });*/

    console.log(data);
}
