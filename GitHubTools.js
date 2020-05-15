// get the month day year from the github date strings and return a Date object
function extractDate(d) {
  // catch already existing date objects
  if ( typeof d != 'string') {
    return d
  }
  var year=parseInt(d.slice(0,4),10)
  var mon=parseInt(d.slice(5,7),10)-1 //I don't understand this...
  var day=parseInt(d.slice(8,10),10)
  return new Date(year,mon,day);
}

function checkDate() {
 var str='2016-12-09T15:27:41Z'
 var d=extractDate(str)
 //Logger.log(str+ ' :::::: '+d) 
}

function getIssues() { 
  
  var issues=[]
  var milestones=milestoneList()
  var releases=releaseList()
  for ( var r in releases) {
    m = releases[r]
    var myTok=auth()
    issues[m]=[]
    //Logger.log(m);
    //Logger.log(milestones[m]);

    var data=[]
    for ( var page =1 ; page<100; page++ ) {
      var urlIssues="https://api.github.com/repos/cms-sw/cmssw/issues?state=open&milestone="+milestones[m]+"&per_page=100&page="+page;
      urlIssues=urlIssues
      var dataT = getJSONFromURL(urlIssues,myTok);
      data=data.concat(dataT)
      if ( dataT.length != 100 ) break
    } 
    
    for ( var key in data ) {
      var pullRequest = data[key]['pull_request'];
      var prNum=0;
      for ( var key2 in pullRequest ) {
        if ( key2 == 'url' ) {
          prNum=pullRequest[key2]
        }
      }
      //Logger.log('PR is '+prNum)
      if (prNum == 0) {
        Logger.log("Nonsense prNum "+pullRequest)
        continue;
      }
      var sp=prNum.split('/');

      prNum=sp[sp.length-1];

      tIssue={}
      tIssue['prNum']=prNum
      tIssue['title']=data[key]['title']
      //Logger.log('Title is '+tIssue['title'])
      tIssue['date']=data[key]['created_at']
      //Logger.log('Date is '+tIssue['date'])
      tIssue['labels']=[]
      tIssue['user']=data[key]['user']['login']

      var labels = data[key]['labels']
      for ( var label in labels) {
        tIssue['labels'].push(labels[label]['name']);
      }
      issues[m].push(tIssue)
      //Logger.log('Labels are '+issues[m][prNum]['labels'])
      //for ( var label in issues[m][prNum]['labels'] ) {
      //  Logger.log(issues[m][prNum]['labels'][label])
      //}
    }
  }
  
  return issues;
}

function getNewReleases(orpDate) {
  var myTok=auth()
  var data=[]
  for ( var page =1 ; page<100; page++ ) {
    relUrl='https://api.github.com/repos/cms-sw/cmssw/releases?per_page=100&page='+page;    
    
    var t = getJSONFromURL(relUrl,myTok);

    var len=0;
    for ( var i in t ) {
      data[len+100*(page-1)]=t[i];
      len=len+1;
    }
    if ( len != 100 ) break;
  }

  var len=0;
  for ( var i in data) {
    len=len+1;
  }
  //Logger.log('Found releases '+len)

  newReleases=[]
  for (var rel in data) {

    var rDate=extractDate(data[rel]['published_at'])
    if ( days_between(rDate,orpDate) > -2 ) {
      newReleases.push( [data[rel]['tag_name'], rDate] )
    }
  }
  
  //for ( var rel in newReleases ) {
  //  Logger.log(newReleases[rel])
  //}
  return newReleases;
}

function getGitHubDetails(lastORPDate) {
  var cache = CacheService.getScriptCache();
  //get the list of releases made since the last orp
  //returned as tuples of name, date made  
  var releasesStr = null//cache.get('releaseInfo')
  var releases=null
  if ( releasesStr == null ) {
    //Logger.log('refrething releases list')
    releases=getNewReleases(lastORPDate)
    //for ( var r in releases ) {
    //  Logger.log('Found a release ',r)
    //}
    Logger.log(JSON.stringify(releases))
    cache.put('releaseInfo',JSON.stringify(releases),6*3600)
  }
  else{
    Logger.log('Using cashed release information')
    Logger.log(releasesStr)
    releases=JSON.parse(releasesStr)
    //for ( var r in releases ) {
    //  Logger.log('Found a release ',r)
    //}
  }
  //get the list of all issues pending in github
  var issuesStr= null//cache.get('issuesInfo')
  var issues=null
  if ( issuesStr == null ) {
    //Logger.log('refreshing issues list')
    issues=getIssues()
    issueList=[]
    for ( var i in issues) {
      cache.put('issuesInfo'+i,JSON.stringify(issues[i]),6*3600)
      //Logger.log(JSON.stringify(issues[i]).length)
      //Logger.log(JSON.stringify(issues[i]))
      issueList.push(i)      
    }
    cache.put('issuesInfo',JSON.stringify(issueList),6*3600)    
  }
  else{
    //Logger.log('Using cached issue information')
   // Logger.log(issuesStr)
    issuesList=JSON.parse(issuesStr)
    issues=[]
    for ( var i in issuesList) {
      var tStr=cache.get('issuesInfo'+issuesList[i])
      //Logger.log('Found milestone '+issuesList[i])
      //Logger.log(tStr)
      issues[issuesList[i]]=JSON.parse(tStr)
      var c=0
      for ( var it in issues[issuesList[i]]) {
        c=c+1
      }
      //Logger.log('Found '+c+' issues in '+issuesList[i])
        
    }
  }
  return [releases,issues]
}

