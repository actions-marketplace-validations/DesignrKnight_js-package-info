const core = require('@actions/core');
const github = require('@actions/github');
const {Octokit}=require('@octokit/core');
const { exec } = require("child_process");


const makeComment=async (githubToken,url,number,body)=>{
  const octokit=new Octokit({auth:githubToken})
  const newComment = await octokit.request('POST '+url, {    
    issue_number: number,
    body: body
  }).catch(err => {throw err})
  console.log(newComment);
}


try {
  // `who-to-greet` input defined in action metadata file
  const dir = core.getInput('node_dir');
  const time = (new Date()).toTimeString();
  core.setOutput("time", time);

  const githubToken = core.getInput('GITHUB_TOKEN');

  const url=github.context.payload.pull_request.comments_url.substr(22);
  if (github.context.payload.pull_request == null) {
      core.setFailed('No pull request found.');
      return;
  }
  const pull_request_number = github.context.payload.pull_request.number;
  //makeComment(githubToken,url,pull_request_number,nameToGreet);
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  //console.log(`The event payload: ${payload}`);
  exec(`depcheck ${dir} && bundle-phobia -p ${dir}package.json`, (error, stdout, stderr) => {
    makeComment(githubToken,url,pull_request_number,stdout);
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
});

} catch (error) {
  core.setFailed(error.message);
}
