const fs = require('fs');
const { execSync } = require('child_process');
const sleep = (ms => new Promise(res => setTimeout(res, 1000)));

// execSync executes shell commands
// & in a shell command - execute several commands after each other
// & : - end with a null command, thus not throwing errors
// back in Node.js even if there is an error in the shell command

async function doIt() {
  while (1) {
    await sleep(5000);
    let watch = [];
    try {
      watch = JSON.parse(fs.readFileSync('./watch.json', 'utf-8'));
    } catch (e) { }
    for (repo of watch) {
      // execute silently in a certain folder
      let options =  {stdio : 'pipe', cwd: repo.repoPath}
      execSync(`git fetch & :`, options); 
      // do two pulls in a row
      let a = execSync(`cd "${repo.repoPath}" & git pull & :`, options).toString();
      let b = execSync(`cd "${repo.repoPath}" & git pull & :`, options).toString();
      if(a !== b){
        // something updated between pulls so do npm install
        // and then restart app
        execSync(`npm install & :`, options);
        execSync(`pm2 restart "${repo.pm2Name}" & :`, options);
        console.log(`restarting ${repo.pm2Name}`)
      }
    }
  }
}

doIt();