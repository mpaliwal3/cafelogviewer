# cafelogviewer
to start node server
npm start

ClientSide Javascript
cafelogviewer.js - all the client side javascript logic to display logs
common.js - library functions

Server Side
index.jade - html page template
index.js - server side javascipt

install docker
sudo apt-get install docker
sudo apt-get install docker.io

# run in a docker
1. git pull https://github.com/mpaliwal3/cafelogviewer.git
2. cd cafelogviewer
3. docker build -t &lt;your username&gt;/cafelogviewer .
4. docker run -p 80:80 -d &lt;your username&gt;/cafelogviewer
5. docker ps

