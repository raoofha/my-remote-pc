// Required Modules
const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

// Array of Mime Types
const mimeTypes = {
  // Text Types
  "html" : "text/html",
  "css" : "text/css",
  "js" : "text/javascript",
  // Image Types
  "jpeg" : "image/jpeg",
  "jpg" : "image/jpeg",
  "png" : "image/png",
  "gif" : "image/gif",
  "webp" : "image/webp",
  "svg" : "image/svg+xml",
  "icon" : "image/x-icon",
  // Audio and Video Types
  "webm" : "video/webm",
  "ogg" : "video/ogg",
  "mp4" : "video/mp4",
  "mp3" : "audio/mpeg",
  // Font Types
  "ttf" : "font/ttf",
  "otf" : "font/otf",
  "woff" : "font/woff",
  "woff2" : "font/woff2",
  // Application Types
  "pdf" : "application/pdf"
};

//const hostname = '127.0.0.1';
const hostname = '0.0.0.0';
const port = 9090;

child_process.execSync("git pull origin main --rebase", {stdio:[0,1,2],shell: '/bin/bash'});

// Create Server
const server = http.createServer((req, res) => {
  var _url = url.parse(req.url);
  var uri = _url.pathname;
  var cmd = new URLSearchParams(_url.query).get("cmd");
  var t0 = Date.now();
  child_process.execSync("git pull", {stdio:[0,1,2],shell: '/bin/bash'});
  if(uri==="/index.html" && cmd) 
  {
    console.log(cmd);
    child_process.execSync(`#!/bin/bash
echo '#!/bin/bash' > /dev/shm/cmd.sh

echo 'Q=100' >> /dev/shm/cmd.sh
echo '${cmd}' >> /dev/shm/cmd.sh
echo 'xwd -root -silent | convert -quality $Q xwd:- jpg:/dev/shm/screenshot.jpg' >> /dev/shm/cmd.sh
echo 'echo generating pass' >> /dev/shm/cmd.sh
echo 'openssl rand -base64 -out /dev/shm/pass 128' >> /dev/shm/cmd.sh
echo 'echo encrypting pass' >> /dev/shm/cmd.sh
echo 'openssl rsautl -encrypt -inkey key.pub -pubin -in /dev/shm/pass -out data.p' >> /dev/shm/cmd.sh
echo 'echo encrypting data' >> /dev/shm/cmd.sh
echo 'openssl enc -aes-256-cbc -salt -in /dev/shm/screenshot.jpg -out data -pass file:/dev/shm/pass' >> /dev/shm/cmd.sh
echo 'rm /dev/shm/pass' >> /dev/shm/cmd.sh
echo 'git config user.name "github-actions"'  >> /dev/shm/cmd.sh
echo 'git config user.email "github-actions@github.com"'  >> /dev/shm/cmd.sh 
echo 'git add data data.p' >> /dev/shm/cmd.sh
echo 'git commit -m "[skip ci]"' >> /dev/shm/cmd.sh
echo 'git push origin main' >> /dev/shm/cmd.sh

echo generating pass
openssl rand -base64 -out /dev/shm/pass 128
echo encrypting pass
openssl rsautl -encrypt -inkey keypair.pub -pubin -in /dev/shm/pass -out cmd.p
echo encrypting cmd
openssl enc -aes-256-cbc -salt -in /dev/shm/cmd.sh -out cmd -pass file:/dev/shm/pass
rm /dev/shm/pass
git add cmd cmd.p
git commit -m "[skip ci]"
git push origin main

THEN=$(base64 data.p)
NOW=$(base64 data.p)
while true
do
  sleep 2
  git pull origin main
  NOW=$(base64 data.p)
  if [[ "$NOW" != "$THEN" ]] ;
  then
    echo decrypting data.p
    openssl rsautl -decrypt -inkey ${process.argv[2]} -in data.p -out /dev/shm/pass
    echo decrypting data
    openssl enc -d -aes-256-cbc -in data -out screenshot.jpg -pass file:/dev/shm/pass
    rm /dev/shm/pass
    THEN=$(base64 data.p)
    break
  fi
done
`, {stdio:[0,1,2],shell: '/bin/bash'});
  }
  var t1 = Date.now();
  console.log(t1-t0);
  var fileName = path.join(process.cwd(), unescape(uri)); // Current working directory + uri
  //console.log('Loading ' + uri);
  var stats;

  try {
    stats = fs.lstatSync(fileName);
  } catch(e) {
    // If file not found
    res.writeHead(404, {'Content-Type' : 'text/plain'});
    res.write('404 not Found\n');
    res.end();
    return;
  }

  // Check if file or directory
  if(stats.isFile()) {
    var mimeType = mimeTypes[path.extname(fileName).split('.').reverse()[0]];
    res.statusCode = 200;
    res.setHeader('Content-Type', mimeType);
    var fileStream = fs.createReadStream(fileName);
    fileStream.pipe(res);
  } else if(stats.isDirectory()) {
    res.statusCode = 302;
    res.setHeader('Location', 'index.html');
    res.end();
  } else {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.end('500 Internal Error\n');
  }

});

// Run Server
server.listen(port, hostname, () => {
  console.log('Server running at http://' + hostname + ':' + port + '\n');
});