//to make the needed library 
// - create a separate project (File->New->Project)
// - impcement these two functions with your tokens returned as strings (return 'lbhaadfafe')
// - In the new project, File->Manage versions to create a new version
// - In this project, Resources->Libraries->AddLibrary with the project key 
function auth() {
  return MyGitHubAuth.auth()//real token is in separate library
}

function authBett() {
  return MyGitHubAuth.authBett() //real token is in separate library
}

function getRelCache() {
  var cache = CacheService.getScriptCache();
  var releasesStr = cache.get('releaseInfo')
  Logger.log(releasesStr)
  releases=JSON.parse(releasesStr)
  Logger.log(releases)
  Logger.log(releases.length)
  for ( var r in releases ) {
    Logger.log('Found a release ',r)
  }
}

function checkType() {
  var myDate     = new Date().toString(),
      myRealDate = new Date();
  if ( typeof myDate == 'string' ) { Logger.log('good string') }
  if ( typeof myRealDate == 'string' ) { Logger.log('good date') }
  
}

function getPullRequestInfo(pr) { 
  var myTok=auth()
  
  var urlIssues="https://api.github.com/repos/cms-sw/cmssw/pulls/"+pr;  
  var dataT = getJSONFromURL(urlIssues,myTok);
  return dataT;
}

function checkMyTok() {
  var myTok=auth()
  var url="https://api.github.com/rate_limit";  
  var dataT = getJSONFromURL(url,myTok);
  Logger.log(dataT)
  
}

function getPullRequestComments(pr) {
  var myTok=auth()
  var page=1
  var data=[]
  while ( 1 ) {
    var urlIssues="https://api.github.com/repos/cms-sw/cmssw/issues/"+pr+"/comments?page="+page+"&per_page=100"
    var dataT = getJSONFromURL(urlIssues,myTok);
    data=data.concat(dataT)
    if ( dataT.length !=100) break
    Logger.log("Number of comments "+data.length)
    page=page+1
  }
  //for ( var i in data) {
  //  Logger.log("New comment")
  //  Logger.log(data[i]['body'])
  //}
  return data
}

function getPullRequestCommits(pr) {
  var myTok=auth()
  var urlIssues="https://api.github.com/repos/cms-sw/cmssw/pulls/"+pr+"/commits"
  var data = getJSONFromURL(urlIssues,myTok);
  //Logger.log(data.length)
  return data
}

function getPullRequestFiles(pr) {
  var myTok=auth()
  var urlIssues="https://api.github.com/repos/cms-sw/cmssw/pulls/"+pr+"/files"
  var data = getJSONFromURL(urlIssues,myTok);
  return data
}

function closeIssue(pr) {
  var myTok=authBett()
  var options = {
    'method' : "post",
    'contentType': 'application/json',
    'payload' : JSON.stringify({'state' : "closed"}),
    'headers' : myTok['headers']
  };
  var response = UrlFetchApp.fetch("https://api.github.com/repos/cms-sw/cmssw/issues/"+pr, options);
  var json = response.getContentText();
  Logger.log(json)
}

function addComment(pr,comment) {
  var myTok=authBett()
  var options = {
    'method' : "post",
    'contentType': 'application/json',
    'payload' : JSON.stringify({'body' : comment}),
    'headers' : myTok['headers']
  };
  Logger.log(options)
 
  var response = UrlFetchApp.fetch("https://api.github.com/repos/cms-sw/cmssw/issues/"+pr+"/comments, options);
  var json = response.getContentText();
  Logger.log(json)
}

function makePullRequest(orig,dest,title, comment) {
  Logger.log(orig)
  Logger.log(dest
            )
  Logger.log(title)
  Logger.log(comment)
  var body = {
    "title": title,
    "body": comment,
    "head": orig,
    "base": dest
  }
  var myTok=authBett()
  var options = {
    'method' : "post",
    'contentType': 'application/json',
    'payload' : JSON.stringify(body),
    'headers' : myTok['headers']
  };

  Logger.log(options)
  
  var response = UrlFetchApp.fetch("https://api.github.com/repos/cms-sw/cmssw/pulls", options);
  var json = response.getContentText();
  Logger.log(json)
}

function createFile(repo,filePathAndName,branch,contents) {
  var body = {
    "path": filePathAndName,
    "message": "Creating new file",
    "content": contents,
    "branch": branch
  }
  var myTok=authBett()
  var options = {
    'method' : "put", 
    'payload' : body,
    'headers' : myTok['headers']
  };
  
  var response = UrlFetchApp.fetch("https://api.github.com/repos/"+repo+"/contents", options);
  var json = response.getContentText();
}

function testCreateFile() {
  createFile("davidlange6/testing","test.1","master","Hi there\n")
}

