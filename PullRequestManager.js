function runTests() {

  var prList=getIssues()
  var trustedNames=['Teemperor','davidlange6','rekovic','franzoni','slava77','threus','rappoccio','fwyzard','makortel','ggovi','Sam-Harper','jan-kaspar','bsunanda',
                    'dildick','Dr15Jones','Martin-Grunewald','davidlt','fabozzi','mmusich','perrozzi','mandrenguyen','mtosi','wddgit','rovere','mverzett',
                    'dmitrijus','boudoul','perrotta','bendavid','kkotov','silviodonato','makortel', 'mrodozov']
  
  for ( var relIssues in prList ) {
    Logger.log("Evaluate "+relIssues)
    var prs=prList[relIssues]
    for ( var i in prs ) {
      var testPending = prs[i]['labels'].indexOf('tests-pending')
      if ( testPending < 0 ) {
        continue
      }
      
      var auth = trustedNames.indexOf(prs[i]['user'])
      if ( auth < 0 ) {
        continue
      }

      var codeChecksOk = prs[i]['labels'].indexOf('code-checks-approved')
      //Logger.log("Look "+i+" " + auth+" " + testPending)
      if ( auth > -1 && testPending > -1 && codeChecksOk > -1) {
        Logger.log("Start tests for " + prs[i]['prNum'])
        addComment(prs[i]['prNum'],"please test")
        //return
      }
    }
  }
                    
}

function filesWithPRs() {

  var prList=getIssues()
  var relList=releaseList()
  var lastRel=relList[relList.length-1]

  var allFiles=[]  
  Logger.log(lastRel)
  for ( var i in prList[lastRel] ) {
    var prNum=prList[lastRel][i]['prNum']
    var files = getPullRequestFiles(prNum)    
    //Logger.log("PR "+prNum)
    if ( files.length > 200 ) { 
      continue 
    }
    for ( var j in files ) {
      var ending = files[j]['filename'].split('.').pop();
      if ( ending == "cc" || ending == "h" ) {
        allFiles.push(files[j]['filename'])
      }
      //Logger.log("file "+files[j]['filename'])
    }
  }
  listOf=""
  for ( var i in allFiles) {
    Logger.log(allFiles[i])
    listOf=listOf+allFiles[i]+"\n"
  }
  
  var recipient = Session.getActiveUser().getEmail();
  var subject = 'A list of files to avoid';
  var body = Logger.getLog();
  MailApp.sendEmail(recipient, subject, listOf);
  //Logger.log(allFiles)
}


function testPR() {
  prList=[ 21535, 21502,21484 ]
  for ( var i in prList) {
    var pr = prList[i]
    Logger.log(pr)
    addComment(pr,"merge")
    //closeIssue(pr)
  }
}

function checkPRs() {
  var prList=getIssues()
  
  for ( var relIssues in prList ) {
    Logger.log("Evaluate "+relIssues)
    var prs=prList[relIssues]
    for ( var i in prs ) {
      
      var details=getPullRequestInfo(prs[i]['prNum'])
      if  ( details['mergeable']== false ) {
        informNonMergeable(prs[i]['prNum'],details['updated_at'])
      }
    }
  }
}

function informNonMergeable(pr,updated) {
  Logger.log(pr+" is not mergeable")
  var comments=getPullRequestComments(pr)
  var dUp = getLastCommitDate(pr) //extractDate(updated)
  var needsMessage=1
  for ( var i in comments) {
    //Logger.log("comment "+comments[i]['user']['login'])
    if ( comments[i]['user']['login'] != 'davidlange6' )  { continue }
    var body = comments[i]['body']
    //Logger.log(body)
    if ( (body.indexOf("Your PR is unmergeable.") < 0 ) ) { continue }
    var dComment = new Date(comments[i]['updated_at'])//extractDate(comments[i]['updated_at'])
    if ( dComment > dUp ) { needsMessage=0 }
  }
  if ( needsMessage == 1 ) {
    Logger.log("I should add a message")
    //Logger.log("Last comment is "+dComment)
    //Logger.log("Last commit is "+dUp)
    addComment(pr,"Your PR is unmergeable. Please have a look and possibly rebase it.")
  }
}

function testInform() {
  informNonMergeable(19560,'dud')
}

function getLastCommitDate(pr) {
  var d=getPullRequestCommits(pr)
  //Logger.log(d)
  var lastDate=new Date(1)
  for ( var i in d) {
    var c=d[i]['commit']['author']['date']
    var cDate=new Date(c)
    if ( cDate > lastDate ) { lastDate=cDate}
    //Logger.log(c)
    //Logger.log(cDate)
  }
  //Logger.log(lastDate)
  return lastDate
}

// next ideas
// github
// warn and then close old PRs
// tally also rejected PRs

function testPullRequest() {
  testBase="davidlange6:clangTidyCleanT3_"
  test=['ElectroWeakAnalysis','EgammaAnalysis'
       ]

  for ( var i in test ) {
    makePullRequest(testBase+test[i],"master","Clang-tidy checks for "+test[i],"PR to apply clang-tidy checks to all files except those that are a part of open pull requests (as of an hour ago) and files in test directories [assuming tests are ok we'll merge this quickly to avoid conflicts to the extent possible]"
                 )
  }
}