const fs = require('fs');
const { execSync } = require('child_process');
const sleep = (ms => new Promise(res => setTimeout(res, 1000)));
const silent = {stdio : 'pipe' };

// execSync executes shell commands
// & in a shell command - execute several commands after each other
// & : - end with a null command those not throwing errors
// back in Node.js even if there is an error in the shell command


// The option stored in silent prevents a call to execSynt
// to show the result in the console

async function doIt() {
  while (1) {
    await sleep(5000);
    let watch = [];
    try {
      watch = JSON.parse(fs.readFileSync('./watch.json', 'utf-8'));
    } catch (e) { }
    for (repo of watch) {
      // do two pulls in a row
      let a = execSync(`cd "${repo.repoPath}" & git pull & :`, silent).toString();
      let b = execSync(`cd "${repo.repoPath}" & git pull & :`, silent).toString();
      if(a !== b){
        // something updated between pulls so restart app
        execSync(`pm2 restart "${repo.pm2Name}" & :`, silent);
        console.log(`restarting ${repo.pm2Name}`)
      }
    }
  }
}

doIt();